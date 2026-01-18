-- Create conversation_sessions table to map conversation_id to user_id
-- This allows webhooks to know which user a conversation belongs to
CREATE TABLE
    IF NOT EXISTS conversation_sessions (
        conversation_id TEXT PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW (),
        completed_at TIMESTAMP
    );

-- Index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_user_id ON conversation_sessions (user_id);

-- Enable RLS
ALTER TABLE conversation_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own conversation sessions" ON conversation_sessions FOR
SELECT
    USING (auth.uid () = user_id);

CREATE POLICY "Service role can insert conversation sessions" ON conversation_sessions FOR INSERT
WITH
    CHECK (true);

CREATE POLICY "Service role can update conversation sessions" ON conversation_sessions FOR
UPDATE USING (true);