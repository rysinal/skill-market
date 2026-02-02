import type { GlobalManifest, InstalledSkill } from '@skill-market/shared';
import { MANIFEST_VERSION } from '@skill-market/shared';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { MANIFEST_PATH } from './tools.js';

/**
 * Create an empty manifest
 */
function createEmptyManifest(): GlobalManifest {
  return {
    version: MANIFEST_VERSION,
    skills: {},
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Read the global manifest file
 */
export async function readManifest(): Promise<GlobalManifest> {
  try {
    const content = await readFile(MANIFEST_PATH, 'utf-8');
    return JSON.parse(content) as GlobalManifest;
  } catch {
    return createEmptyManifest();
  }
}

/**
 * Write the global manifest file
 */
export async function writeManifest(manifest: GlobalManifest): Promise<void> {
  manifest.updatedAt = new Date().toISOString();
  await mkdir(dirname(MANIFEST_PATH), { recursive: true });
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
}

/**
 * Get an installed skill by name
 */
export async function getInstalledSkill(name: string): Promise<InstalledSkill | undefined> {
  const manifest = await readManifest();
  return manifest.skills[name];
}

/**
 * Add or update an installed skill in the manifest
 */
export async function setInstalledSkill(skill: InstalledSkill): Promise<void> {
  const manifest = await readManifest();
  manifest.skills[skill.name] = skill;
  await writeManifest(manifest);
}

/**
 * Remove an installed skill from the manifest
 */
export async function removeInstalledSkill(name: string): Promise<boolean> {
  const manifest = await readManifest();
  if (manifest.skills[name]) {
    delete manifest.skills[name];
    await writeManifest(manifest);
    return true;
  }
  return false;
}

/**
 * Get all installed skills
 */
export async function getAllInstalledSkills(): Promise<InstalledSkill[]> {
  const manifest = await readManifest();
  return Object.values(manifest.skills);
}
