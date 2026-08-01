import test from 'node:test';
import assert from 'node:assert/strict';
import { EXPERIENCE_DIRS, EXPERIENCE_IDS } from '../index.js';

test('all Phase 7 experience IDs are defined', () => {
  assert.equal(Object.keys(EXPERIENCE_IDS).length, 11);
  assert.equal(EXPERIENCE_DIRS.length, 11);
});

test('experience dirs match EXPERIENCE_IDS values', () => {
  const ids = new Set(Object.values(EXPERIENCE_IDS));
  for (const dir of EXPERIENCE_DIRS) {
    assert.ok(ids.has(dir), `missing id for ${dir}`);
  }
});
