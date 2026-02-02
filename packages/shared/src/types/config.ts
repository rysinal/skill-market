/**
 * CLI configuration
 */
export interface Config {
  /** Registry base URL */
  registry: string;
  /** Default tool for installation */
  defaultTool?: string;
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Config = {
  registry: 'https://registry.skill-market.dev',
};

/**
 * Environment variable names
 */
export const ENV_VARS = {
  REGISTRY: 'SKILL_MARKET_REGISTRY',
} as const;

/**
 * Config file names (in priority order)
 */
export const CONFIG_FILES = ['.skillrc', '.skillrc.json'] as const;
