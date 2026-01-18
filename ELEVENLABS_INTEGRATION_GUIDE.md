# ElevenLabs Integration Guide for Unwind

## Overview

This guide explains the corrected ElevenLabs integration that follows best practices and uses **dynamic variables** to pass user context instead of database lookups.

## Architecture Flow

```
1. User clicks "Start Voice Dump"
   ↓
2. Frontend → /api/elevenlabs/signed-url (authenticated)
   ↓
3. Backend returns signed URL + user_id
   ↓
4. Frontend starts conversation with:
   - signedUrl
   - dynamicVariables: { user_id }
   ↓
5. User talks to ElevenLabs agent (2-5 min)
   ↓
6. Conversation ends
   ↓
7. ElevenLabs sends webhook to /api/webhooks/elevenlabs
   ↓
8. Webhook extracts user_id from dynamic variables
   ↓
9. AI processes transcript → categorizes into 7 categories
   ↓
10. Items saved to database
```

## Key Changes Made

### 1. **Dynamic Variables Instead of Database Lookup**
- **Before:** Stored `conversation_id → user_id` mapping in `conversation_sessions` table
- **After:** Pass `user_id` in `dynamicVariables` and extract from webhook payload
- **Why:** Eliminates race conditions, simpler architecture, follows ElevenLabs best practices

### 2. **Removed Agent Tools**
- **Before:** Had both real-time agent tools AND webhook processing (duplicates)
- **After:** Only webhook post-processing (simpler, cleaner)
- **Why:** You chose post-conversation processing approach

### 3. **Proper HMAC Verification**
- Webhook handler verifies `ElevenLabs-Signature` header
- 30-minute timestamp tolerance to prevent replay attacks
- Uses `ELEVENLABS_WEBHOOK_SECRET` from environment

## Setup Instructions

### Step 1: Environment Variables

Add to your `.env.local`:

```bash
# Required
NEXT_PUBLIC_ELEVENLABS_API_KEY=sk_xxx
ELEVENLABS_AGENT_ID=your_agent_id
ELEVENLABS_WEBHOOK_SECRET=your_webhook_secret

# Already configured
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
OPENROUTER_API_KEY=xxx
```

### Step 2: Run Database Migration

```bash
# Apply the migration to drop conversation_sessions table
supabase db reset --local  # For local development
# OR
supabase db push           # For production
```

The migration file is: `supabase/migrations/20260118070000_drop_conversation_sessions.sql`

### Step 3: Configure ElevenLabs Webhook

