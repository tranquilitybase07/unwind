-- Drop conversation_sessions table (no longer needed)
-- We now use ElevenLabs dynamic variables to pass user_id directly in webhooks
-- This is the recommended approach per ElevenLabs documentation

-- Drop the table and its dependencies
DROP TABLE IF EXISTS conversation_sessions CASCADE;

-- Migration rationale:
-- 1. Eliminates race condition between signed URL creation and webhook arrival
-- 2. Simplifies architecture - no extra database lookup needed
-- 3. Follows ElevenLabs best practices for passing user context
-- 4. Dynamic variables are designed specifically for this use case
