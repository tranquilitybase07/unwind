# Unwind AI Agent

**Status**: ✅ Implemented
**Date**: January 18, 2026

## Overview

The Unwind AI Agent is a compassionate mental health companion that helps users understand their anxiety and ADHD patterns through intelligent data analysis.

## Key Features

### 🧠 Anxiety-First Design
- Validates feelings, never dismisses them
- Uses compassionate, non-judgmental language
- Builds self-knowledge instead of offering generic advice

### 📊 12 Intelligent Tools

**Habit Analysis (3 tools)**
1. `analyze_completion_patterns` - Completion rates, mood correlations
2. `analyze_procrastination_trends` - What gets avoided and why
3. `analyze_recurring_adherence` - Habit consistency tracking

**Anxiety Insights (3 tools)**
4. `analyze_worry_spirals` - Spiral patterns and triggers
5. `get_mood_timeline` - Mood tracking over time
6. `identify_emotional_triggers` - High-anxiety task patterns

**Task Intelligence (4 tools)**
7. `get_upcoming_deadlines` - Risk-assessed deadline management
8. `get_forgotten_tasks` - Identify neglected items
9. `suggest_task_breakdown` - AI-powered task decomposition
10. `get_priority_distribution` - Workload analysis

**Search & Context (2 tools)**
11. `search_items_advanced` - Complex multi-filter search
12. `get_user_context` - Personalized user profile (called first)

### 🎯 Example Interactions

**User**: "How am I doing?"

**Agent**: "I can see you've completed 8 out of 15 tasks this week (53% completion rate). That's meaningful work, even if it doesn't always feel like it. I notice you completed 3 tasks yesterday when your mood was higher - that pattern shows you what helps."

**User**: "Why do I keep procrastinating?"

**Agent**: "I see 7 tasks that have been waiting for more than 5 days. Five of them are tagged #work and carry high emotional weight. That's anxiety making it harder to start, not you being lazy. Anxious brains struggle most with tasks that feel heavy."

## Architecture

### Technology Stack
- **AI**: OpenAI Assistants API with GPT-4o
- **Database**: Supabase PostgreSQL with RLS
- **Framework**: Next.js 16 App Router
- **Streaming**: Server-Sent Events (SSE)

### File Structure

```
src/lib/agent/
├── client.ts                    # OpenAI client config
├── assistant.ts                 # Assistant creation/update
├── orchestrator.ts              # Tool routing & streaming
├── prompts/
│   ├── system-prompt.ts         # Compassionate instructions
│   └── tool-descriptions.ts     # OpenAI function schemas
├── tools/
│   ├── index.ts                 # Tool registry
│   ├── types.ts                 # Shared types
│   ├── habit-analysis.ts        # Tools 1-3
│   ├── anxiety-insights.ts      # Tools 4-6
│   ├── task-intelligence.ts     # Tools 7-10
│   └── search-context.ts        # Tools 11-12
└── utils/
    ├── date-helpers.ts          # Date calculations
    ├── validation.ts            # Input validation
    └── insights-generator.ts    # Compassionate formatting

src/app/api/agent/
├── chat/route.ts                # Streaming chat endpoint
├── threads/route.ts             # Thread management
└── messages/[threadId]/route.ts # Message history
```

### Database Schema

```sql
CREATE TABLE agent_threads (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  openai_thread_id TEXT UNIQUE NOT NULL,
  title TEXT,
  last_message_at TIMESTAMP,
  message_count INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### `POST /api/agent/chat`
Send a message and receive streaming response.

**Request**:
```json
{
  "threadId": "thread_abc123",  // Optional
  "message": "How am I doing?",
  "stream": true
}
```

**Response** (Server-Sent Events):
```
data: {"type":"text","content":"I can see you've completed..."}
data: {"type":"tool_call","tool":"analyze_completion_patterns","status":"running"}
data: {"type":"tool_result","tool":"analyze_completion_patterns","data":{...}}
data: {"type":"text","content":"Based on your patterns..."}
data: {"type":"done"}
data: {"type":"thread_id","threadId":"thread_abc123"}
```

### `GET /api/agent/threads`
List user's conversation threads.

### `POST /api/agent/threads`
Create a new conversation thread.

### `DELETE /api/agent/threads?threadId=xxx`
Delete a conversation thread.

### `GET /api/agent/messages/[threadId]`
Get message history for a thread.

## System Prompt Philosophy

The agent's personality is defined by these principles:

### 1. Validate, Never Dismiss
❌ "Don't worry, it's fine"
✅ "That feeling is real. Here's what I see..."

### 2. Anxiety-First Language
❌ "You should focus on..."
✅ "I notice..."

### 3. Build Self-Knowledge
Not advice, but patterns:
"Your completion rate goes up when you break tasks into smaller steps. That's useful data."

### 4. Compassionate Honesty
Truth + empathy:
"You've been avoiding these 3 work tasks for 8 days. I see they all have high emotional weight. Anxiety makes starting harder."

## Performance

- **Tool Execution**: < 2s per tool (target)
- **Streaming Latency**: Real-time (SSE)
- **Rate Limiting**: Exponential backoff (1s → 2s → 4s)
- **Timeout**: 10s max per tool, 60s total

## Security

- ✅ Row-Level Security (RLS) on all tables
- ✅ Read-only database access for agent
- ✅ User authentication required
- ✅ Thread ownership verification
- ✅ No PII in logs

## Testing

**Sample Test Queries**:
- "How am I doing with completing my tasks?"
- "Why do I keep procrastinating?"
- "What patterns do you see in my worry spirals?"
- "What should I focus on today?"
- "Am I getting better at sticking to my habits?"

## Monitoring

Track these metrics:
- Tool execution times
- Token usage (cost)
- Error rates
- User satisfaction (implicit: repeat usage)
- Compassion validation (manual review)

## Future Enhancements

**Phase 2**:
- Voice input/output
- Proactive check-ins
- Weekly summary emails
- Therapist integration (with permission)
- Burnout detection

**Phase 3**:
- Multi-user insights (anonymized)
- Personalized coping strategies
- Integration with mental health apps
- Mobile app with push notifications

## Development

See [setup.md](./setup.md) for installation instructions.

**Quick Start**:
```bash
# 1. Add API key to .env.local
OPENAI_API_KEY=sk-proj-...

# 2. Create assistant
npx tsx src/lib/agent/assistant.ts

# 3. Add assistant ID to .env.local
OPENAI_ASSISTANT_ID=asst_...

# 4. Run dev server
pnpm dev
```

## Support

- **Issues**: Create GitHub issue
- **Questions**: Check docs/ai-agent/
- **API Errors**: Check Sentry dashboard

---

**Built with compassion for anxious brains** ❤️
