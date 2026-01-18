/**
 * AI Agent Chat API Route
 *
 * POST /api/agent/chat
 * Handles streaming chat with the AI agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createThread, sendMessage } from '@/lib/agent/orchestrator';
import type { StreamEvent } from '@/lib/agent/orchestrator';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds max for streaming

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { threadId, message, stream = true } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get or create thread
    let activeThreadId = threadId;

    if (!activeThreadId) {
      const result = await createThread(supabase, user.id);

      if (result.error) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }

      activeThreadId = result.threadId;
    } else {
      // Verify thread belongs to user
      const { data: thread, error: threadError } = await supabase
        .from('agent_threads')
        .select('id')
        .eq('user_id', user.id)
        .eq('openai_thread_id', activeThreadId)
        .single();

      if (threadError || !thread) {
        return NextResponse.json(
          { error: 'Thread not found or access denied' },
          { status: 404 }
        );
      }
    }

    // Handle streaming response
    if (stream) {
      const encoder = new TextEncoder();

      const customReadable = new ReadableStream({
        async start(controller) {
          try {
            await sendMessage(
              activeThreadId!,
              message,
              { supabase, userId: user.id },
              (event: StreamEvent) => {
                // Send event as Server-Sent Event
                const data = `data: ${JSON.stringify(event)}\n\n`;
                controller.enqueue(encoder.encode(data));

                // Close stream on done or error
                if (event.type === 'done' || event.type === 'error') {
                  // Send final threadId
                  const finalEvent = {
                    type: 'thread_id',
                    threadId: activeThreadId,
                  };
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify(finalEvent)}\n\n`)
                  );

                  controller.close();
                }
              }
            );
          } catch (error) {
            const errorEvent: StreamEvent = {
              type: 'error',
              error: (error as Error).message,
            };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`)
            );
            controller.close();
          }
        },
      });

      return new Response(customReadable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Non-streaming response (fallback)
    return NextResponse.json(
      { error: 'Non-streaming mode not implemented' },
      { status: 501 }
    );

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
