/**
 * AI Agent Orchestrator
 *
 * Manages tool routing, execution, and communication with OpenAI Assistants API
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { openai, getAssistantId, withRetry, TIMEOUT_CONFIG } from './client';
import { getToolExecutor, isValidTool } from './tools';
import type { ToolContext, ToolResult } from './tools/types';

/**
 * Execute a tool call from OpenAI
 */
export async function executeTool(
  toolName: string,
  toolArgs: Record<string, any>,
  context: ToolContext
): Promise<ToolResult> {
  const startTime = Date.now();

  // Validate tool exists
  if (!isValidTool(toolName)) {
    return {
      success: false,
      error: `Unknown tool: ${toolName}`,
      metadata: { execution_time_ms: Date.now() - startTime },
    };
  }

  // Get tool executor
  const executor = getToolExecutor(toolName);
  if (!executor) {
    return {
      success: false,
      error: `Tool executor not found: ${toolName}`,
      metadata: { execution_time_ms: Date.now() - startTime },
    };
  }

  try {
    // Execute with timeout
    const result = await Promise.race([
      executor(context, toolArgs),
      new Promise<ToolResult>((_, reject) =>
        setTimeout(
          () => reject(new Error('Tool execution timeout')),
          TIMEOUT_CONFIG.toolExecutionMs
        )
      ),
    ]);

    return result;
  } catch (error) {
    return {
      success: false,
      error: `Tool execution failed: ${(error as Error).message}`,
      metadata: { execution_time_ms: Date.now() - startTime },
    };
  }
}

/**
 * Create a new assistant thread
 */
export async function createThread(
  supabase: SupabaseClient,
  userId: string
): Promise<{ threadId: string; error?: string }> {
  try {
    // Create OpenAI thread
    const thread = await withRetry(
      () => openai.beta.threads.create(),
      'Create OpenAI thread'
    );

    // Store in database
    const { data, error } = await supabase
      .from('agent_threads')
      .insert({
        user_id: userId,
        openai_thread_id: thread.id,
        last_message_at: new Date().toISOString(),
        message_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to store thread in database:', error);
      return { threadId: thread.id, error: error.message };
    }

    return { threadId: thread.id };
  } catch (error) {
    return {
      threadId: '',
      error: `Failed to create thread: ${(error as Error).message}`,
    };
  }
}

/**
 * Send a message to a thread and get streaming response
 */
export async function sendMessage(
  threadId: string,
  message: string,
  context: ToolContext,
  onEvent: (event: StreamEvent) => void
): Promise<void> {
  try {
    const assistantId = getAssistantId();

    // Add message to thread
    await withRetry(
      () => openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: message,
      }),
      'Add message to thread'
    );

    // Create run with streaming
    const run = await withRetry(
      () => openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
        stream: true,
      }),
      'Create run'
    );

    // Process stream
    for await (const event of run) {
      if (event.event === 'thread.message.delta') {
        // Text delta
        const delta = event.data.delta;
        if (delta.content && delta.content[0]?.type === 'text') {
          onEvent({
            type: 'text',
            content: delta.content[0].text?.value || '',
          });
        }
      } else if (event.event === 'thread.run.requires_action') {
        // Tool calls required
        const requiredAction = event.data.required_action;

        if (requiredAction?.type === 'submit_tool_outputs') {
          const toolCalls = requiredAction.submit_tool_outputs.tool_calls;

          // Execute all tool calls
          const toolOutputs = await Promise.all(
            toolCalls.map(async (toolCall) => {
              const toolName = toolCall.function.name;
              const toolArgs = JSON.parse(toolCall.function.arguments);

              onEvent({
                type: 'tool_call',
                tool: toolName,
                status: 'running',
              });

              const result = await executeTool(toolName, toolArgs, context);

              onEvent({
                type: 'tool_result',
                tool: toolName,
                data: result,
              });

              return {
                tool_call_id: toolCall.id,
                output: JSON.stringify(result),
              };
            })
          );

          // Submit tool outputs and continue stream
          const submitRun = await withRetry(
            () => openai.beta.threads.runs.submitToolOutputs(
              threadId,
              event.data.id,
              {
                tool_outputs: toolOutputs,
                stream: true,
              }
            ),
            'Submit tool outputs'
          );

          // Continue processing stream after tool submission
          for await (const submitEvent of submitRun) {
            if (submitEvent.event === 'thread.message.delta') {
              const delta = submitEvent.data.delta;
              if (delta.content && delta.content[0]?.type === 'text') {
                onEvent({
                  type: 'text',
                  content: delta.content[0].text?.value || '',
                });
              }
            } else if (submitEvent.event === 'thread.run.completed') {
              onEvent({ type: 'done' });
            } else if (submitEvent.event === 'thread.run.failed') {
              onEvent({
                type: 'error',
                error: submitEvent.data.last_error?.message || 'Run failed',
              });
            }
          }
        }
      } else if (event.event === 'thread.run.completed') {
        onEvent({ type: 'done' });
      } else if (event.event === 'thread.run.failed') {
        onEvent({
          type: 'error',
          error: event.data.last_error?.message || 'Run failed',
        });
      }
    }

    // Update thread metadata in database
    await context.supabase
      .from('agent_threads')
      .update({
        last_message_at: new Date().toISOString(),
        message_count: context.supabase.rpc('increment', { x: 1 }),
      })
      .eq('openai_thread_id', threadId);

  } catch (error) {
    onEvent({
      type: 'error',
      error: `Stream error: ${(error as Error).message}`,
    });
  }
}

/**
 * Get message history for a thread
 */
export async function getMessages(
  threadId: string
): Promise<{ messages: any[]; error?: string }> {
  try {
    const messages = await withRetry(
      () => openai.beta.threads.messages.list(threadId),
      'Get thread messages'
    );

    return {
      messages: messages.data.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        created_at: msg.created_at,
      })),
    };
  } catch (error) {
    return {
      messages: [],
      error: `Failed to get messages: ${(error as Error).message}`,
    };
  }
}

/**
 * Delete a thread
 */
export async function deleteThread(
  supabase: SupabaseClient,
  userId: string,
  threadId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete from OpenAI
    await withRetry(
      () => openai.beta.threads.del(threadId),
      'Delete OpenAI thread'
    );

    // Delete from database
    const { error } = await supabase
      .from('agent_threads')
      .delete()
      .eq('user_id', userId)
      .eq('openai_thread_id', threadId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Failed to delete thread: ${(error as Error).message}`,
    };
  }
}

/**
 * List user's threads
 */
export async function listThreads(
  supabase: SupabaseClient,
  userId: string
): Promise<{ threads: any[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('agent_threads')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('last_message_at', { ascending: false });

    if (error) {
      return { threads: [], error: error.message };
    }

    return { threads: data || [] };
  } catch (error) {
    return {
      threads: [],
      error: `Failed to list threads: ${(error as Error).message}`,
    };
  }
}

/**
 * Stream event types
 */
export type StreamEvent =
  | { type: 'text'; content: string }
  | { type: 'tool_call'; tool: string; status: 'running' }
  | { type: 'tool_result'; tool: string; data: ToolResult }
  | { type: 'done' }
  | { type: 'error'; error: string };
