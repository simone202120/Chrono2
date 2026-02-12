-- ============================================
-- Agile Planner - Database Schema Migration
-- ============================================
-- Run this in Supabase SQL Editor
-- https://app.supabase.com/project/_/sql/new

-- ============================================
-- ENUMS
-- ============================================

-- Task status enum
CREATE TYPE task_status AS ENUM ('backlog', 'scheduled', 'done', 'postponed');

-- Recurrence type enum
CREATE TYPE recurrence_type AS ENUM ('daily', 'weekly', 'monthly', 'custom');

-- ============================================
-- TABLES
-- ============================================

-- Tasks table
CREATE TABLE tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Content
  title         TEXT NOT NULL,
  description   TEXT,
  weight        SMALLINT NOT NULL DEFAULT 1 CHECK (weight BETWEEN 1 AND 5),

  -- Dates
  due_date      DATE,                    -- Deadline for alerts
  scheduled_at  TIMESTAMPTZ,             -- When to do it (NULL = backlog)
  completed_at  TIMESTAMPTZ,             -- When completed

  -- Status
  status        task_status NOT NULL DEFAULT 'backlog',

  -- Recurrence
  is_recurring  BOOLEAN NOT NULL DEFAULT FALSE,
  recurrence    JSONB,
  -- Example: { "type": "weekly", "days": [1, 3, 5], "until": "2025-12-31", "interval": 1 }
  parent_id     UUID REFERENCES tasks(id) ON DELETE SET NULL,
  -- NULL for normal tasks, UUID for recurring instances

  -- Metadata
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Push subscriptions table (for Web Push notifications)
CREATE TABLE push_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint    TEXT NOT NULL UNIQUE,
  keys        JSONB NOT NULL,  -- { p256dh, auth }
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_scheduled_at ON tasks(user_id, scheduled_at);
CREATE INDEX idx_tasks_due_date ON tasks(user_id, due_date);
CREATE INDEX idx_push_subs_user_id ON push_subscriptions(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see and modify their own tasks
CREATE POLICY "user_tasks" ON tasks
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Enable RLS on push_subscriptions table
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see and modify their own push subscriptions
CREATE POLICY "user_push_subs" ON push_subscriptions
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call update_updated_at() on tasks table
CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- NOTES
-- ============================================
-- After running this migration:
-- 1. Verify all tables are created: check "Table Editor" in Supabase dashboard
-- 2. Verify RLS is enabled: check "Policies" tab for each table
-- 3. Test with a user: create a task and verify it appears only for that user
