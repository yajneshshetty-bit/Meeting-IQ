#!/usr/bin/env node
import pg from 'pg';

const { Pool } = pg;

const ORG = {
  organization_id: 'org_infoglen',
  name: 'Infoglen',
};

const REGION = { region_id: 'region_na', organization_id: ORG.organization_id, name: 'North America' };
const BU = { business_unit_id: 'bu_gtm', organization_id: ORG.organization_id, name: 'GTM' };

const PRODUCTS = [
  { product_id: 'prod_insightcloudsec', name: 'InsightCloudSec', family: 'Cloud Security' },
  { product_id: 'prod_mdr', name: 'MDR', family: 'Managed Detection' },
  { product_id: 'prod_insightvm', name: 'InsightVM', family: 'Vulnerability Management' },
  { product_id: 'prod_exposure_command', name: 'Exposure Command Ultimate', family: 'Exposure Management' },
];

const TERRITORIES = [
  { territory_id: 'terr_west', name: 'West' },
  { territory_id: 'terr_east', name: 'East' },
];

async function main() {
  const pool = new Pool({
    connectionString: process.env.MEETINGIQ_DATABASE_URL || 'postgres://meetingiq:meetingiq@localhost:5434/meetingiq',
  });

  await pool.query(
    `INSERT INTO organizations (organization_id, name) VALUES ($1, $2)
     ON CONFLICT (organization_id) DO UPDATE SET name = EXCLUDED.name`,
    [ORG.organization_id, ORG.name],
  );

  await pool.query(
    `INSERT INTO regions (region_id, organization_id, name) VALUES ($1, $2, $3)
     ON CONFLICT (region_id) DO NOTHING`,
    [REGION.region_id, REGION.organization_id, REGION.name],
  );

  await pool.query(
    `INSERT INTO business_units (business_unit_id, organization_id, name) VALUES ($1, $2, $3)
     ON CONFLICT (business_unit_id) DO NOTHING`,
    [BU.business_unit_id, BU.organization_id, BU.name],
  );

  for (const t of TERRITORIES) {
    await pool.query(
      `INSERT INTO territories (territory_id, organization_id, region_id, name)
       VALUES ($1, $2, $3, $4) ON CONFLICT (territory_id) DO NOTHING`,
      [t.territory_id, ORG.organization_id, REGION.region_id, t.name],
    );
  }

  for (const p of PRODUCTS) {
    await pool.query(
      `INSERT INTO products (product_id, organization_id, name, family)
       VALUES ($1, $2, $3, $4) ON CONFLICT (product_id) DO NOTHING`,
      [p.product_id, ORG.organization_id, p.name, p.family],
    );
  }

  // Team created before users; manager set after users inserted
  await pool.query(
    `INSERT INTO teams (team_id, organization_id, region_id, business_unit_id, name)
     VALUES ('team_enterprise', $1, $2, $3, 'Enterprise Sales')
     ON CONFLICT (team_id) DO NOTHING`,
    [ORG.organization_id, REGION.region_id, BU.business_unit_id],
  );

  const users = [
    { user_id: 'user_leader_1', email: 'leader@infoglen.com', display_name: 'Jordan Lee', role: 'leader', manager_id: null },
    { user_id: 'user_manager_1', email: 'manager@infoglen.com', display_name: 'Sam Rivera', role: 'manager', manager_id: 'user_leader_1' },
    { user_id: 'user_alex', email: 'alex@infoglen.com', display_name: 'Alex', role: 'ae', manager_id: 'user_manager_1' },
    { user_id: 'user_priya', email: 'priya@infoglen.com', display_name: 'Priya Menon', role: 'ae', manager_id: 'user_manager_1' },
    { user_id: 'user_se_1', email: 'se@infoglen.com', display_name: 'Taylor Kim', role: 'se', manager_id: 'user_manager_1' },
    { user_id: 'user_admin', email: 'admin@infoglen.com', display_name: 'Admin User', role: 'admin', manager_id: null },
    { user_id: 'user_support', email: 'support@infoglen.com', display_name: 'Support Analyst', role: 'support', manager_id: null },
  ];

  for (const u of users) {
    await pool.query(
      `INSERT INTO users (user_id, organization_id, email, display_name, role, manager_id, team_id, region_id, business_unit_id)
       VALUES ($1, $2, $3, $4, $5, $6, 'team_enterprise', $7, $8)
       ON CONFLICT (user_id) DO UPDATE SET
         display_name = EXCLUDED.display_name,
         role = EXCLUDED.role,
         manager_id = EXCLUDED.manager_id,
         updated_at = NOW()`,
      [u.user_id, ORG.organization_id, u.email, u.display_name, u.role, u.manager_id, REGION.region_id, BU.business_unit_id],
    );
  }

  await pool.query(`UPDATE teams SET manager_id = 'user_manager_1' WHERE team_id = 'team_enterprise'`);

  await pool.query(
    `INSERT INTO user_territories (user_id, territory_id) VALUES ('user_alex', 'terr_west')
     ON CONFLICT DO NOTHING`,
  );
  await pool.query(
    `INSERT INTO user_territories (user_id, territory_id) VALUES ('user_priya', 'terr_east')
     ON CONFLICT DO NOTHING`,
  );

  await pool.query(
    `INSERT INTO user_products (user_id, product_id)
     SELECT 'user_alex', product_id FROM products WHERE organization_id = $1
     ON CONFLICT DO NOTHING`,
    [ORG.organization_id],
  );

  await pool.end();
  console.log(`Seeded ${users.length} dev users for ${ORG.name}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
