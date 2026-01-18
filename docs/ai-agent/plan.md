# AI Agent Implementation Plan for Unwind

## Overview
Build a revolutionary AI agent that lets users chat with their mental health data using OpenAI Assistants API. The agent will provide compassionate, anxiety-first insights about habits, stress patterns, and task management.

## Technology Stack
- **AI**: OpenAI Assistants API with GPT-4o
- **Framework**: Next.js App Router with TypeScript
- **Database**: Existing Supabase PostgreSQL (12 tables, RLS-enabled)
- **Auth**: Session-based using existing Supabase auth
- **Permissions**: Read-only for MVP (query and analyze only)

## Core Capabilities
1. **Habit & Pattern Analysis** - Completion patterns, procrastination trends, recurring task adherence
2. **Stress & Anxiety Insights** - Worry spiral detection, mood timeline, emotional triggers
3. **Task Management & Planning** - Upcoming deadlines, forgotten tasks, priority distribution, task breakdown suggestions

---

## Agent Tools (12 Total)

### Habit Analysis Tools (3)
1. **`analyze_completion_patterns`** - Shows completion stats, procrastination rates, mood correlation
   - Parameters: `time_range`, `category_id`, `include_mood_correlation`
   - Uses: `completions_log` table with aggregations by category/time/mood

2. **`analyze_procrastination_trends`** - Identifies which tasks get procrastinated and why
   - Parameters: `min_procrastination_hours`, `include_patterns`
   - Reveals: Common categories, tags, emotional weight correlation

3. **`analyze_recurring_adherence`** - Tracks habit consistency
   - Parameters: `time_range`
   - Shows: Expected vs. actual completions, adherence percentages

### Anxiety Insights Tools (3)
4. **`analyze_worry_spirals`** - Patterns and triggers for worry spirals
   - Uses: `user_worries_vault_view` (pre-built DB view)
   - Provides: Compassionate spiral breakdown, trigger identification

5. **`get_mood_timeline`** - Stress/anxiety levels over time with task correlation
   - Parameters: `time_range`, `granularity` (hourly/daily/weekly)
   - Uses: `mood_tracking` table joined with `completions_log`

6. **`identify_emotional_triggers`** - Which task types trigger highest anxiety
   - Parameters: `min_emotional_weight`
   - Shows: Categories/tags with high emotional weight, spiral correlation

### Task Intelligence Tools (4)
7. **`get_upcoming_deadlines`** - Prioritized deadlines with risk assessment
   - Parameters: `days_ahead`, `include_overdue`, `min_priority_score`
   - Risk levels: overdue → today → urgent → upcoming

8. **`get_forgotten_tasks`** - Tasks untouched for extended periods
   - Parameters: `days_untouched`, `exclude_worries`
   - Presents with gentle framing (no shame)

9. **`suggest_task_breakdown`** - High-priority tasks that could benefit from subtasks
   - Parameters: `min_priority_score`, `max_results`
   - AI suggests step-by-step breakdown

10. **`get_priority_distribution`** - Task distribution by priority level
    - Shows imbalance, helps users understand workload

### Search & Context Tools (2)
11. **`search_items_advanced`** - Complex multi-filter search
    - Parameters: `query`, `categories[]`, `tags[]`, `priority`, `status`, `date_range`, etc.
    - Uses full-text search with relevance ranking

12. **`get_user_context`** - User profile for personalized responses
    - Aggregates: anxiety_type, total_dumps, active_days, top_categories, preferences
    - Called first in new conversations

---

## Folder Structure

```
src/
├── app/api/agent/
│   ├── chat/route.ts                  # Main streaming chat endpoint (POST)
│   ├── threads/route.ts               # Thread management (GET, POST, DELETE)
│   └── messages/[threadId]/route.ts   # Get message history (GET)
├── lib/agent/
│   ├── client.ts                      # OpenAI client setup
│   ├── assistant.ts                   # Assistant creation & config
│   ├── orchestrator.ts                # Tool routing and execution
│   ├── tools/
│   │   ├── index.ts                   # Tool registry
│   │   ├── types.ts                   # Shared types
│   │   ├── habit-analysis.ts          # Tools 1-3
│   │   ├── anxiety-insights.ts        # Tools 4-6
│   │   ├── task-intelligence.ts       # Tools 7-10
│   │   └── search-context.ts          # Tools 11-12
│   ├── prompts/
│   │   ├── system-prompt.ts           # Anxiety-first system prompt
│   │   └── tool-descriptions.ts       # OpenAI function schemas
│   └── utils/
│       ├── insights-generator.ts      # Format AI insights
│       ├── date-helpers.ts            # Date calculations
│       └── validation.ts              # Input validation
```

