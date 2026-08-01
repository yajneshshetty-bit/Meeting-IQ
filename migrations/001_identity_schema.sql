-- MeetingIQ identity & hierarchy schema (Phase 1)
-- Authority: docs/DOMAIN_MODEL.md

CREATE TABLE IF NOT EXISTS organizations (
  organization_id TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS regions (
  region_id       TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(organization_id),
  name            TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS business_units (
  business_unit_id TEXT PRIMARY KEY,
  organization_id  TEXT NOT NULL REFERENCES organizations(organization_id),
  name             TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teams (
  team_id         TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(organization_id),
  region_id       TEXT REFERENCES regions(region_id),
  business_unit_id TEXT REFERENCES business_units(business_unit_id),
  name            TEXT NOT NULL,
  manager_id      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS territories (
  territory_id    TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(organization_id),
  region_id       TEXT REFERENCES regions(region_id),
  name            TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  product_id      TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(organization_id),
  name            TEXT NOT NULL,
  family          TEXT,
  active          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE user_role AS ENUM ('ae', 'manager', 'se', 'leader', 'admin', 'support');

CREATE TABLE IF NOT EXISTS users (
  user_id         TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(organization_id),
  email           TEXT NOT NULL UNIQUE,
  display_name    TEXT NOT NULL,
  role            user_role NOT NULL,
  manager_id      TEXT REFERENCES users(user_id),
  team_id         TEXT REFERENCES teams(team_id),
  region_id       TEXT REFERENCES regions(region_id),
  business_unit_id TEXT REFERENCES business_units(business_unit_id),
  password_hash   TEXT,
  active          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE teams
  ADD CONSTRAINT teams_manager_id_fkey
  FOREIGN KEY (manager_id) REFERENCES users(user_id);

CREATE TABLE IF NOT EXISTS user_territories (
  user_id      TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  territory_id TEXT NOT NULL REFERENCES territories(territory_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, territory_id)
);

CREATE TABLE IF NOT EXISTS user_products (
  user_id    TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS schema_migrations (
  version    TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_manager ON users(manager_id);
CREATE INDEX IF NOT EXISTS idx_users_team ON users(team_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
