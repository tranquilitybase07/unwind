-- ============================================================================
-- AUTO-CREATE USER IN USERS TABLE ON AUTH SIGNUP
-- ============================================================================
-- This trigger automatically creates a row in the public.users table
-- whenever a new user signs up via Supabase Auth.
-- This ensures the foreign key relationship works correctly.
-- ============================================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run the function on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- BACKFILL: Add existing auth users to public.users table
-- ============================================================================
-- This handles users who already signed up before this migration

INSERT INTO public.users (id, email, created_at, updated_at)
SELECT
  id,
  email,
  created_at,
  NOW() as updated_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run this query to verify all auth users have corresponding public.users:
-- SELECT
--   au.id,
--   au.email,
--   pu.id IS NOT NULL as has_public_user
-- FROM auth.users au
-- LEFT JOIN public.users pu ON au.id = pu.id;
