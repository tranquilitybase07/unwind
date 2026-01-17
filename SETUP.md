# Unwind Setup Guide

This guide will help you set up the Unwind app with ElevenLabs voice recording and Supabase database integration.

## Prerequisites

- Node.js 18+ installed
- pnpm package manager
- ElevenLabs API account
- Supabase project

## Step 1: Install Dependencies

Dependencies have already been installed. If you need to reinstall:

```bash
pnpm install
```

## Step 2: Set Up Environment Variables

1. Copy the example environment file:

```bash
cp .env.local.example .env.local
```

2. Fill in your credentials in `.env.local`:

### Supabase Credentials

Get these from [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → Settings → API:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### ElevenLabs API Key

Get this from [ElevenLabs Settings](https://elevenlabs.io/app/settings/api-keys):

```env
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

## Step 3: Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the migration file located at:
   ```
   supabase/migrations/20260117080339_complete_schema_with_rls.sql
   ```

This will create all necessary tables:
- `users` - User accounts
- `voice_dumps` - Recorded voice transcriptions
- `items` - Organized thoughts/tasks
- `categories` - Fixed 7 categories
- And more...

## Step 4: Enable Supabase Email Authentication

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional but recommended)
4. Set **Site URL** to `http://localhost:3000` (for development)
5. Add **Redirect URLs**:
   - `http://localhost:3000/dashboard`
   - Your production URL when deploying

## Step 5: Configure ElevenLabs

The app uses ElevenLabs' Conversational AI for real-time speech-to-text.

### Important Notes:
- The current implementation uses `useConversation` hook from `@elevenlabs/react`
- You'll need an ElevenLabs agent ID or configure it properly
- Check [ElevenLabs Conversational AI docs](https://elevenlabs.io/docs/conversational-ai/overview) for agent setup

### Update VoiceDumpCard if needed:

If you're using a specific agent ID instead of just the API key, update line 43 in `src/components/dashboard/VoiceDumpCard.tsx`:

```typescript
await conversation.startSession({
  agentId: "your_agent_id_here", // Replace with actual agent ID
});
```

## Step 6: Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 7: Test the Flow

### 1. Create an Account

1. Navigate to `http://localhost:3000/auth/login`
2. Click "Don't have an account? Sign up"
3. Enter email and password (minimum 6 characters)
4. Check your email for confirmation link
5. Click the confirmation link

### 2. Sign In

1. Return to `http://localhost:3000/auth/login`
2. Enter your credentials
3. You should be redirected to `/dashboard`

### 3. Test Voice Recording

1. On the dashboard, click the microphone button in the Voice Dump Card
2. Allow microphone permissions when prompted
3. Start speaking - you should see:
   - "Recording" indicator in top-left
   - Real-time transcription appearing below
   - "Done" button appears once you start speaking
4. Click "Done" to save
5. You should see "Saved successfully" message

### 4. Verify Database Storage

1. Go to Supabase Dashboard → **Table Editor** → `voice_dumps`
2. You should see your transcription saved with:
   - Your user ID
   - Transcription text
   - Processing status: "pending"
   - Timestamp

## Troubleshooting

### Microphone Not Working

- Check browser permissions for microphone access
- Ensure you're using HTTPS in production (or localhost for development)
- Check browser console for errors

### ElevenLabs Connection Errors

- Verify your API key is correct in `.env.local`
- Check ElevenLabs account has credits/active subscription
- Look for error messages in browser console
- Ensure you have the correct agent configuration

### Authentication Not Working

- Verify Supabase URL and keys are correct
- Check that email authentication is enabled in Supabase
- Ensure Site URL and Redirect URLs are configured
- Look for errors in browser console

### Database Errors

- Verify migration was run successfully
- Check RLS policies are enabled
- Ensure your user is properly authenticated
- Check Supabase logs in Dashboard → Logs

### Build Errors

If you encounter TypeScript or build errors:

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
pnpm install

# Rebuild
pnpm dev
```

## Architecture Overview

### File Structure

```
src/
├── app/
│   ├── auth/login/          # Authentication page
│   ├── dashboard/           # Protected dashboard route
│   ├── layout.tsx           # Root layout with AuthProvider
│   └── middleware.ts        # Route protection
├── components/
│   ├── auth/
│   │   ├── AuthProvider.tsx # Auth context
│   │   └── LoginForm.tsx    # Login/signup form
│   └── dashboard/
│       ├── VoiceDumpCard.tsx # Voice recording component
│       └── ...
├── lib/
│   ├── actions/
│   │   └── voice-dump.ts    # Server actions for DB ops
│   └── supabase/
│       ├── client.ts        # Browser Supabase client
│       ├── server.ts        # Server Supabase client
│       └── types.ts         # Database TypeScript types
```

### Data Flow

1. **User speaks** → ElevenLabs STT → Real-time transcription
2. **User clicks "Done"** → `createVoiceDump` server action
3. **Server action** → Inserts into Supabase `voice_dumps` table
4. **Future**: Background job → AI processing → `items` table

## Next Steps

### Phase 1: AI Processing (Not Yet Implemented)

After a voice dump is saved, you'll want to:

1. Extract individual thoughts from the transcription
2. Categorize each thought into one of the 7 categories
3. Detect deadlines and priorities
4. Identify worry spirals
5. Create entries in the `items` table

This would be implemented in:
- `src/app/api/voice-dumps/process/route.ts`
- Using Claude Sonnet 4 or another LLM

### Phase 2: UI Enhancements

- Display recent voice dumps
- Show organized thoughts/tasks
- Category filtering
- Today/This Week/Later views
- Worry spiral visualization

### Phase 3: Production Deployment

1. Set up production environment variables
2. Configure production Supabase URLs
3. Update ElevenLabs production keys
4. Deploy to Vercel/similar platform
5. Configure custom domain
6. Set up monitoring and error tracking

## Resources

- [ElevenLabs Conversational AI Docs](https://elevenlabs.io/docs/conversational-ai/overview)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## Support

For issues or questions:
1. Check the console for error messages
2. Review Supabase logs in the dashboard
3. Verify all environment variables are set correctly
4. Check that services (Supabase, ElevenLabs) are operational

## Success Checklist

- [ ] Environment variables configured
- [ ] Supabase migration run successfully
- [ ] Email authentication enabled
- [ ] Can create an account
- [ ] Can sign in
- [ ] Can access dashboard
- [ ] Microphone permissions granted
- [ ] Can record and see transcription
- [ ] Voice dumps saved to database
- [ ] Can sign out

If all items are checked, you're ready to develop! 🎉
