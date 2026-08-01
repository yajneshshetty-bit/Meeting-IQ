import test from 'node:test';
import assert from 'node:assert/strict';
import { entityInScope, filterEntities, canAccessExecutive, isSupportOnly } from '../src/services/scope.js';

const alexCtx = {
  userId: 'user_alex',
  role: 'ae',
  visibleUserIds: ['user_alex'],
  territoryIds: ['terr_west'],
  entitlements: ['meetingiq.read', 'meetingiq.execute'],
};

const managerCtx = {
  userId: 'user_manager_1',
  role: 'manager',
  visibleUserIds: ['user_manager_1', 'user_alex', 'user_priya'],
  territoryIds: [],
  entitlements: ['meetingiq.read', 'meetingiq.execute', 'meetingiq.team.read'],
};

const leaderCtx = {
  userId: 'user_leader_1',
  role: 'leader',
  visibleUserIds: ['user_alex', 'user_priya', 'user_manager_1'],
  territoryIds: [],
  entitlements: ['meetingiq.read', 'meetingiq.execute', 'meetingiq.executive.read'],
};

const supportCtx = {
  userId: 'user_support',
  role: 'support',
  visibleUserIds: ['user_support'],
  territoryIds: [],
  entitlements: ['meetingiq.read', 'meetingiq.support.read'],
};

test('entityInScope: AE sees own opportunity', () => {
  const opp = { entity_type: 'opportunity', payload: { owner_id: 'user_alex', name: 'Deal' } };
  assert.ok(entityInScope(opp, alexCtx));
});

test('entityInScope: AE cannot see Priya opportunity', () => {
  const opp = { entity_type: 'opportunity', payload: { owner_id: 'user_priya', name: 'Deal' } };
  assert.equal(entityInScope(opp, alexCtx), false);
});

test('entityInScope: manager sees report opportunity', () => {
  const opp = { entity_type: 'opportunity', payload: { owner_id: 'user_priya', name: 'Deal' } };
  assert.ok(entityInScope(opp, managerCtx));
});

test('entityInScope: leader sees all opportunities', () => {
  const opp = { entity_type: 'opportunity', payload: { owner_id: 'user_priya', name: 'Deal' } };
  assert.ok(entityInScope(opp, leaderCtx));
});

test('entityInScope: support sees support_case only', () => {
  const ticket = { entity_type: 'support_case', payload: { subject: 'Help' } };
  const opp = { entity_type: 'opportunity', payload: { owner_id: 'user_alex' } };
  assert.ok(entityInScope(ticket, supportCtx));
  assert.equal(entityInScope(opp, supportCtx), false);
});

test('canAccessExecutive: leader yes, AE no', () => {
  assert.ok(canAccessExecutive(leaderCtx));
  assert.equal(canAccessExecutive(alexCtx), false);
});

test('isSupportOnly identifies support role', () => {
  assert.ok(isSupportOnly(supportCtx));
  assert.equal(isSupportOnly(alexCtx), false);
});

test('filterEntities applies scope to list', () => {
  const entities = [
    { entity_type: 'opportunity', payload: { owner_id: 'user_alex' } },
    { entity_type: 'opportunity', payload: { owner_id: 'user_priya' } },
  ];
  const scoped = filterEntities(entities, alexCtx);
  assert.equal(scoped.length, 1);
  assert.equal(scoped[0].payload.owner_id, 'user_alex');
});
