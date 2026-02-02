import { describe, it, expect } from 'vitest';
import { SkillNotFoundError, RegistryError } from '../../src/services/registry.js';

describe('registry errors', () => {
  describe('SkillNotFoundError', () => {
    it('should have correct properties', () => {
      const error = new SkillNotFoundError('my-skill');

      expect(error.name).toBe('SkillNotFoundError');
      expect(error.skillName).toBe('my-skill');
      expect(error.message).toContain('my-skill');
      expect(error.message).toContain('not found');
    });

    it('should include version in message when provided', () => {
      const error = new SkillNotFoundError('my-skill', '1.0.0');

      expect(error.skillName).toBe('my-skill');
      expect(error.version).toBe('1.0.0');
      expect(error.message).toContain('1.0.0');
    });

    it('should be an instance of Error', () => {
      const error = new SkillNotFoundError('my-skill');

      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('RegistryError', () => {
    it('should have correct properties', () => {
      const error = new RegistryError('Connection failed');

      expect(error.name).toBe('RegistryError');
      expect(error.message).toBe('Connection failed');
    });

    it('should be an instance of Error', () => {
      const error = new RegistryError('Network error');

      expect(error).toBeInstanceOf(Error);
    });
  });
});
