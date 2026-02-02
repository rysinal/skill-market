/**
 * Skill metadata from registry
 */
export interface Skill {
  /** Unique skill identifier */
  name: string;
  /** Semantic version */
  version: string;
  /** Human-readable description */
  description: string;
  /** Author information */
  author: {
    name: string;
    email?: string;
  };
  /** SHA256 checksum of tarball */
  checksum: string;
  /** Optional dependencies */
  dependencies?: Record<string, string>;
  /** Searchable keywords */
  keywords?: string[];
  /** ISO 8601 publish timestamp */
  publishedAt: string;
  /** URL to download tarball */
  tarballUrl: string;
}

/**
 * Skill version info for listing
 */
export interface SkillVersion {
  version: string;
  publishedAt: string;
  checksum: string;
}

/**
 * Skill search result
 */
export interface SkillSearchResult {
  name: string;
  description: string;
  latestVersion: string;
  keywords?: string[];
}
