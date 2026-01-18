# ElevenLabs Webhook Setup Guide

## Overview

The webhook approach is **much better** than manual transcript fetching because:
- ✅ Automatic - ElevenLabs sends the data to you
- ✅ Complete transcript - Guaranteed to have everything
- ✅ No polling or waiting
- ✅ Reliable and production-ready

## Setup Steps

### 1. Deploy Your App First

The webhook needs a public URL to send data to.

```bash
# Deploy to Vercel
vercel --prod
```

Your webhook URL will be:
```
https://your-app.vercel.app/api/webhooks/elevenlabs
```

### 2. Configure Webhook in ElevenLabs Dashboard

1. Go to [ElevenLabs Agents Platform Settings](https://elevenlabs.io/app/agents-platform/settings)

2. Find the "Webhooks" section

3. Click "Add Webhook" or "Configure Webhooks"

4. Fill in:
   - **Webhook URL**: `https://your-app.vercel.app/api/webhooks/elevenlabs`
   - **Webhook Type**: Select **"Transcription Webhook"** (post_call_transcription)
   - **Events**: Check "Post-call transcription"

5. Click "Save" or "Create"

6. **Copy the webhook secret** that ElevenLabs generates
   - It will look something like: `whsec_xxxxxxxxxxxxxxxxxx`

### 3. Add Webhook Secret to Environment

Update your `.env.local`:

```env
ELEVENLABS_WEBHOOK_SECRET=whsec_your_actual_secret_here
```

### 4. Redeploy with Webhook Secret

```bash
# Add the secret to Vercel
vercel env add ELEVENLABS_WEBHOOK_SECRET

# Paste the webhook secret when prompted

# Redeploy
vercel --prod
```

---

## How It Works

### User Flow:
1. User clicks "Start Voice Dump"
2. Has conversation with agent
3. User clicks "End & Process"
4. **Webhook magic happens** ⬇️

### Webhook Flow:
```
1. Conversation ends
       ↓
2. ElevenLabs processes the call
       ↓
3. ElevenLabs sends POST request to:
   https://your-app.vercel.app/api/webhooks/elevenlabs
       ↓
4. Webhook receives:
   {
     "type": "post_call_transcription",
     "data": {
       "conversation_id": "conv_xxx",
       "transcript": [
         {"role": "user", "message": "I need to..."},
         {"role": "agent", "message": "I hear you..."}
       ],
       "variables": {
         "user_id": "abc-123"  ← Your user ID!
       }
     }
   }
       ↓
5. Webhook verifies HMAC signature
       ↓
6. Webhook saves to voice_dumps table
       ↓
7. Webhook calls processVoiceDump() (your existing AI)
       ↓
8. OpenRouter + Claude extracts items
       ↓
9. Items saved to database
       ↓
10. User refreshes page → sees items! ✨
```

---

## Testing Locally (Optional)

To test webhooks locally, use ngrok:

### 1. Install ngrok
```bash
brew install ngrok
# or
npm install -g ngrok
```

### 2. Start your dev server
```bash
npm run dev
```

### 3. Expose with ngrok
```bash
ngrok http 3000
```

You'll get a URL like: `https://abc123.ngrok-free.app`

### 4. Update ElevenLabs webhook URL
```
https://abc123.ngrok-free.app/api/webhooks/elevenlabs
```

### 5. Test the conversation
- Start a voice dump
- Say something
- End the conversation
- Check your terminal for webhook logs:

```
📞 Received ElevenLabs webhook
✅ Webhook signature verified
📦 Webhook type: post_call_transcription
📝 Processing transcription webhook
🆔 Conversation ID: conv_xxxxx
👤 User ID: abc-123
📝 Full transcript length: 456
💾 Saving voice dump to database...
✅ Voice dump saved: voice-dump-id
🤖 Triggering AI extraction...
✨ AI processing complete
📦 Extracted 3 items
```

---

## Webhook Security

Your webhook is protected by:

### 1. HMAC Signature Verification
Every request from ElevenLabs includes a signature in the `ElevenLabs-Signature` header.

Format: `t=1234567890,v0=abc123...`

The webhook code verifies:
- ✅ Signature matches the payload
- ✅ Timestamp is recent (30-minute tolerance)
- ❌ Rejects invalid or expired signatures

### 2. IP Whitelisting (Optional)

If you want extra security, whitelist these IPs in Vercel:

**US (Default):**
- 34.67.146.145
- 34.59.11.47

**EU:**
- 35.204.38.71
- 34.147.113.54

---

## Troubleshooting

### Webhook not receiving data

**Check deployment:**
```bash
# Test webhook endpoint manually
curl -X POST https://your-app.vercel.app/api/webhooks/elevenlabs \
  -H "Content-Type: application/json" \
  -d '{"type":"test"}'
```

You should see:
```json
{"success":false,"error":"Missing signature"}
```

This means the endpoint is working (it's rejecting because no signature).

### Webhook signature verification failing

1. Make sure `ELEVENLABS_WEBHOOK_SECRET` is set correctly
2. Check you're using the secret from the ElevenLabs dashboard
3. Verify no extra spaces in the `.env` file

### User ID not found in webhook

Make sure you're passing `customVariables` when starting the conversation:

```typescript
await conversation.startSession({
  signedUrl,
  customVariables: {
    user_id: userId,  // ← This is passed to the webhook!
  },
});
```

### Items not appearing

1. Check webhook logs in Vercel dashboard
2. Verify OpenRouter API key is valid
3. Check Supabase RLS policies
4. Look for errors in the processVoiceDump function

---

## Webhook Payload Reference

### Transcription Webhook

```json
{
  "type": "post_call_transcription",
  "event_timestamp": 1234567890,
  "data": {
    "conversation_id": "conv_abc123",
    "agent_id": "agent_xyz789",
    "transcript": [
      {
        "role": "user",
        "message": "I need to finish the proposal by Friday",
        "timestamp": 1234567890
      },
      {
        "role": "agent",
        "message": "I hear you, that sounds stressful",
        "timestamp": 1234567891
      }
    ],
    "call_duration_seconds": 120,
    "call_successful": true,
    "metadata": {
      "custom_field": "value"
    },
    "variables": {
      "user_id": "user_abc123"  ← Your user ID here!
    }
  }
}
```

---

## Benefits Over Manual Fetching

| Feature | Webhook | Manual Fetch |
|---------|---------|--------------|
| **Reliability** | ✅ Guaranteed delivery | ❌ Can fail, need retries |
| **Timing** | ✅ Immediate | ❌ Need to poll/wait |
| **Complexity** | ✅ Simple | ❌ More code |
| **Transcript** | ✅ Complete & formatted | ❌ Need to parse |
| **User context** | ✅ Custom variables | ❌ Need to pass manually |
| **Production ready** | ✅ Yes | ❌ Hacky |

---

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Configure webhook in ElevenLabs dashboard
3. ✅ Add webhook secret to environment
4. ✅ Redeploy with secret
5. ✅ Test a conversation
6. ✅ Check items appear in Voice Inbox

---

## Support

If the webhook isn't working:

1. Check Vercel function logs: `vercel logs`
2. Check ElevenLabs webhook delivery status in dashboard
3. Test the endpoint manually with curl
4. Verify environment variables are set

**Webhook endpoint:** `/api/webhooks/elevenlabs/route.ts`
**Verification:** HMAC SHA256 signature
**Returns:** 200 OK (always, even on errors to prevent retries)

---

**Last Updated:** January 2025
**Status:** Production Ready ✅
