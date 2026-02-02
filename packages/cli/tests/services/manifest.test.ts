import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { writeFile, mkdir, rm, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// Mock the MANIFEST_PATH before importing
const testManifestDir = join(tmpdir(), `manifest-test-${Date.now()}`);
const testManifestPath = join(testManifestDir, 'manifest.json');

vi.mock('../../src/services/tools.js', () => ({
  MANIFEST_PATH: testManifestPath,
}));

// Import after mocking
const { readManifest, writeManifest, getInstalledSkill, setInstalledSkill, removeInstalledSkill, getAllInstalledSkills } = await import('../../src/services/manifest.js');

describe('manifest', () => {
  beforeEach(async () => {
    await mkdir(testManifestDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testManifestDir, { recursive: true, force: true });
    vi.clearAllMocks();
  });

  describe('readManifest', () => {
    it('should return empty manifest when file does not exist', async () => {
      const manifest = await readManifest();

      expect(manifest.version).toBe('1.0.0');
      expect(manifest.skills).toEqual({});
    });

    it('should read existing manifest', async () => {
      const existingManifest = {
        version: '1.0.0',
        skills: {
          'test-skill': {
            name: 'test-skill',
            version: '1.0.0',
            installedAt: '2024-01-01T00:00:00.000Z',
            checksum: 'abc123',
            tools: ['claude-code'],
            source: 'https://registry.example.com',
            storagePath: '/path/to/skill',
          },
        },
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      await writeFile(testManifestPath, JSON.stringify(existingManifest));

      const manifest = await readManifest();

      expect(manifest.skills['test-skill']).toBeDefined();
      expect(manifest.skills['test-skill']?.name).toBe('test-skill');
    });
  });

  describe('writeManifest', () => {
    it('should write manifest to file', async () => {
      const manifest = {
        version: '1.0.0',
        skills: {},
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      await writeManifest(manifest);

      const content = await readFile(testManifestPath, 'utf-8');
      const written = JSON.parse(content);
      expect(written.version).toBe('1.0.0');
    });

    it('should update the updatedAt timestamp', async () => {
      const manifest = {
        version: '1.0.0',
        skills: {},
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      await writeManifest(manifest);

      const content = await readFile(testManifestPath, 'utf-8');
      const written = JSON.parse(content);
      expect(written.updatedAt).not.toBe('2024-01-01T00:00:00.000Z');
    });
  });

  describe('getInstalledSkill', () => {
    it('should return undefined for non-existent skill', async () => {
      const skill = await getInstalledSkill('nonexistent');

      expect(skill).toBeUndefined();
    });

    it('should return installed skill', async () => {
      const installedSkill = {
        name: 'test-skill',
        version: '1.0.0',
        installedAt: '2024-01-01T00:00:00.000Z',
        checksum: 'abc123',
        tools: ['claude-code'],
        source: 'https://registry.example.com',
        storagePath: '/path/to/skill',
      };
      await setInstalledSkill(installedSkill);

      const skill = await getInstalledSkill('test-skill');

      expect(skill).toBeDefined();
      expect(skill?.version).toBe('1.0.0');
    });
  });

  describe('setInstalledSkill', () => {
    it('should add new skill to manifest', async () => {
      const skill = {
        name: 'new-skill',
        version: '2.0.0',
        installedAt: '2024-01-01T00:00:00.000Z',
        checksum: 'def456',
        tools: ['codex'],
        source: 'https://registry.example.com',
        storagePath: '/path/to/new-skill',
      };

      await setInstalledSkill(skill);

      const manifest = await readManifest();
      expect(manifest.skills['new-skill']).toBeDefined();
      expect(manifest.skills['new-skill']?.version).toBe('2.0.0');
    });

    it('should update existing skill', async () => {
      const skill1 = {
        name: 'test-skill',
        version: '1.0.0',
        installedAt: '2024-01-01T00:00:00.000Z',
        checksum: 'abc123',
        tools: ['claude-code'],
        source: 'https://registry.example.com',
        storagePath: '/path/to/skill',
      };
      await setInstalledSkill(skill1);

      const skill2 = { ...skill1, version: '2.0.0' };
      await setInstalledSkill(skill2);

      const manifest = await readManifest();
      expect(manifest.skills['test-skill']?.version).toBe('2.0.0');
    });
  });

  describe('removeInstalledSkill', () => {
    it('should remove skill from manifest', async () => {
      const skill = {
        name: 'to-remove',
        version: '1.0.0',
        installedAt: '2024-01-01T00:00:00.000Z',
        checksum: 'abc123',
        tools: ['claude-code'],
        source: 'https://registry.example.com',
        storagePath: '/path/to/skill',
      };
      await setInstalledSkill(skill);

      const result = await removeInstalledSkill('to-remove');

      expect(result).toBe(true);
      const manifest = await readManifest();
      expect(manifest.skills['to-remove']).toBeUndefined();
    });

    it('should return false for non-existent skill', async () => {
      const result = await removeInstalledSkill('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('getAllInstalledSkills', () => {
    it('should return empty array when no skills installed', async () => {
      const skills = await getAllInstalledSkills();

      expect(skills).toEqual([]);
    });

    it('should return all installed skills', async () => {
      await setInstalledSkill({
        name: 'skill1',
        version: '1.0.0',
        installedAt: '2024-01-01T00:00:00.000Z',
        checksum: 'abc',
        tools: ['claude-code'],
        source: 'https://registry.example.com',
        storagePath: '/path/1',
      });
      await setInstalledSkill({
        name: 'skill2',
        version: '2.0.0',
        installedAt: '2024-01-01T00:00:00.000Z',
        checksum: 'def',
        tools: ['codex'],
        source: 'https://registry.example.com',
        storagePath: '/path/2',
      });

      const skills = await getAllInstalledSkills();

      expect(skills).toHaveLength(2);
      expect(skills.map((s) => s.name).sort()).toEqual(['skill1', 'skill2']);
    });
  });
});
