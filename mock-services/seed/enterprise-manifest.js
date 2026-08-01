/** Cross-service enterprise IDs — single source of truth for mock seed data */

export const ORG_ID = 'org_infoglen';

export const ACCOUNTS = [
  { account_id: 'acct_acme', name: 'Acme Corp', tier: 'enterprise', health_score: 82, territory_id: 'terr_west', owner_id: 'user_alex' },
  { account_id: 'acct_orbit', name: 'Orbit Media', tier: 'mid-market', health_score: 71, territory_id: 'terr_east', owner_id: 'user_priya' },
  { account_id: 'acct_quanta', name: 'Quanta Logistics', tier: 'enterprise', health_score: 76, territory_id: 'terr_west', owner_id: 'user_alex' },
  { account_id: 'acct_infoglen', name: 'Infoglen', tier: 'enterprise', health_score: 88, territory_id: 'terr_east', owner_id: 'user_priya' },
  { account_id: 'acct_aspen', name: 'Aspen Digital', tier: 'enterprise', health_score: 65, territory_id: 'terr_west', owner_id: 'user_alex' },
  { account_id: 'acct_brightwave', name: 'Brightwave Media', tier: 'mid-market', health_score: 79, territory_id: 'terr_east', owner_id: 'user_priya' },
  { account_id: 'acct_granite', name: 'Granite State Bank', tier: 'enterprise', health_score: 91, territory_id: 'terr_east', owner_id: 'user_priya' },
  { account_id: 'acct_helion', name: 'Helion Energy', tier: 'enterprise', health_score: 58, territory_id: 'terr_west', owner_id: 'user_alex' },
];

export const PRODUCTS = [
  { product_id: 'prod_insightcloudsec', name: 'InsightCloudSec', family: 'Cloud Security' },
  { product_id: 'prod_mdr', name: 'MDR', family: 'Managed Detection' },
  { product_id: 'prod_insightvm', name: 'InsightVM', family: 'Vulnerability Management' },
  { product_id: 'prod_exposure_command', name: 'Exposure Command Ultimate', family: 'Exposure Management' },
];

export const OPPORTUNITIES = [
  { opportunity_id: 'OPP-1842', account_id: 'acct_acme', name: 'Command Platform', stage: 'negotiation', amount: 250000, commit_amount: 188000, product_id: 'prod_exposure_command', owner_id: 'user_alex', risk_level: 'at_risk', quarter: 'Q3-2026' },
  { opportunity_id: 'OPP-2808', account_id: 'acct_aspen', name: 'MDR', stage: 'negotiation', amount: 150000, commit_amount: 103200, product_id: 'prod_mdr', owner_id: 'user_alex', risk_level: 'at_risk', quarter: 'Q3-2026' },
  { opportunity_id: 'OPP-2101', account_id: 'acct_brightwave', name: 'InsightCloudSec', stage: 'expansion', amount: 128000, commit_amount: 114700, product_id: 'prod_insightcloudsec', owner_id: 'user_priya', risk_level: 'none', quarter: 'Q3-2026' },
  { opportunity_id: 'OPP-2102', account_id: 'acct_brightwave', name: 'Expansion (InsightCloudSec)', stage: 'expansion', amount: 48000, commit_amount: 46800, product_id: 'prod_insightcloudsec', owner_id: 'user_priya', risk_level: 'none', quarter: 'Q3-2026' },
  { opportunity_id: 'OPP-2009', account_id: 'acct_granite', name: 'InsightVM', stage: 'closed_won', amount: 360000, commit_amount: 356400, product_id: 'prod_insightvm', owner_id: 'user_priya', risk_level: 'none', quarter: 'Q3-2026' },
  { opportunity_id: 'OPP-2811', account_id: 'acct_helion', name: 'Helios Energy - Exposure Command Ultimate', stage: 'closed_lost', amount: 340000, commit_amount: 309400, product_id: 'prod_exposure_command', owner_id: 'user_alex', risk_level: 'rising', quarter: 'Q3-2026' },
  { opportunity_id: 'OPP-3001', account_id: 'acct_orbit', name: 'Orbit Media Platform', stage: 'discovery', amount: 95000, commit_amount: 45000, product_id: 'prod_insightcloudsec', owner_id: 'user_priya', risk_level: 'none', quarter: 'Q3-2026' },
  { opportunity_id: 'OPP-3002', account_id: 'acct_quanta', name: 'Security Review Package', stage: 'negotiation', amount: 220000, commit_amount: 180000, product_id: 'prod_mdr', owner_id: 'user_alex', risk_level: 'rising', quarter: 'Q3-2026' },
];

