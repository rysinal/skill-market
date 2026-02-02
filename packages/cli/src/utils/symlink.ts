import { symlink, unlink, mkdir, readlink, lstat } from 'node:fs/promises';
import { dirname } from 'node:path';

/**
 * Create a symbolic link, handling cross-platform differences
 * On Windows, uses junction for directories
 */
export async function createSymlink(target: string, linkPath: string): Promise<void> {
  // Ensure parent directory exists
  await mkdir(dirname(linkPath), { recursive: true });

  // Remove existing link if present
  try {
    const stats = await lstat(linkPath);
    if (stats.isSymbolicLink()) {
      await unlink(linkPath);
    }
  } catch {
    // Link doesn't exist, which is fine
  }

  // Create symlink (use 'junction' on Windows for directory links)
  const type = process.platform === 'win32' ? 'junction' : undefined;
  await symlink(target, linkPath, type);
}

/**
 * Remove a symbolic link if it exists
 */
export async function removeSymlink(linkPath: string): Promise<boolean> {
  try {
    const stats = await lstat(linkPath);
    if (stats.isSymbolicLink()) {
      await unlink(linkPath);
      return true;
    }
  } catch {
    // Link doesn't exist
  }
  return false;
}

/**
 * Check if a path is a symbolic link
 */
export async function isSymlink(path: string): Promise<boolean> {
  try {
    const stats = await lstat(path);
    return stats.isSymbolicLink();
  } catch {
    return false;
  }
}

/**
 * Get the target of a symbolic link
 */
export async function getSymlinkTarget(linkPath: string): Promise<string | null> {
  try {
    return await readlink(linkPath);
  } catch {
    return null;
  }
}
