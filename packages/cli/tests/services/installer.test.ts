import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { Skill, ToolId } from '@skill-market/shared';

// Mock dependencies before importing installer
vi.mock('../../src/services/registry.js', () => ({
  RegistryClient: vi.fn().mockImplementation(() => ({
    getSkill: vi.fn(),
    downloadTarball: vi.fn(),
  })),
}));

vi.mock('../../src/services/manifest.js', () => ({
  getInstalledSkill: vi.fn(),
  setInstalledSkill: vi.fn(),
  removeInstalledSkill: vi.fn(),
}));

vi.mock('../../src/services/tools.js', () => ({
  SKILL_STORAGE_DIR: join(tmpdir(), 'skill-market-test-storage'),
  getToolById: vi.fn().mockReturnValue({
    id: 'claude-code',
    displayName: 'Claude Code',
    skillsPath: '.claude/skills',
    enabled: true,
  }),
  getToolSkillsPath: vi.fn().mockReturnValue(join(tmpdir(), 'skill-market-test-tools', '.claude', 'skills')),
}));

vi.mock('../../src/utils/checksum.js', () => ({
  verifyChecksum: vi.fn().mockResolvedValue(true),
}));

vi.mock('../../src/utils/symlink.js', () => ({
  createSymlink: vi.fn().mockResolvedValue(undefined),
  removeSymlink: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('tar', () => ({
  extract: vi.fn().mockResolvedValue(undefined),
}));

import {
  installSkill,
  uninstallSkill,
  SkillAlreadyInstalledError,
  ChecksumError,
} from '../../src/services/installer.js';
import { RegistryClient } from '../../src/services/registry.js';
import { getInstalledSkill, setInstalledSkill, removeInstalledSkill } from '../../src/services/manifest.js';
import { verifyChecksum } from '../../src/utils/checksum.js';
import { createSymlink, removeSymlink } from '../../src/utils/symlink.js';
import { SKILL_STORAGE_DIR, getToolById, getToolSkillsPath } from '../../src/services/tools.js';

describe('installer', () => {
  const testDir = join(tmpdir(), 'skill-market-installer-test');

  beforeEach(async () => {
    await mkdir(testDir, { recursive: true });
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  describe('installSkill', () => {
    const mockSkill: Skill = {
      name: 'test-skill',
      version: '1.0.0',
      description: 'A test skill',
      author: { name: 'Test Author' },
      checksum: 'abc123',
      publishedAt: '2024-01-01T00:00:00Z',
      tarballUrl: 'https://registry.example.com/test-skill/-/test-skill-1.0.0.tgz',
    };

    it('should install a skill successfully', async () => {
      const mockClient = {
        getSkill: vi.fn().mockResolvedValue(mockSkill),
        downloadTarball: vi.fn().mockResolvedValue(undefined),
      };

      vi.mocked(getInstalledSkill).mockResolvedValue(null);

      const result = await installSkill(
        mockClient as unknown as RegistryClient,
        'test-skill',
        undefined,
        ['claude-code'] as ToolId[],
        'https://registry.example.com',
        {}
      );

      expect(result.skill).toEqual(mockSkill);
      expect(mockClient.getSkill).toHaveBeenCalledWith('test-skill', undefined);
      expect(mockClient.downloadTarball).toHaveBeenCalled();
      expect(verifyChecksum).toHaveBeenCalled();
      expect(createSymlink).toHaveBeenCalled();
      expect(setInstalledSkill).toHaveBeenCalled();
    });

    it('should throw SkillAlreadyInstalledError if skill exists without force', async () => {
      vi.mocked(getInstalledSkill).mockResolvedValue({
        name: 'test-skill',
        version: '1.0.0',
        installedAt: '2024-01-01T00:00:00Z',
        checksum: 'abc123',
        tools: ['claude-code'],
        source: 'https://registry.example.com',
        storagePath: '/path/to/skill',
      });

      const mockClient = {
        getSkill: vi.fn(),
        downloadTarball: vi.fn(),
      };

      await expect(
        installSkill(
          mockClient as unknown as RegistryClient,
          'test-skill',
          undefined,
          ['claude-code'] as ToolId[],
          'https://registry.example.com',
          { force: false }
        )
      ).rejects.toThrow(SkillAlreadyInstalledError);
    });

    it('should overwrite existing skill with force option', async () => {
      vi.mocked(getInstalledSkill).mockResolvedValue({
        name: 'test-skill',
        version: '0.9.0',
        installedAt: '2024-01-01T00:00:00Z',
        checksum: 'old123',
        tools: ['claude-code'],
        source: 'https://registry.example.com',
        storagePath: '/path/to/skill',
      });

      const mockClient = {
        getSkill: vi.fn().mockResolvedValue(mockSkill),
        downloadTarball: vi.fn().mockResolvedValue(undefined),
      };

      const result = await installSkill(
        mockClient as unknown as RegistryClient,
        'test-skill',
        undefined,
        ['claude-code'] as ToolId[],
        'https://registry.example.com',
        { force: true }
      );

      expect(result.skill.version).toBe('1.0.0');
    });

    it('should throw ChecksumError if verification fails', async () => {
      vi.mocked(getInstalledSkill).mockResolvedValue(null);
      vi.mocked(verifyChecksum).mockResolvedValue(false);

      const mockClient = {
        getSkill: vi.fn().mockResolvedValue(mockSkill),
        downloadTarball: vi.fn().mockResolvedValue(undefined),
      };

      await expect(
        installSkill(
          mockClient as unknown as RegistryClient,
          'test-skill',
          undefined,
          ['claude-code'] as ToolId[],
          'https://registry.example.com',
          {}
        )
      ).rejects.toThrow(ChecksumError);
    });

    it('should call onProgress callback during installation', async () => {
      vi.mocked(getInstalledSkill).mockResolvedValue(null);
      vi.mocked(verifyChecksum).mockResolvedValue(true);

      const mockClient = {
        getSkill: vi.fn().mockResolvedValue(mockSkill),
        downloadTarball: vi.fn().mockResolvedValue(undefined),
      };

      const onProgress = vi.fn();

      await installSkill(
        mockClient as unknown as RegistryClient,
        'test-skill',
        undefined,
        ['claude-code'] as ToolId[],
        'https://registry.example.com',
        { onProgress }
      );

      expect(onProgress).toHaveBeenCalledWith('fetching');
      expect(onProgress).toHaveBeenCalledWith('downloading');
      expect(onProgress).toHaveBeenCalledWith('verifying');
      expect(onProgress).toHaveBeenCalledWith('extracting');
      expect(onProgress).toHaveBeenCalledWith('linking');
      expect(onProgress).toHaveBeenCalledWith('complete');
    });
  });

  describe('uninstallSkill', () => {
    it('should return false if skill is not installed', async () => {
      vi.mocked(getInstalledSkill).mockResolvedValue(null);

      const result = await uninstallSkill('nonexistent');

      expect(result).toBe(false);
    });

    it('should uninstall skill and remove symlinks', async () => {
      vi.mocked(getInstalledSkill).mockResolvedValue({
        name: 'test-skill',
        version: '1.0.0',
        installedAt: '2024-01-01T00:00:00Z',
        checksum: 'abc123',
        tools: ['claude-code'],
        source: 'https://registry.example.com',
        storagePath: join(testDir, 'test-skill'),
      });

      // Create the directory to be removed
      await mkdir(join(testDir, 'test-skill'), { recursive: true });

      const result = await uninstallSkill('test-skill');

      expect(result).toBe(true);
      expect(removeSymlink).toHaveBeenCalled();
      expect(removeInstalledSkill).toHaveBeenCalledWith('test-skill');
    });
  });

  describe('error classes', () => {
    it('SkillAlreadyInstalledError should have correct properties', () => {
      const error = new SkillAlreadyInstalledError('my-skill', '1.0.0');

      expect(error.name).toBe('SkillAlreadyInstalledError');
      expect(error.skillName).toBe('my-skill');
      expect(error.version).toBe('1.0.0');
      expect(error.message).toContain('my-skill@1.0.0');
      expect(error.message).toContain('--force');
    });

    it('ChecksumError should have correct properties', () => {
      const error = new ChecksumError('my-skill', 'expected-hash');

      expect(error.name).toBe('ChecksumError');
      expect(error.skillName).toBe('my-skill');
      expect(error.expected).toBe('expected-hash');
      expect(error.message).toContain('my-skill');
    });
  });
});
