import type { Skill, InstalledSkill, ToolId } from '@skill-market/shared';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import * as tar from 'tar';
import { RegistryClient, type DownloadProgress } from './registry.js';
import { setInstalledSkill, getInstalledSkill } from './manifest.js';
import { SKILL_STORAGE_DIR, getToolById, getToolSkillsPath } from './tools.js';
import { verifyChecksum } from '../utils/checksum.js';
import { createSymlink, removeSymlink } from '../utils/symlink.js';

export interface InstallOptions {
  force?: boolean;
  onProgress?: (stage: InstallStage, progress?: DownloadProgress) => void;
}

export type InstallStage =
  | 'fetching'
  | 'downloading'
  | 'verifying'
  | 'extracting'
  | 'linking'
  | 'complete';

export interface InstallResult {
  skill: Skill;
  storagePath: string;
  links: Array<{ tool: string; path: string }>;
}

/**
 * Install a skill from the registry
 */
export async function installSkill(
  client: RegistryClient,
  skillName: string,
  version: string | undefined,
  tools: ToolId[],
  registryUrl: string,
  options: InstallOptions = {}
): Promise<InstallResult> {
  const { force = false, onProgress } = options;

  // Check if already installed
  const existing = await getInstalledSkill(skillName);
  if (existing && !force) {
    throw new SkillAlreadyInstalledError(skillName, existing.version);
  }

  // Fetch skill metadata
  onProgress?.('fetching');
  const skill = await client.getSkill(skillName, version);

  // Prepare storage directory
  const skillDir = join(SKILL_STORAGE_DIR, skill.name, skill.version);
  await mkdir(skillDir, { recursive: true });

  const tarballPath = join(skillDir, 'package.tgz');

  try {
    // Download tarball
    onProgress?.('downloading');
    await client.downloadTarball(skill, tarballPath, (progress) => {
      onProgress?.('downloading', progress);
    });

    // Verify checksum
    onProgress?.('verifying');
    const isValid = await verifyChecksum(tarballPath, skill.checksum);
    if (!isValid) {
      throw new ChecksumError(skillName, skill.checksum);
    }

    // Extract tarball
    onProgress?.('extracting');
    await tar.extract({
      file: tarballPath,
      cwd: skillDir,
      strip: 1,
    });

    // Create symlinks for each tool
    onProgress?.('linking');
    const links: Array<{ tool: string; path: string }> = [];

    for (const toolId of tools) {
      const tool = getToolById(toolId);
      if (!tool) continue;

      const toolSkillsDir = getToolSkillsPath(tool);
      const linkPath = join(toolSkillsDir, skill.name);

      await createSymlink(skillDir, linkPath);
      links.push({ tool: toolId, path: linkPath });
    }

    // Update manifest
    const installedSkill: InstalledSkill = {
      name: skill.name,
      version: skill.version,
      installedAt: new Date().toISOString(),
      checksum: skill.checksum,
      tools: tools,
      source: registryUrl,
      storagePath: skillDir,
    };
    await setInstalledSkill(installedSkill);

    onProgress?.('complete');

    return {
      skill,
      storagePath: skillDir,
      links,
    };
  } catch (error) {
    // Cleanup on failure
    await rm(skillDir, { recursive: true, force: true }).catch(() => {});
    throw error;
  }
}

/**
 * Uninstall a skill
 */
export async function uninstallSkill(skillName: string): Promise<boolean> {
  const installed = await getInstalledSkill(skillName);
  if (!installed) {
    return false;
  }

  // Remove symlinks
  for (const toolId of installed.tools) {
    const tool = getToolById(toolId);
    if (!tool) continue;

    const toolSkillsDir = getToolSkillsPath(tool);
    const linkPath = join(toolSkillsDir, skillName);
    await removeSymlink(linkPath);
  }

  // Remove storage directory
  await rm(installed.storagePath, { recursive: true, force: true });

  // Update manifest
  const { removeInstalledSkill } = await import('./manifest.js');
  await removeInstalledSkill(skillName);

  return true;
}

/**
 * Error when skill is already installed
 */
export class SkillAlreadyInstalledError extends Error {
  constructor(
    public skillName: string,
    public version: string
  ) {
    super(`Skill ${skillName}@${version} is already installed. Use --force to overwrite.`);
    this.name = 'SkillAlreadyInstalledError';
  }
}

/**
 * Error when checksum verification fails
 */
export class ChecksumError extends Error {
  constructor(
    public skillName: string,
    public expected: string
  ) {
    super(`Checksum verification failed for ${skillName}`);
    this.name = 'ChecksumError';
  }
}
