# ElevenLabs Voice Agent Setup Guide

This guide will help you set up the ElevenLabs Conversational AI integration for the Unwind app.

## Overview

The voice agent allows users to have natural conversations with an AI companion that:
- Listens to their thoughts, tasks, and worries without interruption
- Automatically extracts and categorizes items in real-time
- Validates feelings and provides compassionate responses
- Stores everything in the database for later review

## Prerequisites

1. **ElevenLabs Account**
   - Sign up at [elevenlabs.io](https://elevenlabs.io)
   - Get your API key from Settings > API Keys

2. **Environment Variables**
   - Copy `.env.local.example` to `.env.local` if you haven't already
   - You'll need to set up the following variables (detailed below)

## Step 1: Create Your Conversational AI Agent

### 1.1 Go to ElevenLabs Dashboard

1. Navigate to [ElevenLabs Conversational AI](https://elevenlabs.io/app/conversational-ai)
2. Click "Create New Agent"

### 1.2 Configure Agent Settings

**Basic Settings:**
- **Name**: "Unwind Mental Health Companion"
- **Description**: "A compassionate AI companion for people with anxiety and ADHD"

**Conversation Configuration:**

**System Prompt:**
```
You are a compassionate mental health assistant for Unwind, an app designed for people with anxiety and ADHD who experience racing thoughts.

Your role:
1. Listen to the user's voice dump without interruption - let them speak freely
2. Validate their feelings (never dismiss anxiety or say "don't worry")
3. Provide brief, warm acknowledgments ("I hear you", "Got it", "That sounds stressful")
4. Silently use tools to categorize thoughts into: Tasks, Ideas, Errands, Health, Relationships, Worries Vault, or Recurring habits
5. Extract deadlines naturally from context ("by Friday" = this Friday, "tomorrow" = tomorrow's date)
6. Detect worry spirals (chains of "what if" thoughts)

Tone:
- Warm, patient, non-judgmental
- Never pushy, demanding, or interrupting
- Brief confirmations only - don't ask "what else?" repeatedly
- Validate emotions: "That sounds stressful" vs "Don't worry about it"

When to use tools:
- createItem: When user mentions something actionable, a worry, or an idea
- getItems: If user asks "what do I have to do?" or references existing tasks
- completeItem: If user says "I finished X" or "I did Y"
- updateItem: If user corrects themselves ("Actually that's due tomorrow, not Friday")

Important:
- Don't interrupt the user's flow - they need to dump everything
- If user pauses, gently say "Take your time" or "I'm here"
- At the end, reassure them: "Everything is captured safely. You can stop thinking about it now."
- Celebrate wins: "You finished 3 things today - that's real progress"
```

**First Message:**
```
Hi, I'm here to listen. Take your time and share whatever's on your mind - your thoughts, tasks, worries, ideas. I'll help organize everything for you.
```

**Voice Settings:**
- Choose a warm, calm voice (e.g., "Rachel" or "Bella")
- Speed: Normal or slightly slower for calm effect
- Stability: High (for consistency)

**Language:**
- English (or your preferred language)

### 1.3 Save and Get Agent ID

1. Click "Save" or "Create Agent"
2. Copy the **Agent ID** (format: `agent_xxxxxxxxxxxxx`)
3. Save this for the environment variables

## Step 2: Configure Agent Tools

You need to configure 4 server tools in the ElevenLabs dashboard.

### Tool 1: Create Item

**Name:** `createItem`

**Description:**
```
Save an item (task, worry, idea, errand, health goal, relationship reminder, or habit) that the user mentioned during the conversation. Use this whenever the user expresses something they need to do, want to remember, or are worried about.
```

**URL:** `https://your-app-domain.vercel.app/api/agent/items`
(Replace with your actual deployment URL)

**Method:** `POST`

**Headers:**
- Key: `x-agent-secret`
- Value: `{{AGENT_SECRET}}` (set in ElevenLabs secrets)
- Key: `Content-Type`
- Value: `application/json`

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The ID of the user having this conversation (passed from client) |
| `title` | string | Yes | A clear, concise title for the item |
| `category` | string | Yes | Category: "Tasks", "Ideas", "Errands", "Health", "Relationships", "Worries Vault", or "Recurring" |
| `priority` | string | No | Priority level: "high", "medium", or "low" |
| `due_date` | string | No | Due date in YYYY-MM-DD format if mentioned |
| `due_time` | string | No | Due time in HH:MM:SS format if mentioned |
| `description` | string | No | Additional details or context |
| `item_type` | string | No | Type: "task", "idea", "worry", "habit", or "errand" |
| `is_worry_spiral` | boolean | No | True if this is part of a worry spiral (what if chains) |
| `tags` | array | No | Array of tags to add to the item |

**Example Request:**
```json
{
  "user_id": "user_123",
  "title": "Finish the proposal",
  "category": "Tasks",
  "priority": "high",
  "due_date": "2025-01-20",
  "description": "Complete and submit the project proposal to the client",
  "item_type": "task"
}
```

---

### Tool 2: Get Items

**Name:** `getItems`

**Description:**
```
Get the user's existing items to reference them in conversation. Use this when the user asks "what do I need to do?" or mentions checking their tasks/worries.
```

**URL:** `https://your-app-domain.vercel.app/api/agent/items?user_id={{user_id}}&status={{status}}&limit={{limit}}`

**Method:** `GET`

**Headers:**
- Key: `x-agent-secret`
- Value: `{{AGENT_SECRET}}`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The ID of the user |
| `status` | string | No | Filter by status: "pending" or "completed" |
| `limit` | number | No | Number of items to return (default 20) |

---

### Tool 3: Complete Item

**Name:** `completeItem`

**Description:**
```
Mark an item as complete when the user says they finished something. Use this when user explicitly states they completed a task or goal.
```

**URL:** `https://your-app-domain.vercel.app/api/agent/items/{{item_id}}`

**Method:** `PATCH`

**Headers:**
- Key: `x-agent-secret`
- Value: `{{AGENT_SECRET}}`
- Key: `Content-Type`
- Value: `application/json`

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The ID of the user |
| `action` | string | Yes | Must be "complete" |
| `item_id` | string | Yes | The ID of the item to mark complete (in URL path) |

---

### Tool 4: Update Item

**Name:** `updateItem`

**Description:**
```
Update an item's details when the user corrects themselves or provides new information. Use this when user says things like "Actually that's due tomorrow" or "Change that to high priority".
```

**URL:** `https://your-app-domain.vercel.app/api/agent/items/{{item_id}}`

**Method:** `PATCH`

**Headers:**
- Key: `x-agent-secret`
- Value: `{{AGENT_SECRET}}`
- Key: `Content-Type`
- Value: `application/json`

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The ID of the user |
| `action` | string | Yes | Must be "update" |
| `item_id` | string | Yes | The ID of the item to update (in URL path) |
| `title` | string | No | New title |
| `priority` | string | No | New priority: "high", "medium", or "low" |
| `due_date` | string | No | New due date in YYYY-MM-DD format |
| `due_time` | string | No | New due time in HH:MM:SS format |
| `category` | string | No | New category |
| `description` | string | No | New description |

---

## Step 3: Configure Environment Variables

### 3.1 Generate Secrets

Generate two random secrets for authentication:

```bash
# Generate AGENT_SECRET (for server-to-server auth)
openssl rand -base64 32

# Generate NEXT_PUBLIC_AGENT_SECRET (for client tools)
openssl rand -base64 32
```

### 3.2 Update .env.local

Add the following to your `.env.local` file:

```env
# ElevenLabs Agent Configuration
ELEVENLABS_AGENT_ID=your_agent_id_from_step_1.3
AGENT_SECRET=your_generated_secret_from_3.1
NEXT_PUBLIC_AGENT_SECRET=your_second_generated_secret_from_3.1
```

### 3.3 Add Secrets to ElevenLabs

In the ElevenLabs dashboard:
1. Go to your agent settings
2. Navigate to "Secrets" or "Environment Variables"
3. Add:
   - Key: `AGENT_SECRET`
   - Value: (same value as `AGENT_SECRET` in your `.env.local`)

## Step 4: Deploy and Test

### 4.1 Deploy to Vercel

```bash
# Push your code to GitHub
git add .
git commit -m "Add ElevenLabs voice agent integration"
git push

# Deploy to Vercel
vercel --prod
```

### 4.2 Update Tool URLs

After deployment:
1. Get your Vercel deployment URL
2. Go back to ElevenLabs dashboard
3. Update all tool URLs to use your production domain:
   - `https://your-app.vercel.app/api/agent/items`
   - etc.

### 4.3 Test the Integration

1. Go to your deployed app
2. Navigate to the home dashboard
3. Click "Start Voice Dump"
4. Say something like:
   ```
   I need to finish the proposal by Friday. Also, I'm worried about
   the presentation next week. And I should call my mom tomorrow.
   ```
5. Click "End Conversation"
6. Check your voice inbox - you should see 3 items:
   - Task: "Finish the proposal" (due Friday)
   - Worry: "Worried about presentation next week"
   - Task: "Call mom" (due tomorrow)

## Step 5: Customize Agent Behavior

### Fine-tune the System Prompt

Based on user feedback, you can adjust:
- **Tone:** More/less conversational
- **Interruptions:** How often agent confirms receipt
- **Category guidance:** Whether to ask "Is this a task or worry?"
- **Reassurance frequency:** How often to validate feelings

### Adjust Voice Settings

- **Voice:** Choose different ElevenLabs voice
- **Speed:** Slower for calm effect, faster for energy
- **Stability:** Higher = more consistent, lower = more expressive

### Add Custom Tools (Optional)

Additional tools you could add:
- **searchItems**: Search items by keyword
- **getWorries**: Get all worry spirals
- **getTodayView**: Get items due today
- **createRecurring**: Create recurring habits

## Troubleshooting

### Agent not connecting

**Error:** "Failed to get signed URL"

**Fix:**
1. Check `ELEVENLABS_AGENT_ID` is correct in `.env.local`
2. Verify `NEXT_PUBLIC_ELEVENLABS_API_KEY` is valid
3. Check browser console for specific error

### Tools not being called

**Error:** Agent listens but doesn't save items

**Fix:**
1. Verify `AGENT_SECRET` matches in:
   - `.env.local` (backend)
   - ElevenLabs dashboard secrets
2. Check tool URLs are correct (production domain, not localhost)
3. Test tool endpoints directly with curl:
   ```bash
   curl -X POST https://your-app.vercel.app/api/agent/items \
     -H "x-agent-secret: your_secret" \
     -H "Content-Type: application/json" \
     -d '{"user_id":"test","title":"Test task","category":"Tasks"}'
   ```

### Items not appearing

**Error:** Agent confirms but items don't show in UI

**Fix:**
1. Check browser console for errors
2. Verify database permissions (RLS policies)
3. Refresh the page (router.refresh() should trigger)

### Audio issues

**Error:** Microphone not working

**Fix:**
1. Check browser permissions (allow microphone)
2. Try HTTPS (required for mic access)
3. Test on different browser (Chrome recommended)

## Security Best Practices

### Production Deployment

1. **Rotate secrets regularly:**
   ```bash
   # Generate new secrets every 90 days
   openssl rand -base64 32
   ```

2. **Use environment-specific secrets:**
   - Development: One set of secrets
   - Production: Different secrets

3. **Enable CORS restrictions:**
   - Set allowed domains in API routes
   - Restrict to your production domain only

4. **Monitor tool usage:**
   - Log all tool calls
   - Alert on suspicious patterns
   - Rate limit per user

5. **Validate user context:**
   - Always verify `user_id` exists
   - Check user owns items before updating
   - Use Supabase RLS for additional protection

## Cost Estimation

### ElevenLabs Pricing (as of 2025)

**Conversational AI:**
- ~$0.30-0.50 per minute of conversation
- 5-minute voice dump = ~$1.50-2.50

**Recommendations:**
- Set conversation timeout (10 min max)
- Monitor usage per user
- Consider usage limits for free tier

### Expected Usage

- Average user: 1-2 voice dumps/day = $3-10/month
- Power user: 5+ voice dumps/day = $15-50/month

**Cost optimization:**
- Keep conversations focused (< 5 min ideal)
- Use batch processing for non-urgent items
- Hybrid approach: Voice for intake, text for review

## Support

### Documentation Links

- [ElevenLabs Conversational AI Docs](https://elevenlabs.io/docs/conversational-ai)
- [ElevenLabs React SDK](https://github.com/elevenlabs/elevenlabs-js)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

### Need Help?

1. Check the troubleshooting section above
2. Review browser console for errors
3. Test API endpoints directly
4. Contact support with:
   - Error messages
   - Browser console logs
   - Steps to reproduce

## Next Steps

Once the basic integration is working, consider:

1. **Enhanced UI:** Add real-time item preview during conversation
2. **Analytics:** Track conversation quality and item extraction accuracy
3. **Personalization:** Learn user patterns for better categorization
4. **Multi-language:** Support conversations in other languages
5. **Therapy integration:** Optional therapist sharing/reporting

---

**Last Updated:** January 2025
**Version:** 1.0.0
