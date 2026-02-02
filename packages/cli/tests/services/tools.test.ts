import { describe, it, expect } from 'vitest';
import {
  getAvailableTools,
  getToolById,
  getToolIds,
  resolveToolSelector,
} from '../../src/services/tools.js';

describe('tools', () => {
  describe('getAvailableTools', () => {
    it('should return all enabled tools', () => {
      const tools = getAvailableTools();

      expect(tools.length).toBeGreaterThan(0);
      expect(tools.every((t) => t.enabled)).toBe(true);
    });

    it('should include claude-code, codex, and antigravity', () => {
      const tools = getAvailableTools();
      const ids = tools.map((t) => t.id);

      expect(ids).toContain('claude-code');
      expect(ids).toContain('codex');
      expect(ids).toContain('antigravity');
    });
  });

  describe('getToolById', () => {
    it('should return tool for valid id', () => {
      const tool = getToolById('claude-code');

      expect(tool).toBeDefined();
      expect(tool?.id).toBe('claude-code');
      expect(tool?.displayName).toBe('Claude Code');
    });

    it('should return undefined for invalid id', () => {
      const tool = getToolById('invalid-tool');

      expect(tool).toBeUndefined();
    });
  });

  describe('getToolIds', () => {
    it('should return array of tool ids', () => {
      const ids = getToolIds();

      expect(Array.isArray(ids)).toBe(true);
      expect(ids).toContain('claude-code');
      expect(ids).toContain('codex');
      expect(ids).toContain('antigravity');
    });
  });

  describe('resolveToolSelector', () => {
    it('should resolve single tool id', () => {
      const tools = resolveToolSelector('claude-code');

      expect(tools).toEqual(['claude-code']);
    });

    it('should resolve comma-separated tool ids', () => {
      const tools = resolveToolSelector('claude-code,codex');

      expect(tools).toEqual(['claude-code', 'codex']);
    });

    it('should resolve "all" to all tool ids', () => {
      const tools = resolveToolSelector('all');

      expect(tools).toContain('claude-code');
      expect(tools).toContain('codex');
      expect(tools).toContain('antigravity');
    });

    it('should filter out invalid tool ids', () => {
      const tools = resolveToolSelector('claude-code,invalid,codex');

      expect(tools).toEqual(['claude-code', 'codex']);
    });

    it('should throw for completely invalid selector', () => {
      expect(() => resolveToolSelector('invalid1,invalid2')).toThrow('Invalid tool selector');
    });

    it('should handle whitespace in selector', () => {
      const tools = resolveToolSelector('claude-code, codex');

      expect(tools).toEqual(['claude-code', 'codex']);
    });
  });
});
