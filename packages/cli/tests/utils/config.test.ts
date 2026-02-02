import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadConfig, getRegistryUrl } from '../../src/utils/config.js';
import { DEFAULT_CONFIG } from '@skill-market/shared';

describe('config', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('loadConfig', () => {
    it('should return default config when no config file exists', async () => {
      const config = await loadConfig();

      expect(config.registry).toBe(DEFAULT_CONFIG.registry);
      expect(config.storage).toBe(DEFAULT_CONFIG.storage);
    });

    it('should merge overrides with defaults', async () => {
      const config = await loadConfig({ registry: 'https://custom.example.com' });

      expect(config.registry).toBe('https://custom.example.com');
      expect(config.storage).toBe(DEFAULT_CONFIG.storage);
    });

    it('should read from environment variables', async () => {
      vi.stubEnv('SKILL_MARKET_REGISTRY', 'https://env.example.com');

      const config = await loadConfig();

      expect(config.registry).toBe('https://env.example.com');
    });

    it('should prioritize overrides over environment variables', async () => {
      vi.stubEnv('SKILL_MARKET_REGISTRY', 'https://env.example.com');

      const config = await loadConfig({ registry: 'https://override.example.com' });

      expect(config.registry).toBe('https://override.example.com');
    });
  });

  describe('getRegistryUrl', () => {
    it('should return registry URL from config', () => {
      const url = getRegistryUrl({ registry: 'https://test.example.com', storage: '' });

      expect(url).toBe('https://test.example.com');
    });

    it('should return config registry even when empty', () => {
      // getRegistryUrl just returns what's in config, doesn't apply defaults
      const url = getRegistryUrl({ registry: '', storage: '' });

      expect(url).toBe('');
    });
  });
});
