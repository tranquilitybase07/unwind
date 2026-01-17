-- ============================================================================
-- UNWIND APP: Complete Database Schema for Supabase
-- Production-ready, AI-friendly, scalable, with comprehensive RLS
-- ============================================================================

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- User preferences
  anxiety_type TEXT CHECK (anxiety_type IN ('racing_thoughts', 'intrusive_worries', 'overwhelmed', null)),
  notification_enabled BOOLEAN DEFAULT true,
  max_reminders_per_day INTEGER DEFAULT 3 CHECK (max_reminders_per_day > 0),
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',

  -- Metadata
  last_active_at TIMESTAMP,
  preferred_language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',

  -- Tracking (for analytics, phase 2+)
  total_dumps INTEGER DEFAULT 0,
  total_items INTEGER DEFAULT 0
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ============================================================================
-- 2. CATEGORIES TABLE (System reference, not user-specific)
-- ============================================================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  emoji TEXT,
  display_order INTEGER NOT NULL,
  is_system BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_categories_system ON categories(is_system);

-- Insert the 7 fixed categories (emojis can be added later via app or update migration)
INSERT INTO categories (name, description, emoji, display_order, is_system) VALUES
  ('Tasks', 'Work projects, deadlines, actionable items', 'check', 1, true),
  ('Ideas', 'Creative thoughts, projects to explore', 'lightbulb', 2, true),
  ('Errands', 'Shopping, appointments, admin tasks', 'cart', 3, true),
  ('Health', 'Medical, fitness, nutrition, mental health', 'heart', 4, true),
  ('Relationships', 'People, communication, social obligations', 'people', 5, true),
  ('Worries Vault', 'Pure anxiety, intrusive thoughts, fears', 'lock', 6, true),
  ('Recurring', 'Regular routines, habits to build', 'repeat', 7, true);

-- ============================================================================
-- 3. VOICE DUMPS TABLE
-- ============================================================================

CREATE TABLE voice_dumps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Audio data
  audio_duration_seconds INTEGER CHECK (audio_duration_seconds > 0),
  transcription TEXT NOT NULL,
  transcription_confidence FLOAT CHECK (transcription_confidence >= 0 AND transcription_confidence <= 1),

  -- Processing
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processed', 'failed')),
  processed_at TIMESTAMP,
  error_message TEXT,

  -- AI analysis (stored for later use/retraining)
  ai_processing_time_ms INTEGER,
  ai_model_version TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_voice_dumps_user_created ON voice_dumps(user_id, created_at);
CREATE INDEX idx_voice_dumps_processing_status ON voice_dumps(processing_status, created_at);
CREATE INDEX idx_voice_dumps_user_processed ON voice_dumps(user_id, processing_status);

-- ============================================================================
-- 4. ITEMS TABLE (Core table - individual tasks/thoughts)
-- ============================================================================

CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  voice_dump_id UUID REFERENCES voice_dumps(id) ON DELETE SET NULL,

  -- Core data
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID NOT NULL REFERENCES categories(id),

  -- Priority & urgency (AI-computed)
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  urgency_score INTEGER DEFAULT 0 CHECK (urgency_score >= 0 AND urgency_score <= 100),
  importance_score INTEGER DEFAULT 0 CHECK (importance_score >= 0 AND importance_score <= 100),
  emotional_weight_score INTEGER DEFAULT 0 CHECK (emotional_weight_score >= 0 AND emotional_weight_score <= 100),
  final_priority_score INTEGER DEFAULT 0 CHECK (final_priority_score >= 0 AND final_priority_score <= 100),

  -- Deadlines
  due_date DATE,
  due_time TIME,
  is_all_day BOOLEAN DEFAULT false,
  deadline_confidence FLOAT CHECK (deadline_confidence >= 0 AND deadline_confidence <= 1),
  deadline_extracted_from_text TEXT,

  -- Item type
  item_type TEXT DEFAULT 'task' CHECK (item_type IN ('task', 'idea', 'worry', 'habit', 'errand')),

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'archived', 'deleted')),
  completed_at TIMESTAMP,

  -- User customizations
  user_edited BOOLEAN DEFAULT false,
  user_notes TEXT,
  custom_tags TEXT[] DEFAULT '{}',

  -- AI analysis
  ai_confidence FLOAT DEFAULT 0.9 CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
  is_worry_spiral BOOLEAN DEFAULT false,
  spiral_breakdown JSONB,
  worry_acknowledgment_text TEXT,

  -- Completion tracking
  completion_time_minutes INTEGER,
  user_mood_after_completion TEXT CHECK (user_mood_after_completion IN ('better', 'same', 'worse', null)),

  -- Relationships
  blocked_by_item_id UUID REFERENCES items(id) ON DELETE SET NULL,
  parent_task_id UUID REFERENCES items(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes (critical for performance)
CREATE INDEX idx_items_user_status ON items(user_id, status);
CREATE INDEX idx_items_user_due_date ON items(user_id, due_date);
CREATE INDEX idx_items_user_category ON items(user_id, category_id);
CREATE INDEX idx_items_priority_score ON items(user_id, final_priority_score DESC);
CREATE INDEX idx_items_status_created ON items(status, created_at);
CREATE INDEX idx_items_is_spiral ON items(user_id, is_worry_spiral);
CREATE INDEX idx_items_parent_task ON items(parent_task_id);

-- ============================================================================
-- 5. ITEM_TAGS TABLE (Flexible tagging system)
-- ============================================================================

CREATE TABLE item_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  tag_type TEXT DEFAULT 'custom' CHECK (tag_type IN ('auto', 'custom', 'system')),
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(item_id, tag)
);

CREATE INDEX idx_item_tags_item_id ON item_tags(item_id);
CREATE INDEX idx_item_tags_tag ON item_tags(tag);
CREATE INDEX idx_item_tags_user_tag ON item_tags(tag, created_at);

-- ============================================================================
-- 6. RECURRING_ITEMS TABLE
-- ============================================================================

CREATE TABLE recurring_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,

  -- Recurrence pattern
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'custom')),

  -- Frequency details
  days_of_week INTEGER[],
  times_per_week INTEGER CHECK (times_per_week IS NULL OR times_per_week > 0),
  custom_interval_days INTEGER CHECK (custom_interval_days IS NULL OR custom_interval_days > 0),

  -- Reminder preferences
  reminder_time TIME,
  reminder_type TEXT DEFAULT 'time_based' CHECK (reminder_type IN ('time_based', 'location_based', 'behavioral')),
  reminder_location TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_occurrence_date DATE,
  next_occurrence_date DATE,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_recurring_items_user_active ON recurring_items(user_id, is_active);
CREATE INDEX idx_recurring_items_next_occurrence ON recurring_items(next_occurrence_date);

-- ============================================================================
-- 7. REMINDERS TABLE
-- ============================================================================

CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  recurring_item_id UUID REFERENCES recurring_items(id) ON DELETE SET NULL,

  -- Reminder details
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('time_based', 'location_based', 'behavioral')),
  scheduled_for TIMESTAMP NOT NULL,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'dismissed', 'snoozed')),
  sent_at TIMESTAMP,
  dismissed_at TIMESTAMP,
  snooze_until TIMESTAMP,

  -- Metadata
  is_quiet_hours_bypass BOOLEAN DEFAULT false,
  reminder_text TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reminders_scheduled_pending ON reminders(scheduled_for, status);
CREATE INDEX idx_reminders_user_pending ON reminders(user_id, status);
CREATE INDEX idx_reminders_user_sent ON reminders(user_id, sent_at);

-- ============================================================================
-- 8. COMPLETIONS_LOG TABLE (Phase 2: Analytics & Behavioral Learning)
-- ============================================================================

CREATE TABLE completions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,

  completed_at TIMESTAMP DEFAULT NOW(),
  user_mood_before TEXT CHECK (user_mood_before IN ('anxious', 'neutral', 'good', null)),
  user_mood_after TEXT CHECK (user_mood_after IN ('better', 'same', 'worse', null)),
  completion_time_minutes INTEGER,
  was_procrastinated BOOLEAN DEFAULT false,
  procrastination_duration_hours INTEGER,

  -- Context
  completion_method TEXT CHECK (completion_method IN ('app', 'voice', 'manual', null))
);

CREATE INDEX idx_completions_log_user_completed_at ON completions_log(user_id, completed_at);
CREATE INDEX idx_completions_log_completed_at ON completions_log(completed_at);

