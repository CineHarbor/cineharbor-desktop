// Missing, duplicated, cancelled and failed platform jobs all block promotion.
export const REQUIRED_PLATFORMS = Object.freeze(['macOS Intel', 'macOS Apple Silicon', 'Windows x64']);

export function evaluatePlatformBuilds(jobs) {
  if (!Array.isArray(jobs)) throw new TypeError('Expected a workflow job array');
  const succeededPlatforms = [];
  const failedPlatforms = [];
  for (const name of REQUIRED_PLATFORMS) {
    const matches = jobs.filter((job) => job.name === name);
    if (matches.length === 1 && matches[0].status === 'completed' && matches[0].conclusion === 'success') {
      succeededPlatforms.push(name);
    } else {
      const reason = matches.length === 0 ? 'missing' : matches.length > 1 ? 'duplicate' : matches[0].conclusion || matches[0].status || 'unknown';
      failedPlatforms.push(`${name} (${reason})`);
    }
  }
  return { complete: failedPlatforms.length === 0, successCount: succeededPlatforms.length, totalCount: REQUIRED_PLATFORMS.length, succeededPlatforms, failedPlatforms };
}

export function assertDraftCandidate(release) {
  if (!release || release.draft !== true) throw new Error('Refusing to modify an already public release during candidate preparation');
}
