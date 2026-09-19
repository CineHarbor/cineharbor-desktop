import assert from 'node:assert/strict';
import test from 'node:test';
import { REQUIRED_PLATFORMS, assertDraftCandidate, evaluatePlatformBuilds } from '../../scripts/release-gates.mjs';

const passing = () => REQUIRED_PLATFORMS.map((name) => ({ name, status: 'completed', conclusion: 'success' }));

test('exactly three successful completed platform builds pass', () => {
  assert.equal(evaluatePlatformBuilds(passing()).complete, true);
  assert.equal(evaluatePlatformBuilds(passing()).totalCount, 3);
});
for (const conclusion of ['failure', 'cancelled', 'skipped', 'timed_out', 'neutral', null]) {
  test(`a ${conclusion} platform blocks promotion`, () => {
    const jobs = passing(); jobs[1].conclusion = conclusion;
    assert.equal(evaluatePlatformBuilds(jobs).complete, false);
  });
}
test('missing, duplicate or still-running platform jobs never count as success', () => {
  assert.equal(evaluatePlatformBuilds(passing().slice(0, 2)).complete, false);
  assert.equal(evaluatePlatformBuilds([...passing(), passing()[0]]).complete, false);
  const jobs = passing(); jobs[0].status = 'in_progress';
  assert.equal(evaluatePlatformBuilds(jobs).complete, false);
  assert.equal(evaluatePlatformBuilds([]).complete, false);
});
test('candidate preparation cannot mutate public, unknown or malformed releases', () => {
  assert.doesNotThrow(() => assertDraftCandidate({ draft: true }));
  for (const release of [null, {}, { draft: false }, { draft: 'true' }]) assert.throws(() => assertDraftCandidate(release), /already public release/);
});
