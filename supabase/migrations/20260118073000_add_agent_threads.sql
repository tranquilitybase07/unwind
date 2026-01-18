-- ============================================================================
-- UNWIND APP: AI Agent Threads Table
-- Tracks conversation threads between users and the AI agent
-- ============================================================================

CREATE TABLE agent_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- OpenAI thread tracking
  openai_thread_id TEXT NOT NULL UNIQUE,

  -- Thread metadata
  title TEXT, -- Optional: first message or user-given title
  last_message_at TIMESTAMP DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_agent_threads_user ON agent_threads(user_id, created_at DESC);
CREATE INDEX idx_agent_threads_openai_id ON agent_threads(openai_thread_id);
CREATE INDEX idx_agent_threads_user_active ON agent_threads(user_id, is_active, last_message_at DESC);

-- Enable Row Level Security
ALTER TABLE agent_threads ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own threads
CREATE POLICY agent_threads_select_own ON agent_threads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY agent_threads_insert_own ON agent_threads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY agent_threads_update_own ON agent_threads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY agent_threads_delete_own ON agent_threads
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_agent_threads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER agent_threads_updated_at
  BEFORE UPDATE ON agent_threads
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_threads_updated_at();
