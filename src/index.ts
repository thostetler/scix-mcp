#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ADSAPIClient } from './client.js';
import { search } from './tools/search.js';
import { getPaper } from './tools/paper.js';
import { getMetrics } from './tools/metrics.js';
import { getCitations, getReferences } from './tools/citations.js';
import { exportCitations } from './tools/export.js';
import {
  SearchInputSchema,
  GetPaperInputSchema,
  MetricsInputSchema,
  CitationsInputSchema,
  ExportInputSchema,
} from './types.js';

const server = new Server(
  {
    name: 'ads-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const client = new ADSAPIClient();

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'ads_search',
        description: 'Search NASA ADS for astronomical literature. Supports full Solr query syntax including author:"Last, F.", title:keyword, abstract:keyword, year:2020-2023, and Boolean operators (AND, OR, NOT).',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query using ADS/Solr syntax',
            },
            rows: {
              type: 'number',
              description: 'Number of results (1-100, default 10)',
              default: 10,
            },
            start: {
              type: 'number',
              description: 'Starting offset for pagination (default 0)',
              default: 0,
            },
            sort: {
              type: 'string',
              enum: ['score desc', 'citation_count desc', 'date desc', 'date asc', 'read_count desc'],
              description: 'Sort order',
              default: 'score desc',
            },
            response_format: {
              type: 'string',
              enum: ['markdown', 'json'],
              description: 'Output format',
              default: 'markdown',
            },
          },
          required: ['query'],
        },
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
      },
      {
        name: 'ads_get_paper',
        description: 'Get detailed information about a specific paper by its ADS bibcode (e.g., 2019ApJ...886..145M).',
        inputSchema: {
          type: 'object',
          properties: {
            bibcode: {
              type: 'string',
              description: 'ADS bibcode identifier',
            },
            response_format: {
              type: 'string',
              enum: ['markdown', 'json'],
              default: 'markdown',
            },
          },
          required: ['bibcode'],
        },
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
      },
      {
        name: 'ads_get_metrics',
        description: 'Get citation metrics including h-index, citation counts, and paper statistics for a list of bibcodes.',
        inputSchema: {
          type: 'object',
          properties: {
            bibcodes: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of ADS bibcodes (1-2000)',
            },
            response_format: {
              type: 'string',
              enum: ['markdown', 'json'],
              default: 'markdown',
            },
          },
          required: ['bibcodes'],
        },
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
      },
      {
        name: 'ads_get_citations',
        description: 'Get papers that cite a given paper (forward citations).',
        inputSchema: {
          type: 'object',
          properties: {
            bibcode: {
              type: 'string',
              description: 'ADS bibcode identifier',
            },
            rows: {
              type: 'number',
              description: 'Number of citations to return (1-100, default 20)',
              default: 20,
            },
            response_format: {
              type: 'string',
              enum: ['markdown', 'json'],
              default: 'markdown',
            },
          },
          required: ['bibcode'],
        },
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
      },
      {
        name: 'ads_get_references',
        description: 'Get papers referenced by a given paper (backward citations).',
        inputSchema: {
          type: 'object',
          properties: {
            bibcode: {
              type: 'string',
              description: 'ADS bibcode identifier',
            },
            rows: {
              type: 'number',
              description: 'Number of references to return (1-100, default 20)',
              default: 20,
            },
            response_format: {
              type: 'string',
              enum: ['markdown', 'json'],
              default: 'markdown',
            },
          },
          required: ['bibcode'],
        },
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
      },
      {
        name: 'ads_export',
        description: 'Export citations in various formats (BibTeX, AASTeX, EndNote, MEDLARS).',
        inputSchema: {
          type: 'object',
          properties: {
            bibcodes: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of ADS bibcodes to export (1-2000)',
            },
            format: {
              type: 'string',
              enum: ['bibtex', 'aastex', 'endnote', 'medlars'],
              description: 'Export format',
            },
          },
          required: ['bibcodes', 'format'],
        },
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'ads_search': {
        const input = SearchInputSchema.parse(args);
        const result = await search(client, input);
        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'ads_get_paper': {
        const input = GetPaperInputSchema.parse(args);
        const result = await getPaper(client, input);
        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'ads_get_metrics': {
        const input = MetricsInputSchema.parse(args);
        const result = await getMetrics(client, input);
        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'ads_get_citations': {
        const input = CitationsInputSchema.parse(args);
        const result = await getCitations(client, input);
        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'ads_get_references': {
        const input = CitationsInputSchema.parse(args);
        const result = await getReferences(client, input);
        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'ads_export': {
        const input = ExportInputSchema.parse(args);
        const result = await exportCitations(client, input);
        return {
          content: [{ type: 'text', text: result }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('NASA ADS MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