1. Go to [ElevenLabs Dashboard](https://elevenlabs.io/app/conversational-ai)
2. Select your agent
3. Navigate to **Settings** → **Webhooks**
4. Configure webhook:
   - **URL:** `https://your-app.vercel.app/api/webhooks/elevenlabs`
   - **Type:** `post_call_transcription`
   - **Secret:** Generate a random secret and add to `.env.local` as `ELEVENLABS_WEBHOOK_SECRET`

**Generate webhook secret:**
```bash
openssl rand -hex 32
```

5. **IMPORTANT:** Remove any agent tools from your ElevenLabs agent configuration (we're not using them anymore)

### Step 4: Test the Flow

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Login to your app

3. Navigate to the voice dump page

4. Click "Start Voice Dump"

5. Talk for 30 seconds to test

6. Click "End & Process"

7. Check your terminal logs:
   ```
   📞 Received ElevenLabs webhook
   ✅ Webhook signature verified
   📦 Webhook type: post_call_transcription
   📝 Processing transcription webhook
   👤 User ID from dynamic variables: xxx-xxx-xxx
   💾 Saving voice dump to database...
   🤖 Triggering AI extraction...
   ✨ AI processing complete
   📦 Extracted 3 items
   ```

## Files Modified

### Frontend
- ✅ `/src/components/VoiceAgent.tsx` - Changed `customVariables` → `dynamicVariables`

### Backend
- ✅ `/src/app/api/elevenlabs/signed-url/route.ts` - Removed conversation_sessions insert
- ✅ `/src/app/api/webhooks/elevenlabs/route.ts` - Extract user_id from dynamic variables
- ✅ Deleted `/src/app/api/agent/` - Removed agent tool endpoints

### Database
- ✅ `/supabase/migrations/20260118070000_drop_conversation_sessions.sql` - Drop unused table

### Configuration
- ✅ `.env.local.example` - Added `ELEVENLABS_WEBHOOK_SECRET`, removed `AGENT_SECRET`

## How Dynamic Variables Work

### Frontend (VoiceAgent.tsx)
```typescript
await conversation.startSession({
  signedUrl,
  dynamicVariables: {
    user_id: userId,  // Passed to ElevenLabs
  },
});
```

### Webhook Payload Structure
```json
{
  "conversation_id": "conv_xxx",
  "transcript": [...],
  "conversation_initiation_client_data": {
    "dynamic_variables": {
      "user_id": "xxx-xxx-xxx"  // Extracted here!
    }
  }
}
```

### Webhook Handler (route.ts)
```typescript
const userId = data.conversation_initiation_client_data?.dynamic_variables?.user_id;
```

## Troubleshooting

### Error: "No user_id found in dynamic variables"

**Cause:** Dynamic variables not being passed correctly

**Fix:**
1. Check VoiceAgent.tsx uses `dynamicVariables` (not `customVariables`)
2. Verify signed URL route returns `user_id`
3. Check browser console for errors during startSession

### Error: "Could not find the 'confidence_score' column"

**Cause:** Webhook handler using wrong column name

**Fix:**
The voice_dumps table uses:
- `transcription_confidence` (not `confidence_score`)
- `audio_duration_seconds` (not `duration_seconds`)

Already fixed in the latest version of `/src/app/api/webhooks/elevenlabs/route.ts`

### Error: "Invalid webhook signature"

**Cause:** `ELEVENLABS_WEBHOOK_SECRET` mismatch

**Fix:**
1. Ensure `.env.local` has the correct secret
2. Verify ElevenLabs webhook settings use the same secret
3. Restart Next.js server after changing env variables

### Error: "Webhook secret not configured"

**Cause:** Missing `ELEVENLABS_WEBHOOK_SECRET` in environment

**Fix:**
```bash
# Add to .env.local
ELEVENLABS_WEBHOOK_SECRET=your_secret_here

# Restart server
pnpm dev
```

### No Items Extracted

**Cause:** AI processing might be failing

**Fix:**
1. Check terminal logs for AI processing errors
2. Verify `OPENROUTER_API_KEY` is set
3. Check `processVoiceDump` function logs
4. Ensure voice_dumps table has the transcript

## How AI Processing Works

After webhook receives transcript:

1. **Save to voice_dumps table:**
   ```sql
   INSERT INTO voice_dumps (user_id, transcription, ...)
   ```

2. **Trigger AI extraction:**
   ```typescript
   await processVoiceDump(voiceDumpId)
   ```

3. **AI categorizes into 7 categories:**
   - Tasks
   - Ideas
   - Errands
   - Health
   - Relationships
   - Worries Vault
   - Recurring

4. **Extract metadata:**
   - Deadlines
   - Priority
   - Worry spirals
   - Tags

5. **Save to items table:**
   ```sql
   INSERT INTO items (user_id, category_id, title, ...)
   ```

## Security Features

1. **HMAC Signature Verification:**
   - Every webhook is verified using SHA256 HMAC
   - Prevents spoofed webhooks

2. **Timestamp Validation:**
   - 30-minute tolerance window
   - Prevents replay attacks

3. **Signed URLs:**
   - Temporary tokens (15-minute validity)
   - User must be authenticated to get signed URL

4. **Service Role for Webhooks:**
   - Webhook handler uses service role to bypass RLS
   - Ensures webhook can write to database

## Next Steps

1. ✅ Run migration: `supabase db push`
2. ✅ Configure webhook in ElevenLabs dashboard
3. ✅ Add `ELEVENLABS_WEBHOOK_SECRET` to `.env.local`
4. ✅ Remove agent tools from ElevenLabs agent config
5. ✅ Test end-to-end flow
6. ✅ Deploy to production

## Production Deployment

When deploying to Vercel/production:

1. Add environment variables to Vercel:
   ```
   ELEVENLABS_WEBHOOK_SECRET=xxx
   NEXT_PUBLIC_ELEVENLABS_API_KEY=xxx
   ELEVENLABS_AGENT_ID=xxx
   ```

2. Update ElevenLabs webhook URL:
   ```
   https://your-app.vercel.app/api/webhooks/elevenlabs
   ```

3. Run migrations:
   ```bash
   supabase db push
   ```

## Support

If you encounter issues:

1. Check terminal logs for detailed error messages
2. Verify all environment variables are set
3. Test webhook with ElevenLabs "Test Webhook" button
4. Check Supabase logs for database errors

## References

- [ElevenLabs Dynamic Variables Docs](https://elevenlabs.io/docs/agents-platform/customization/personalization/dynamic-variables)
- [ElevenLabs Webhook Docs](https://elevenlabs.io/docs/agents-platform/workflows/post-call-webhooks)
- [ElevenLabs Authentication](https://elevenlabs.io/docs/agents-platform/customization/authentication)
