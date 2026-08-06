import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { handleToolCall, TOOL_DEFINITIONS, HANDLED_TOOL_NAMES } from '../src/index.js';
import { setupMockFetch, restoreFetch } from './helpers/mockFetch.js';

describe('index CallTool dispatch', () => {
  const originalToken = process.env.SCIX_API_TOKEN;

  afterEach(() => {
    if (originalToken === undefined) {
      delete process.env.SCIX_API_TOKEN;
    } else {
      process.env.SCIX_API_TOKEN = originalToken;
    }
  });

  describe('tool list vs dispatch parity', () => {
    beforeEach(() => {
      process.env.SCIX_API_TOKEN = 'test-api-key';
      // Some tools (e.g. get_libraries) have fully-defaulted schemas, so empty
      // args parse and reach the network — mock fetch so parity stays offline.
      setupMockFetch({ status: 401, statusText: 'Unauthorized', body: {} });
    });

    afterEach(() => {
      restoreFetch();
    });

    it('advertises a non-empty list of tools with names', () => {
      expect(TOOL_DEFINITIONS.length).toBeGreaterThan(0);
      for (const tool of TOOL_DEFINITIONS) {
        expect(typeof tool.name).toBe('string');
        expect(tool.name.length).toBeGreaterThan(0);
      }
    });

    it('dispatches every advertised tool (none is an unknown tool)', async () => {
      for (const tool of TOOL_DEFINITIONS) {
        const res = await handleToolCall({
          params: { name: tool.name, arguments: {} },
        });
        const text = res.content.map((c) => c.text).join('\n');
        // Empty args may trip Zod validation, but the tool must still be
        // recognized by the dispatcher — never reported as an unknown tool.
        expect(text, `tool ${tool.name} should be dispatchable`).not.toContain(
          'Unknown tool'
        );
      }
    });

    it('advertised tool set exactly matches the dispatchable set', () => {
      const advertised = [...new Set(TOOL_DEFINITIONS.map((t) => t.name))].sort();
      const dispatchable = [...new Set(HANDLED_TOOL_NAMES)].sort();
      // Bidirectional: catches advertised-but-undispatchable AND
      // dispatchable-but-unadvertised (the missing-ListTools-entry mistake).
      expect(dispatchable).toEqual(advertised);
    });

    it('reports an unknown tool name as an error', async () => {
      const res = await handleToolCall({
        params: { name: 'does_not_exist', arguments: {} },
      });
      expect(res.isError).toBe(true);
      const text = res.content.map((c) => c.text).join('\n');
      expect(text).toContain('Unknown tool: does_not_exist');
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      process.env.SCIX_API_TOKEN = 'test-api-key';
    });

    afterEach(() => {
      restoreFetch();
    });

    it('surfaces API client errors as isError results with the mapped message', async () => {
      setupMockFetch({ status: 401, statusText: 'Unauthorized', body: {} });

      const res = await handleToolCall({
        params: {
          name: 'get_paper',
          arguments: { bibcode: '2024ApJ...123..456A' },
        },
      });

      expect(res.isError).toBe(true);
      const text = res.content.map((c) => c.text).join('\n');
      expect(text).toContain('Error:');
      expect(text).toContain('Authentication failed');
    });
  });

  describe('token independence', () => {
    beforeEach(() => {
      delete process.env.SCIX_API_TOKEN;
    });

    it('runs search_docs without SCIX_API_TOKEN (fully local tool)', async () => {
      const res = await handleToolCall({
        params: { name: 'search_docs', arguments: { query: 'author search', limit: 3 } },
      });

      expect(res.isError).toBeFalsy();
      const text = res.content.map((c) => c.text).join('\n');
      expect(text).toContain('SciX Documentation Search Results');
      expect(text).not.toContain('SCIX_API_TOKEN');
    });

    it('reports an unknown tool as "Unknown tool", not a token error, when unset', async () => {
      const res = await handleToolCall({
        params: { name: 'does_not_exist', arguments: {} },
      });

      expect(res.isError).toBe(true);
      const text = res.content.map((c) => c.text).join('\n');
      expect(text).toContain('Unknown tool: does_not_exist');
      expect(text).not.toContain('SCIX_API_TOKEN');
    });
  });
});
