import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm, readlink, lstat } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  createSymlink,
  removeSymlink,
  isSymlink,
  getSymlinkTarget,
} from '../../src/utils/symlink.js';

describe('symlink', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = join(tmpdir(), `symlink-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  describe('createSymlink', () => {
    it('should create a symbolic link', async () => {
      const targetDir = join(testDir, 'target');
      const linkPath = join(testDir, 'link');
      await mkdir(targetDir);

      await createSymlink(targetDir, linkPath);

      const stats = await lstat(linkPath);
      expect(stats.isSymbolicLink()).toBe(true);
    });

    it('should create parent directories if needed', async () => {
      const targetDir = join(testDir, 'target');
      const linkPath = join(testDir, 'nested', 'deep', 'link');
      await mkdir(targetDir);

      await createSymlink(targetDir, linkPath);

      const stats = await lstat(linkPath);
      expect(stats.isSymbolicLink()).toBe(true);
    });

    it('should replace existing symlink', async () => {
      const target1 = join(testDir, 'target1');
      const target2 = join(testDir, 'target2');
      const linkPath = join(testDir, 'link');
      await mkdir(target1);
      await mkdir(target2);

      await createSymlink(target1, linkPath);
      await createSymlink(target2, linkPath);

      const actualTarget = await readlink(linkPath);
      expect(actualTarget).toBe(target2);
    });
  });

  describe('removeSymlink', () => {
    it('should remove an existing symlink', async () => {
      const targetDir = join(testDir, 'target');
      const linkPath = join(testDir, 'link');
      await mkdir(targetDir);
      await createSymlink(targetDir, linkPath);

      const result = await removeSymlink(linkPath);

      expect(result).toBe(true);
      await expect(lstat(linkPath)).rejects.toThrow();
    });

    it('should return false for non-existent path', async () => {
      const linkPath = join(testDir, 'nonexistent');

      const result = await removeSymlink(linkPath);

      expect(result).toBe(false);
    });
  });

  describe('isSymlink', () => {
    it('should return true for symlinks', async () => {
      const targetDir = join(testDir, 'target');
      const linkPath = join(testDir, 'link');
      await mkdir(targetDir);
      await createSymlink(targetDir, linkPath);

      const result = await isSymlink(linkPath);

      expect(result).toBe(true);
    });

    it('should return false for regular directories', async () => {
      const dir = join(testDir, 'regular');
      await mkdir(dir);

      const result = await isSymlink(dir);

      expect(result).toBe(false);
    });

    it('should return false for non-existent paths', async () => {
      const result = await isSymlink(join(testDir, 'nonexistent'));

      expect(result).toBe(false);
    });
  });

  describe('getSymlinkTarget', () => {
    it('should return the target of a symlink', async () => {
      const targetDir = join(testDir, 'target');
      const linkPath = join(testDir, 'link');
      await mkdir(targetDir);
      await createSymlink(targetDir, linkPath);

      const target = await getSymlinkTarget(linkPath);

      expect(target).toBe(targetDir);
    });

    it('should return null for non-symlinks', async () => {
      const dir = join(testDir, 'regular');
      await mkdir(dir);

      const target = await getSymlinkTarget(dir);

      expect(target).toBe(null);
    });
  });
});
