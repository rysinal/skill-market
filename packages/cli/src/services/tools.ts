import type { Tool, ToolId } from '@skill-market/shared';
import { homedir } from 'node:os';
import { join } from 'node:path';

/**
 * Built-in tool configurations
 */
const BUILT_IN_TOOLS: Record<ToolId, Tool> = {
  'claude-code': {
    id: 'claude-code',
    displayName: 'Claude Code',
    skillsPath: '.claude/skills',
    enabled: true,
  },
  codex: {
    id: 'codex',
    displayName: 'OpenAI Codex',
    skillsPath: '.codex/skills',
    enabled: true,
  },
  antigravity: {
    id: 'antigravity',
    displayName: 'Antigravity',
    skillsPath: '.antigravity/skills',
    enabled: true,
  },
};

/**
 * Get all available tools
 */
export function getAvailableTools(): Tool[] {
  return Object.values(BUILT_IN_TOOLS).filter((tool) => tool.enabled);
}

/**
 * Get a tool by ID
 */
export function getToolById(id: string): Tool | undefined {
  return BUILT_IN_TOOLS[id as ToolId];
}

/**
 * Get tool IDs
 */
export function getToolIds(): ToolId[] {
  return Object.keys(BUILT_IN_TOOLS) as ToolId[];
}

/**
 * Resolve tool selector to tool IDs
 * @param selector - Tool ID, comma-separated IDs, or 'all'
 */
export function resolveToolSelector(selector: string): ToolId[] {
  if (selector === 'all') {
    return getToolIds();
  }

  const ids = selector.split(',').map((s) => s.trim()) as ToolId[];
  const validIds = ids.filter((id) => BUILT_IN_TOOLS[id] !== undefined);

  if (validIds.length === 0) {
    throw new Error(`Invalid tool selector: ${selector}`);
  }

  return validIds;
}

/**
 * Get absolute path for tool's skills directory
 */
export function getToolSkillsPath(tool: Tool): string {
  return join(homedir(), tool.skillsPath);
}

/**
 * Global skill storage directory
 */
export const SKILL_STORAGE_DIR = join(homedir(), '.skill-market', 'skills');

/**
 * Global manifest file path
 */
export const MANIFEST_PATH = join(homedir(), '.skill-market', 'manifest.json');
