import { readFileSync } from 'node:fs';
import path from 'node:path';

const workflow = () => readFileSync(path.join(process.cwd(), '.github/workflows/desktop-release.yml'), 'utf8');

describe('desktop release candidate safety', () => {
  it('requires every expected platform instead of publishing partial success', () => {
    expect(workflow()).toContain('evaluatePlatformBuilds(jobs)');
    expect(workflow()).not.toContain("successCount > 0 ? 'true' : 'false'");
    expect(workflow()).toContain("should_publish == 'true'");
  });
  it('creates draft assets and never publishes the live updater during preparation', () => {
    expect(workflow()).toContain('releaseDraft: true');
    expect(workflow()).not.toContain('releaseDraft: false');
    expect(workflow()).not.toContain('publish-desktop-updater-manifest.mjs');
    expect(workflow()).not.toContain(": 'neutral'");
  });
  it('still publishes an explicit complete-platform summary', () => {
    expect(workflow()).toContain('publish_release_summary:');
    expect(workflow()).toContain('github.rest.checks.create');
    expect(workflow()).toContain('needs: [publish_release, release_outcome]');
  });
});
