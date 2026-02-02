/**
 * Supported AI tool configuration
 */
export interface Tool {
  /** Unique tool identifier (e.g., 'claude-code', 'codex', 'antigravity') */
  id: string;
  /** Human-readable display name */
  displayName: string;
  /** Relative path for skills symlinks (e.g., '.claude/skills') */
  skillsPath: string;
  /** Whether this tool is currently enabled/available */
  enabled: boolean;
}

/**
 * Tool identifiers
 */
export type ToolId = 'claude-code' | 'codex' | 'antigravity';

/**
 * Special tool selector values
 */
export type ToolSelector = ToolId | 'all';
