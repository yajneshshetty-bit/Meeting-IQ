import test from 'node:test';
import assert from 'node:assert/strict';
import { formatCurrency, ROLE_USERS, ACCOUNT_NAMES } from '../src/api/client.js';

test('formatCurrency formats thousands', () => {
  assert.equal(formatCurrency(3853000), '$3853k');
  assert.equal(formatCurrency(250000), '$250k');
});

test('ROLE_USERS maps dev roles to seeded user ids', () => {
  assert.equal(ROLE_USERS.ae, 'user_alex');
  assert.equal(ROLE_USERS.leader, 'user_leader_1');
  assert.equal(ROLE_USERS.support, 'user_support');
});

test('ACCOUNT_NAMES includes PRD accounts', () => {
  assert.equal(ACCOUNT_NAMES.acct_acme, 'Acme Corp');
  assert.equal(ACCOUNT_NAMES.acct_helion, 'Helion Energy');
});
