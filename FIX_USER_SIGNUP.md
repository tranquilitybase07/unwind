# Fix User Signup Issue

## Problem
Users are created in `auth.users` during signup, but not in the `public.users` table. This causes foreign key constraint errors when trying to save voice dumps.

## Solution
Run the migration that:
1. Creates a trigger to auto-create users in `public.users` when they sign up
2. Backfills existing auth users into the `public.users` table

## Steps to Fix

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the entire contents of:
   ```
   supabase/migrations/20260117143000_add_user_signup_trigger.sql
   ```
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. You should see: "Success. No rows returned"

### Option 2: Via Supabase CLI

If you have Supabase CLI installed:

```bash
supabase db push
```

This will automatically apply all new migrations.

## Verify It Worked

Run this query in the SQL Editor:

```sql
-- Check if your user exists in public.users
SELECT
  au.id,
  au.email,
  pu.id IS NOT NULL as has_public_user,
  pu.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id;
```

You should see:
- Your email
- `has_public_user` = `true`
- A `created_at` timestamp

## What This Migration Does

### 1. Creates a trigger function
```sql
CREATE FUNCTION handle_new_user()
```
This function automatically inserts a row into `public.users` whenever someone signs up.

### 2. Attaches the trigger
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
```
This runs the function every time a new user is created in auth.

### 3. Backfills existing users
```sql
INSERT INTO public.users (id, email, ...)
SELECT ... FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
```
This copies any existing auth users to the public.users table.

## After Running the Migration

1. **Existing users** will be able to save voice dumps immediately
2. **New signups** will automatically get a row in `public.users`
3. No more foreign key constraint errors!

## Test It

1. Refresh your browser at `http://localhost:3000/dashboard`
2. Record audio and click "Stop & Transcribe"
3. Click "Save to Database"
4. You should see: ✓ Saved successfully

Then verify in Supabase:

```sql
SELECT * FROM voice_dumps ORDER BY created_at DESC LIMIT 5;
```

You should see your transcription saved!

## Troubleshooting

### If you still get the error:

1. Check if the migration ran successfully:
   ```sql
   SELECT * FROM public.users WHERE email = 'your-email@example.com';
   ```

2. If your user is missing, manually insert:
   ```sql
   INSERT INTO public.users (id, email)
   SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
   ```

3. Try saving the voice dump again

### If trigger doesn't fire for new users:

Check if the trigger exists:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

If not found, re-run the migration.
