/**
 * AI Agent Messages API Route
 *
 * GET /api/agent/messages/[threadId] - Get message history for a thread
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getMessages } from '@/lib/agent/orchestrator';

/**
 * GET - Get message history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
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

    const { threadId } = await params;

    if (!threadId) {
      return NextResponse.json(
        { error: 'threadId is required' },
        { status: 400 }
      );
    }

    // Verify thread belongs to user
    const { data: thread, error: threadError } = await supabase
      .from('agent_threads')
      .select('id')
      .eq('user_id', user.id)
      .eq('openai_thread_id', threadId)
      .single();

    if (threadError || !thread) {
      return NextResponse.json(
        { error: 'Thread not found or access denied' },
        { status: 404 }
      );
    }

    // Get messages
    const { messages, error } = await getMessages(threadId);

    if (error) {
      return NextResponse.json(
        { error },
        { status: 500 }
      );
    }

    return NextResponse.json({ messages });

  } catch (error) {
    console.error('Messages GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
