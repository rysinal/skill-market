import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { calculateChecksum, verifyChecksum } from '../../src/utils/checksum.js';

describe('checksum', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = join(tmpdir(), `checksum-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  describe('calculateChecksum', () => {
    it('should calculate SHA256 checksum of a file', async () => {
      const testFile = join(testDir, 'test.txt');
      await writeFile(testFile, 'hello world');

      const checksum = await calculateChecksum(testFile);

      // SHA256 of "hello world"
      expect(checksum).toBe('b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9');
    });

    it('should return different checksums for different content', async () => {
      const file1 = join(testDir, 'file1.txt');
      const file2 = join(testDir, 'file2.txt');
      await writeFile(file1, 'content1');
      await writeFile(file2, 'content2');

      const checksum1 = await calculateChecksum(file1);
      const checksum2 = await calculateChecksum(file2);

      expect(checksum1).not.toBe(checksum2);
    });

    it('should handle empty files', async () => {
      const emptyFile = join(testDir, 'empty.txt');
      await writeFile(emptyFile, '');

      const checksum = await calculateChecksum(emptyFile);

      // SHA256 of empty string
      expect(checksum).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    });
  });

  describe('verifyChecksum', () => {
    it('should return true for matching checksum', async () => {
      const testFile = join(testDir, 'test.txt');
      await writeFile(testFile, 'hello world');

      const result = await verifyChecksum(
        testFile,
        'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'
      );

      expect(result).toBe(true);
    });

    it('should return false for non-matching checksum', async () => {
      const testFile = join(testDir, 'test.txt');
      await writeFile(testFile, 'hello world');

      const result = await verifyChecksum(testFile, 'invalid-checksum');

      expect(result).toBe(false);
    });
  });
});
