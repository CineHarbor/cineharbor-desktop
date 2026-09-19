const STABLE_DESKTOP_RELEASE_TAG_PATTERN = /^desktop-v(\d+\.\d+\.\d+)$/;
const BETA_DESKTOP_RELEASE_TAG_PATTERN =
  /^desktop-v((\d+\.\d+\.\d+)-beta\.(\d+))$/;

function normalizeTagName(tagName) {
  const normalizedTagName = String(tagName || '').trim();
  if (!normalizedTagName) {
    throw new Error('Desktop release tag is required');
  }

  return normalizedTagName;
}

function buildDesktopReleaseDescriptor({ tagName }) {
  const normalizedTagName = normalizeTagName(tagName);
  const stableMatch = normalizedTagName.match(
    STABLE_DESKTOP_RELEASE_TAG_PATTERN
  );
  if (stableMatch) {
    const [, version] = stableMatch;
    return {
      version,
      title: `CineHarbor Desktop ${version}`,
      prerelease: false,
      draft: true,
    };
  }

  const betaMatch = normalizedTagName.match(BETA_DESKTOP_RELEASE_TAG_PATTERN);
  if (betaMatch) {
    const [, version, baseVersion, sequence] = betaMatch;
    return {
      version,
      title: `CineHarbor Desktop ${baseVersion} Beta ${sequence}`,
      prerelease: true,
      draft: true,
    };
  }

  throw new Error(`Unsupported desktop release tag: ${normalizedTagName}`);
}

module.exports = {
  buildDesktopReleaseDescriptor,
};
