# AI Agent Setup Guide

## Prerequisites

1. **OpenAI API Key**
   - Sign up at https://platform.openai.com
   - Get API key from https://platform.openai.com/api-keys
   - Add billing to your account (GPT-4o required)

2. **Supabase Database**
   - Database migration should already be applied
   - Table `agent_threads` must exist

## Step-by-Step Setup

### 1. Add OpenAI API Key

Edit `.env.local`:

```bash
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
```

### 2. Apply Database Migration

Run the agent_threads migration:

```bash
# Using Supabase CLI
npx supabase migration up

# Or manually via Supabase Dashboard
# Execute: supabase/migrations/20260118073000_add_agent_threads.sql
```

### 3. Create OpenAI Assistant

Run the assistant creation script:

```bash
npx tsx src/lib/agent/assistant.ts
```

This will output an Assistant ID. Copy it.

### 4. Add Assistant ID to Environment

Add to `.env.local`:

```bash
OPENAI_ASSISTANT_ID=asst_YOUR_ASSISTANT_ID_HERE
```

### 5. Restart Development Server

```bash
pnpm dev
```

## Verify Installation

Test the API endpoints:

```bash
# Create a new thread
curl -X POST http://localhost:3000/api/agent/threads \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Send a message (streaming)
curl -X POST http://localhost:3000/api/agent/chat \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "How am I doing with my tasks?", "stream": true}'
```

## Updating the Assistant

If you make changes to the system prompt or tools:

```bash
# Update with your assistant ID
npx tsx -e "
  import { updateAssistant } from './src/lib/agent/assistant';
  updateAssistant('asst_YOUR_ID').then(() => process.exit(0));
"
```

## Troubleshooting

### Error: "Missing OPENAI_API_KEY"
- Ensure `.env.local` has the key
- Restart dev server after adding

### Error: "Missing OPENAI_ASSISTANT_ID"
- Run the assistant creation script
- Add the ID to `.env.local`
- Restart dev server

### Error: "Failed to create assistant"
- Check OpenAI API key is valid
- Ensure billing is set up on OpenAI account
- Check rate limits

### Database Errors
- Ensure `agent_threads` table exists
- Check RLS policies are enabled
- Verify user is authenticated

## Environment Variables Summary

Required for AI Agent:

```bash
# OpenAI
OPENAI_API_KEY=sk-proj-...
OPENAI_ASSISTANT_ID=asst_...

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Next Steps

1. **Frontend Integration**: Build ChatUI component
2. **Testing**: Test with real user data
3. **Monitoring**: Add Sentry tracking for errors
4. **Optimization**: Monitor token usage and costs

## Cost Estimation

With GPT-4o:
- Input: $2.50 / 1M tokens
- Output: $10.00 / 1M tokens

Typical conversation (10 messages, 3 tool calls):
- ~5,000 tokens input
- ~2,000 tokens output
- Cost: ~$0.03 per conversation

For 1,000 users having 5 conversations/month:
- ~5,000 conversations/month
- ~$150/month

## Security Notes

- Never commit `.env.local` to git
- Rotate API keys regularly
- Monitor usage on OpenAI dashboard
- Set spending limits in OpenAI account
- Use RLS to protect user data
- Agent has read-only access to database