-- ============================================================================
-- 9. AI_LEARNING_LOGS TABLE (Phase 2: AI Improvement)
-- ============================================================================

CREATE TABLE ai_learning_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE SET NULL,

  ai_task TEXT NOT NULL CHECK (ai_task IN ('categorization', 'priority_inference', 'deadline_extraction', 'spiral_detection', 'reminder_timing')),
  ai_input TEXT NOT NULL,
  ai_output JSONB NOT NULL,
  user_feedback TEXT CHECK (user_feedback IN ('correct', 'incorrect', 'adjusted', 'ignored')),
  confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_learning_logs_user_task ON ai_learning_logs(user_id, ai_task);
CREATE INDEX idx_ai_learning_logs_feedback ON ai_learning_logs(user_feedback);

-- ============================================================================
-- 10. MOOD_TRACKING TABLE (Phase 2: Optional Mood Tracking)
-- ============================================================================

CREATE TABLE mood_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  anxiety_level INTEGER CHECK (anxiety_level >= 1 AND anxiety_level <= 10),
  mood_description TEXT,

  related_category_id UUID REFERENCES categories(id),

  capture_time TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mood_tracking_user_capture_time ON mood_tracking(user_id, capture_time);

-- ============================================================================
-- 11. USER_PREFERENCES TABLE (Phase 2: Advanced Customization)
-- ============================================================================

CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Display preferences
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  color_scheme TEXT DEFAULT 'default',
  compact_mode BOOLEAN DEFAULT false,

  -- Feature toggles
  enable_spiral_detection BOOLEAN DEFAULT true,
  enable_mood_tracking BOOLEAN DEFAULT false,
  enable_behavioral_learning BOOLEAN DEFAULT true,
  enable_location_reminders BOOLEAN DEFAULT false,

  -- AI preferences
  ai_suggestion_level TEXT DEFAULT 'balanced' CHECK (ai_suggestion_level IN ('minimal', 'balanced', 'aggressive')),

  -- Notification preferences
  sound_enabled BOOLEAN DEFAULT true,
  haptic_feedback_enabled BOOLEAN DEFAULT true,
  notification_style TEXT DEFAULT 'minimal' CHECK (notification_style IN ('minimal', 'detailed')),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 12. SAMPLE_TAGS TABLE (Phase 2: Tag Suggestions)
-- ============================================================================

CREATE TABLE sample_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag TEXT UNIQUE NOT NULL,
  category_id UUID REFERENCES categories(id),
  tag_category TEXT CHECK (tag_category IN ('time', 'priority', 'context', 'emotion', 'status', 'custom')),
  description TEXT,
  suggested_for_users BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert common tags for suggestions
INSERT INTO sample_tags (tag, category_id, tag_category, description, suggested_for_users) VALUES
  ('today', NULL, 'time', 'Due today', true),
  ('thisweek', NULL, 'time', 'Due this week', true),
  ('thismonth', NULL, 'time', 'Due this month', true),
  ('overdue', NULL, 'time', 'Overdue item', true),
  ('someday', NULL, 'time', 'Someday/maybe', true),
  ('urgent', NULL, 'priority', 'Urgent/ASAP', true),
  ('important', NULL, 'priority', 'Important but not urgent', true),
  ('work', NULL, 'context', 'Work-related', true),
  ('personal', NULL, 'context', 'Personal/life', true),
  ('health', NULL, 'context', 'Health-related', true),
  ('family', NULL, 'context', 'Family/relationships', true),
  ('anxiety', NULL, 'emotion', 'Anxiety-related', true),
  ('procrastination', NULL, 'emotion', 'Procrastinating on this', true),
  ('spiral', NULL, 'emotion', 'Worry spiral detected', true),
  ('blocked', NULL, 'status', 'Waiting for something', true),
  ('in-progress', NULL, 'status', 'Currently working on', true);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on ALL tables (security first!)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_dumps ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_learning_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE sample_tags ENABLE ROW LEVEL SECURITY;

-- users RLS - Users can only read/update their own record
CREATE POLICY users_select_own ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_update_own ON users
  FOR UPDATE USING (auth.uid() = id);

-- Note: INSERT is handled by Supabase Auth, DELETE should be restricted