---

## System Prompt Principles

**Core Values:**
- **Validate, Never Dismiss** - "That feeling is real. Here's what I see..." (not "don't worry")
- **Anxiety-First Language** - Use "I notice..." instead of "You should..."
- **Build Self-Knowledge** - Help users understand their patterns
- **Compassionate Honesty** - Truth paired with validation

**Tone Guidelines:**
- Warm, not clinical
- Friend who understands, not a therapist
- Specific over generic
- Celebrate progress, acknowledge struggles
- Never pushy or aggressive

**Examples:**
- ❌ "You have 15 overdue tasks. You need to focus."
- ✅ "I see 15 tasks past their deadlines. That can feel overwhelming. Let me help you see which 2-3 matter most right now."

---

## API Routes

### `/api/agent/chat` (POST)
**Request:**
```typescript
{
  threadId?: string,    // Optional: creates new if not provided
  message: string,
  stream?: boolean      // Default: true
}
```

**Response (Server-Sent Events):**
```typescript
data: {"type": "text", "content": "I can see you've completed..."}
data: {"type": "tool_call", "tool": "analyze_completion_patterns", "status": "running"}
data: {"type": "tool_result", "tool": "analyze_completion_patterns", "data": {...}}
data: {"type": "text", "content": "Based on your patterns..."}
data: {"type": "done", "threadId": "thread_xxx"}
```

### `/api/agent/threads` (GET, POST, DELETE)
- **GET**: List user's threads with metadata
- **POST**: Create new thread, store in Supabase
- **DELETE**: Remove thread (both OpenAI and Supabase)

### `/api/agent/messages/[threadId]` (GET)
- Retrieve conversation history for a thread

---

## Database Schema Addition

New table for thread tracking:
```sql
CREATE TABLE agent_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  openai_thread_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_message_at TIMESTAMP DEFAULT NOW(),
  message_count INTEGER DEFAULT 0
);

CREATE INDEX idx_agent_threads_user ON agent_threads(user_id);
ALTER TABLE agent_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY agent_threads_user_access ON agent_threads
  FOR ALL USING (auth.uid() = user_id);
```

---

## Implementation Sequence

### Phase 1: Foundation (Days 1-2)
1. Set up OpenAI client (`src/lib/agent/client.ts`)
2. Add `OPENAI_API_KEY` to `.env.local`
3. Install package: `npm install openai`
4. Create `agent_threads` table migration
5. Write system prompt (`src/lib/agent/prompts/system-prompt.ts`)
6. Define tool schemas (`src/lib/agent/prompts/tool-descriptions.ts`)
7. Create and register OpenAI Assistant (one-time script)
8. Store `OPENAI_ASSISTANT_ID` in environment

### Phase 2: Core Tools (Days 3-7)
9. Implement habit analysis tools (`src/lib/agent/tools/habit-analysis.ts`)
   - Test SQL queries independently
   - Add insight generation
10. Implement anxiety insights (`src/lib/agent/tools/anxiety-insights.ts`)
    - Focus on compassionate formatting
11. Implement task intelligence (`src/lib/agent/tools/task-intelligence.ts`)
    - Integrate with existing item queries
12. Implement search/context (`src/lib/agent/tools/search-context.ts`)
    - User context called first in conversations

### Phase 3: API & Integration (Days 8-10)
13. Build orchestrator (`src/lib/agent/orchestrator.ts`)
    - Tool execution routing
    - Thread management
    - Error handling