export const CONTACTS = [
  { contact_id: 'cnt_priya', account_id: 'acct_acme', name: 'Priya Menon', email: 'priya.menon@acme.com', title: 'Director IT Security', role: 'champion' },
  { contact_id: 'cnt_jordan', account_id: 'acct_acme', name: 'Jordan Lee', email: 'jordan.lee@acme.com', title: 'VP Engineering', role: 'economic_buyer' },
  { contact_id: 'cnt_sam', account_id: 'acct_orbit', name: 'Sam Orbit', email: 'sam@orbitmedia.com', title: 'CTO', role: 'technical' },
];

export const MEETINGS = [
  { meeting_id: 'mtg_acme_pricing', title: 'Acme Corp – Pricing & procurement', account_id: 'acct_acme', opportunity_id: 'OPP-1842', start_time: '2026-07-27T11:00:00Z', end_time: '2026-07-27T12:00:00Z', meeting_type: 'opportunity', organizer_id: 'user_alex', attendee_ids: ['user_alex', 'cnt_priya'], status: 'scheduled' },
  { meeting_id: 'mtg_orbit_intro', title: 'Orbit Media – Intro call', account_id: 'acct_orbit', opportunity_id: 'OPP-3001', start_time: '2026-07-28T10:00:00Z', end_time: '2026-07-28T10:45:00Z', meeting_type: 'new_account', organizer_id: 'user_priya', attendee_ids: ['user_priya', 'cnt_sam'], status: 'scheduled' },
  { meeting_id: 'mtg_quanta_sec', title: 'Quanta Logistics – Security review', account_id: 'acct_quanta', opportunity_id: 'OPP-3002', start_time: '2026-07-28T14:00:00Z', end_time: '2026-07-28T15:30:00Z', meeting_type: 'opportunity', organizer_id: 'user_alex', attendee_ids: ['user_alex', 'user_se_1'], status: 'scheduled' },
  { meeting_id: 'mtg_infoglen_demo', title: 'Infoglen – Platform demo (LIVE demo slot)', account_id: 'acct_infoglen', opportunity_id: null, start_time: '2026-07-29T11:00:00Z', end_time: '2026-07-29T12:00:00Z', meeting_type: 'opportunity', organizer_id: 'user_priya', attendee_ids: ['user_priya', 'user_se_1'], status: 'scheduled', is_live: true },
  { meeting_id: 'mtg_acme_poc', title: 'Acme Corp – POC scoping', account_id: 'acct_acme', opportunity_id: 'OPP-1842', start_time: '2026-07-29T13:00:00Z', end_time: '2026-07-29T14:00:00Z', meeting_type: 'opportunity', organizer_id: 'user_alex', attendee_ids: ['user_alex', 'cnt_jordan'], status: 'scheduled' },
  { meeting_id: 'mtg_forecast', title: 'Internal – Forecast call', account_id: null, opportunity_id: null, start_time: '2026-07-29T16:00:00Z', end_time: '2026-07-29T17:00:00Z', meeting_type: 'internal', organizer_id: 'user_manager_1', attendee_ids: ['user_manager_1', 'user_alex', 'user_priya'], status: 'scheduled' },
];

export const API_KEY = 'mock-enterprise-key';
