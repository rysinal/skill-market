import type { InstalledSkill } from './installed-skill.js';

/**
 * Global manifest tracking all installed skills
 * Stored at ~/.skill-market/manifest.json
 */
export interface GlobalManifest {
  /** Manifest schema version */
  version: string;
  /** Map of skill name to installation record */
  skills: Record<string, InstalledSkill>;
  /** ISO 8601 timestamp of last update */
  updatedAt: string;
}

/**
 * Current manifest schema version
 */
export const MANIFEST_VERSION = '1.0.0';