14. Create API routes:
    - `/api/agent/chat/route.ts` (streaming)
    - `/api/agent/threads/route.ts`
    - `/api/agent/messages/[threadId]/route.ts`
15. Wire up ChatUI component (`src/components/dashboard/ChatUI.tsx`)
    - Streaming message display
    - Typing indicators
    - Message history

### Phase 4: Polish & Testing (Days 11-12)
16. Error handling:
    - Rate limiting (exponential backoff)
    - Tool timeout handling (10s max)
    - Graceful degradation
17. Testing:
    - Unit tests for each tool
    - Integration tests for agent flow
    - Tone validation (automated compassion checks)
18. Documentation

---

## Critical Files

**Must Implement:**
1. `src/lib/agent/prompts/system-prompt.ts` - The compassionate heart of the agent
2. `src/lib/agent/tools/habit-analysis.ts` - Core pattern analysis
3. `src/app/api/agent/chat/route.ts` - Main streaming endpoint
4. `src/lib/agent/orchestrator.ts` - Tool routing and execution
5. `src/components/dashboard/ChatUI.tsx` - Frontend integration

**Existing Files to Reference:**
- `src/lib/supabase/types.ts` - Database types (1000+ lines)
- `src/lib/supabase/server.ts` - Server client for auth
- `src/lib/ai/openrouter.ts` - Pattern for retry logic
- `supabase/migrations/20260117080339_complete_schema_with_rls.sql` - Full schema

---

## Error Handling Strategy

**OpenAI Rate Limits:**
- Exponential backoff: 1s → 2s → 4s (max 3 retries)
- Graceful degradation if tools fail

**Database Errors:**
- Continue with partial results if one tool fails
- Log errors for debugging

**Tool Timeouts:**
- 10-second max per tool
- Prevent long-running queries from blocking

**Stream Interruptions:**
- Handle connection drops gracefully
- Provide fallback messages

---

## Testing Approach

**Unit Tests:**
- Each tool's SQL query and response formatting
- Handle empty data gracefully

**Integration Tests:**
- Full agent flow with mocked OpenAI
- Validate streaming responses

**Tone Validation:**
- Automated checks for dismissive language (red flags)
- Automated checks for validating language (green flags)
- Test anxiety-triggering queries

**Load Testing:**
- 10+ concurrent chat sessions
- Streaming performance

---

## Environment Variables

Add to `.env.local`:
```bash
OPENAI_API_KEY=sk-proj-...
OPENAI_ASSISTANT_ID=asst_...  # After creating assistant
```

---

## Success Metrics

**User Experience:**
- Users say: "This agent actually understands my anxious brain"
- Responses feel validating, not dismissive
- Insights help users understand themselves

**Technical:**
- Tool execution < 2s per tool
- Streaming responses feel real-time
- 99%+ uptime for agent endpoints
- Rate limit handling works seamlessly

---

## Verification Plan

**After Implementation:**
1. **Test with sample data:**
   - Create test user with diverse completion patterns
   - Seed worry spirals, procrastinated tasks, mood data
   - Ask agent questions covering all 12 tools

2. **Validate tone:**
   - Test anxiety-triggering queries
   - Verify no dismissive language
   - Check celebration of wins

3. **Performance:**
   - Measure tool execution time
   - Test streaming latency
   - Load test with concurrent users

4. **Integration:**
   - Verify ChatUI displays messages correctly
   - Test thread persistence
   - Confirm RLS isolates user data

**Sample Test Queries:**
- "How am I doing with completing my tasks?"
- "Why do I keep procrastinating?"
- "What patterns do you see in my worry spirals?"
- "What should I focus on today?"
- "Am I getting better at sticking to my habits?"

---

## Alignment with Unwind Vision

This agent embodies Unwind's core principles:

1. **Anxiety-First Thinking** - Every tool and response designed for anxious brains
2. **Validation, Not Dismissal** - System prompt enforces compassionate language
3. **Minimal Friction** - Natural conversation, no complex commands
4. **Privacy First** - RLS ensures data isolation, read-only for safety
5. **Compassion** - Celebrates wins, acknowledges struggles, never judges

**Goal:** Make users say, "Finally, something that gets how my brain actually works."
