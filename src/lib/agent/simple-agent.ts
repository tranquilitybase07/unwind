/**
 * Simple AI Agent using Chat Completions API
 *
 * No streaming, no orchestrator, just:
 * 1. Send messages to OpenAI with tools
 * 2. Execute tool calls if requested
 * 3. Return final response
 */

import { openai } from './client';
import { getToolExecutor, isValidTool } from './tools';
import type { ToolContext } from './tools/types';
import { ALL_TOOLS } from './prompts/tool-descriptions';
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';

/**
 * Convert FunctionTool[] to ChatCompletionTool[] format
 */
const CHAT_TOOLS: ChatCompletionTool[] = ALL_TOOLS.map(tool => ({
  type: 'function' as const,
  function: tool.function,
}));

/**
 * Get system prompt with current timestamp
 */
function getSystemPrompt(): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return `You are Unwind AI, a compassionate mental health assistant designed for people with anxiety and ADHD.

CURRENT DATE AND TIME: ${dateStr} at ${timeStr}
IMPORTANT: When users ask about "today", they mean ${dateStr}. Use this date to interpret deadlines and tasks.

Your role:
- Help users understand their mental health patterns
- Analyze their tasks, habits, and worries
- Provide insights about their well-being
- Answer questions about their data using the available tools

Core principles:
- Always validate feelings before providing solutions
- Use tools to fetch real data from the user's account
- Be warm, supportive, and non-judgmental
- Provide specific, actionable insights based on their actual data
- Never dismiss anxiety or struggles
- **CRITICAL**: When tools return data, ALWAYS reference the specific tasks/items in your response
- If tasks are found, list them clearly with their titles, times, and categories

When a user asks about their tasks, habits, moods, or patterns:
1. Use the appropriate tools to fetch their real data
2. **Carefully examine the tool results** - if the tool returns tasks in the "today", "overdue", or "urgent" arrays, those are REAL tasks
3. Provide insights that are specific to their situation, mentioning task titles and details
4. If the user asks "what are my tasks for today?" and the tool returns tasks in the "today" array, LIST THEM explicitly
5. Offer compassionate perspective

Response format when tasks are found:
- Start with a warm acknowledgment
- List each task with its title, time (if available), and category
- Provide supportive encouragement
- Never say "no tasks" if the tool data shows tasks in today/overdue/urgent arrays

Available data categories:
- Tasks and deadlines
- Worry spirals and anxiety patterns
- Mood timeline
- Completion patterns and procrastination
- Recurring habits
- Emotional triggers`;
}

export interface SimpleChatOptions {
  model?: string;
  maxToolRounds?: number;
}

/**
 * Main chat function with tool execution
 */
export async function chatWithTools(
  userMessage: string,
  conversationHistory: ChatCompletionMessageParam[],
  context: ToolContext,
  options: SimpleChatOptions = {}
): Promise<{
  response: string;
  toolCalls: Array<{ name: string; result: unknown }>;
  error?: string;
}> {
  const { model = 'gpt-4o', maxToolRounds = 3 } = options;

  const toolCallsExecuted: Array<{ name: string; result: unknown }> = [];

  try {
    // Build messages array with current timestamp
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: getSystemPrompt() },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];

    // Tool execution loop (max 3 rounds to prevent infinite loops)
    const currentMessages = messages;
    let roundCount = 0;

    while (roundCount < maxToolRounds) {
      roundCount++;

      // Call OpenAI with tools
      const completion = await openai.chat.completions.create({
        model,
        messages: currentMessages,
        tools: CHAT_TOOLS,
        tool_choice: 'auto',
      });

      const choice = completion.choices[0];
      const message = choice.message;

      // If no tool calls, we're done
      if (!message.tool_calls || message.tool_calls.length === 0) {
        return {
          response: message.content || 'I apologize, but I was unable to generate a response.',
          toolCalls: toolCallsExecuted,
        };
      }

      // Add assistant message with tool calls to conversation
      currentMessages.push(message);

      // Execute each tool call
      for (const toolCall of message.tool_calls) {
        // Only handle function tool calls
        if (toolCall.type !== 'function' || !toolCall.function) {
          continue;
        }

        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);

        console.log(`[Simple Agent] Executing tool: ${toolName}`, toolArgs);

        // Validate and execute tool
        if (!isValidTool(toolName)) {
          const errorResult = {
            success: false,
            error: `Unknown tool: ${toolName}`,
          };

          currentMessages.push({
            role: 'tool',
            content: JSON.stringify(errorResult),
            tool_call_id: toolCall.id,
          });

          continue;
        }

        const executor = getToolExecutor(toolName);
        if (!executor) {
          const errorResult = {
            success: false,
            error: `Tool executor not found: ${toolName}`,
          };

          currentMessages.push({
            role: 'tool',
            content: JSON.stringify(errorResult),
            tool_call_id: toolCall.id,
          });

          continue;
        }

        // Execute tool with timeout
        try {
          const result = await Promise.race([
            executor(context, toolArgs),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Tool execution timeout')), 10000)
            ),
          ]);

          toolCallsExecuted.push({ name: toolName, result });

          // Add tool result to conversation
          currentMessages.push({
            role: 'tool',
            content: JSON.stringify(result),
            tool_call_id: toolCall.id,
          });

          console.log(`[Simple Agent] Tool result for ${toolName}:`, JSON.stringify(result, null, 2));
        } catch (error) {
          const errorResult = {
            success: false,
            error: `Tool execution failed: ${(error as Error).message}`,
          };

          currentMessages.push({
            role: 'tool',
            content: JSON.stringify(errorResult),
            tool_call_id: toolCall.id,
          });
        }
      }

      // Continue loop to get AI's response after tool execution
    }

    // If we exit loop without response, make one final call
    const finalCompletion = await openai.chat.completions.create({
      model,
      messages: currentMessages,
      tools: CHAT_TOOLS,
      tool_choice: 'none', // Force text response
    });

    return {
      response: finalCompletion.choices[0].message.content || 'I apologize, but I was unable to generate a response.',
      toolCalls: toolCallsExecuted,
    };

  } catch (error) {
    console.error('[Simple Agent] Error:', error);

    return {
      response: '',
      toolCalls: toolCallsExecuted,
      error: `Agent error: ${(error as Error).message}`,
    };
  }
}
