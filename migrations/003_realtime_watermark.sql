-- Phase 8: realtime outbox watermark + latency samples for correctness matrix

CREATE TABLE IF NOT EXISTS realtime_watermarks (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS realtime_latency_samples (
  id           SERIAL PRIMARY KEY,
  event_type   TEXT NOT NULL,
  stage        TEXT NOT NULL,
  duration_ms  INT NOT NULL,
  recorded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_realtime_latency_event ON realtime_latency_samples(event_type, stage);

INSERT INTO realtime_watermarks (key, value) VALUES ('zambyl_outbox_id', '0')
ON CONFLICT (key) DO NOTHING;
