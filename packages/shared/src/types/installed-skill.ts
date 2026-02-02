/**
 * Record of an installed skill
 */
export interface InstalledSkill {
  /** Skill name */
  name: string;
  /** Installed version */
  version: string;
  /** ISO 8601 installation timestamp */
  installedAt: string;
  /** SHA256 checksum of installed tarball */
  checksum: string;
  /** Tool IDs where this skill is linked */
  tools: string[];
  /** Registry URL from which skill was installed */
  source: string;
  /** Absolute path to skill storage location */
  storagePath: string;
}
