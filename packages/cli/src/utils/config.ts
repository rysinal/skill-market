import type { Config } from '@skill-market/shared';
import { DEFAULT_CONFIG, ENV_VARS, CONFIG_FILES } from '@skill-market/shared';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';

/**
 * Load configuration from environment, config files, and defaults
 * Priority: CLI args > env vars > project config > user config > defaults
 */
export async function loadConfig(overrides?: Partial<Config>): Promise<Config> {
  const config: Config = { ...DEFAULT_CONFIG };

  // Load user config (~/.skillrc)
  const userConfig = await loadConfigFile(homedir());
  if (userConfig) {
    Object.assign(config, userConfig);
  }

  // Load project config (./.skillrc)
  const projectConfig = await loadConfigFile(process.cwd());
  if (projectConfig) {
    Object.assign(config, projectConfig);
  }

  // Environment variables
  const envRegistry = process.env[ENV_VARS.REGISTRY];
  if (envRegistry) {
    config.registry = envRegistry;
  }

  // CLI overrides
  if (overrides) {
    Object.assign(config, overrides);
  }

  return config;
}

/**
 * Load config from a directory
 */
async function loadConfigFile(dir: string): Promise<Partial<Config> | null> {
  for (const filename of CONFIG_FILES) {
    try {
      const filepath = join(dir, filename);
      const content = await readFile(filepath, 'utf-8');
      return JSON.parse(content) as Partial<Config>;
    } catch {
      // File doesn't exist or is invalid, try next
    }
  }
  return null;
}

/**
 * Get registry URL from config
 */
export function getRegistryUrl(config: Config): string {
  return config.registry.replace(/\/$/, '');
}