-- categories RLS - Read-only for all authenticated users (system table)
CREATE POLICY categories_read_all ON categories
  FOR SELECT USING (true);

-- sample_tags RLS - Read-only for all authenticated users (system table)
CREATE POLICY sample_tags_read_all ON sample_tags
  FOR SELECT USING (true);

-- voice_dumps RLS
CREATE POLICY voice_dumps_user_access ON voice_dumps
  FOR ALL USING (auth.uid() = user_id);

-- items RLS
CREATE POLICY items_user_access ON items
  FOR ALL USING (auth.uid() = user_id);

-- item_tags RLS
CREATE POLICY item_tags_user_access ON item_tags
  FOR ALL USING (
    auth.uid() = (SELECT user_id FROM items WHERE id = item_id)
  );

-- recurring_items RLS
CREATE POLICY recurring_items_user_access ON recurring_items
  FOR ALL USING (auth.uid() = user_id);

-- reminders RLS
CREATE POLICY reminders_user_access ON reminders
  FOR ALL USING (auth.uid() = user_id);

-- completions_log RLS
CREATE POLICY completions_log_user_access ON completions_log
  FOR ALL USING (auth.uid() = user_id);

-- ai_learning_logs RLS
CREATE POLICY ai_learning_logs_user_access ON ai_learning_logs
  FOR ALL USING (auth.uid() = user_id);

-- mood_tracking RLS
CREATE POLICY mood_tracking_user_access ON mood_tracking
  FOR ALL USING (auth.uid() = user_id);

-- user_preferences RLS
CREATE POLICY user_preferences_user_access ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES (AI-Friendly)
-- ============================================================================

-- Today's view
CREATE VIEW user_today_view AS
SELECT
  i.id,
  i.user_id,
  i.title,
  i.category_id,
  c.name as category,
  i.due_date,
  i.due_time,
  i.priority,
  i.final_priority_score,
  ARRAY_AGG(it.tag) FILTER (WHERE it.tag IS NOT NULL) as tags,
  i.status
FROM items i
JOIN categories c ON i.category_id = c.id
LEFT JOIN item_tags it ON i.id = it.item_id
WHERE i.status = 'pending' AND i.due_date <= CURRENT_DATE
GROUP BY i.id, c.name;

-- This week's view
CREATE VIEW user_this_week_view AS
SELECT
  i.id,
  i.user_id,
  i.title,
  i.category_id,
  c.name as category,
  i.due_date,
  i.priority,
  ARRAY_AGG(it.tag) FILTER (WHERE it.tag IS NOT NULL) as tags,
  i.status
FROM items i
JOIN categories c ON i.category_id = c.id
LEFT JOIN item_tags it ON i.id = it.item_id
WHERE i.status = 'pending'
  AND i.due_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '7 days')
GROUP BY i.id, c.name;

-- Worries Vault view
CREATE VIEW user_worries_vault_view AS
SELECT
  i.id,
  i.user_id,
  i.title,
  i.is_worry_spiral,
  i.spiral_breakdown,
  i.priority,
  ARRAY_AGG(it.tag) FILTER (WHERE it.tag IS NOT NULL) as tags,
  i.created_at
FROM items i
LEFT JOIN item_tags it ON i.id = it.item_id
WHERE i.category_id = (SELECT id FROM categories WHERE name = 'Worries Vault')
  AND i.status = 'pending'
GROUP BY i.id;

-- ============================================================================
-- USEFUL FUNCTIONS
-- ============================================================================

-- Function to update item priority score
CREATE OR REPLACE FUNCTION update_item_priority()
RETURNS TRIGGER AS $$
BEGIN
  NEW.final_priority_score := (
    (NEW.urgency_score * 0.4) +
    (NEW.importance_score * 0.4) +
    (NEW.emotional_weight_score * 0.2)
  )::INTEGER;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_priority
  BEFORE INSERT OR UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_item_priority();

-- Function to auto-increment user stats
CREATE OR REPLACE FUNCTION increment_user_dump_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET total_dumps = total_dumps + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_dump_count
  AFTER INSERT ON voice_dumps
  FOR EACH ROW
  WHEN (NEW.processing_status = 'processed')
  EXECUTE FUNCTION increment_user_dump_count();



