/**
 * Simple AI Agent Chat API Route
 *
 * POST /api/agent/chat-simple
 * Uses Chat Completions API (not Assistants API)
 * No streaming, simple request-response
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { chatWithTools } from '@/lib/agent/simple-agent';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export const runtime = 'nodejs';
export const maxDuration = 60;

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
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Validate conversation history format
    const validatedHistory: ChatCompletionMessageParam[] = Array.isArray(conversationHistory)
      ? conversationHistory.filter((msg: any) =>
          msg &&
          typeof msg === 'object' &&
          'role' in msg &&
          'content' in msg &&
          ['user', 'assistant'].includes(msg.role)
        )
      : [];

    console.log('[Chat Simple] User message:', message);
    console.log('[Chat Simple] Conversation history length:', validatedHistory.length);

    // Execute chat with tools
    const result = await chatWithTools(
      message,
      validatedHistory,
      {
        supabase,
        userId: user.id,
      }
    );

    // Return error if present
    if (result.error) {
      return NextResponse.json(
        {
          error: result.error,
          response: result.response || 'I apologize, but I encountered an error. Please try again.',
          toolCalls: result.toolCalls,
        },
        { status: 500 }
      );
    }

    // Return successful response
    return NextResponse.json({
      response: result.response,
      toolCalls: result.toolCalls.map(tc => ({
        name: tc.name,
        success: (tc.result as any)?.success ?? false,
      })),
    });

  } catch (error) {
    console.error('[Chat Simple] API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        response: 'I apologize, but something went wrong. Please try again.',
      },
      { status: 500 }
    );
  }
}
