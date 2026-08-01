-- Phase 5: per-user widget layout/settings for Command Center and Executive views

CREATE TABLE IF NOT EXISTS widget_configs (
  config_id   TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  view        TEXT NOT NULL CHECK (view IN ('command_center', 'executive')),
  widget_key  TEXT NOT NULL,
  layout      JSONB NOT NULL DEFAULT '{}',
  settings    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, view, widget_key)
);

CREATE INDEX IF NOT EXISTS idx_widget_configs_user_view ON widget_configs(user_id, view);
