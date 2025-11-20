#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { SciXAPIClient } from './client.js';
import { search } from './tools/search.js';
import { getPaper } from './tools/paper.js';
import { getMetrics } from './tools/metrics.js';
import { getCitations, getReferences } from './tools/citations.js';
import { exportCitations } from './tools/export.js';
import {
  getLibraries,
  getLibrary,
  createLibrary,
  deleteLibrary,
  editLibrary,
  manageDocuments,
  addDocumentsByQuery,
  libraryOperation,
  getPermissions,
  updatePermissions,
  transferLibrary,
  getAnnotation,
  manageAnnotation,
  deleteAnnotation
} from './tools/library.js';
import {
  SearchInputSchema,
  GetPaperInputSchema,
  MetricsInputSchema,
  CitationsInputSchema,
  ExportInputSchema,
  GetLibrariesInputSchema,
  GetLibraryInputSchema,
  CreateLibraryInputSchema,
  DeleteLibraryInputSchema,
  EditLibraryInputSchema,
  ManageDocumentsInputSchema,
  AddDocumentsByQueryInputSchema,
  LibraryOperationInputSchema,
  GetPermissionsInputSchema,
  UpdatePermissionsInputSchema,
  TransferLibraryInputSchema,
  GetAnnotationInputSchema,
  ManageAnnotationInputSchema,
  DeleteAnnotationInputSchema
} from './types.js';

const server = new Server(
  {
    name: 'scix-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const client = new SciXAPIClient();

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search',
        description: 'Search SciX for astronomical literature. Supports full Solr query syntax including author:"Last, F.", title:keyword, abstract:keyword, year:2020-2023, and Boolean operators (AND, OR, NOT).',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query using SciX/Solr syntax',
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
        name: 'get_paper',
        description: 'Get detailed information about a specific paper by its SciX bibcode (e.g., 2019ApJ...886..145M).',
        inputSchema: {
          type: 'object',
          properties: {
            bibcode: {
              type: 'string',
              description: 'SciX bibcode identifier',
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
        name: 'get_metrics',
        description: 'Get citation metrics including h-index, citation counts, and paper statistics for a list of bibcodes.',
        inputSchema: {
          type: 'object',
          properties: {
            bibcodes: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of SciX bibcodes (1-2000)',
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
        name: 'get_citations',
        description: 'Get papers that cite a given paper (forward citations).',
        inputSchema: {
          type: 'object',
          properties: {
            bibcode: {
              type: 'string',
              description: 'SciX bibcode identifier',
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
        name: 'get_references',
        description: 'Get papers referenced by a given paper (backward citations).',
        inputSchema: {
          type: 'object',
          properties: {
            bibcode: {
              type: 'string',
              description: 'SciX bibcode identifier',
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
        name: 'export',
        description: 'Export citations in various formats (BibTeX, AASTeX, EndNote, MEDLARS).',
        inputSchema: {
          type: 'object',
          properties: {
            bibcodes: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of SciX bibcodes to export (1-2000)',
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
      {
        name: 'get_libraries',
        description: 'Get all libraries for the authenticated user. Can filter by type (all, owner, collaborator).',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['all', 'owner', 'collaborator'],
              description: 'Filter by library type',
              default: 'all',
            },
            response_format: {
              type: 'string',
              enum: ['markdown', 'json'],
              default: 'markdown',
            },
          },
        },
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
      },
      {
        name: 'get_library',
        description: 'Get details about a specific library including metadata and list of documents.',
        inputSchema: {
          type: 'object',
          properties: {
            library_id: {
              type: 'string',
              description: 'Library identifier',
            },
            response_format: {
              type: 'string',
              enum: ['markdown', 'json'],
              default: 'markdown',
            },
          },
          required: ['library_id'],
        },
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
      },
      {
        name: 'create_library',
        description: 'Create a new library with optional initial documents.',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Library name (1-255 characters)',
            },
            description: {
              type: 'string',
              description: 'Library description (optional)',
            },
            public: {
              type: 'boolean',
              description: 'Whether library is public',
              default: false,
            },
            bibcodes: {
              type: 'array',
              items: { type: 'string' },
              description: 'Initial bibcodes to add (optional)',
            },
            response_format: {
              type: 'string',
              enum: ['markdown', 'json'],
              default: 'markdown',
            },
          },
          required: ['name'],
        },
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
      },
      {
        name: 'delete_library',
        description: 'Delete a library permanently.',
        inputSchema: {
          type: 'object',
          properties: {
            library_id: {
              type: 'string',
              description: 'Library identifier',
            },
            response_format: {
              type: 'string',
              enum: ['markdown', 'json'],
              default: 'markdown',
            },
          },
          required: ['library_id'],
        },
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: false,
          openWorldHint: true,
        },
      },
      {
        name: 'edit_library',
        description: 'Edit library metadata (name, description, public status).',
        inputSchema: {
          type: 'object',
          properties: {
            library_id: {
              type: 'string',
              description: 'Library identifier',
            },
            name: {
              type: 'string',
              description: 'New library name (optional)',
            },
            description: {
              type: 'string',
              description: 'New library description (optional)',
            },
            public: {
              type: 'boolean',
              description: 'Whether library is public (optional)',
            },
            response_format: {
              type: 'string',
              enum: ['markdown', 'json'],
              default: 'markdown',
            },
          },
          required: ['library_id'],
        },
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
      },
      {
        name: 'manage_documents',
        description: 'Add or remove documents from a library.',
        inputSchema: {
          type: 'object',
          properties: {
            library_id: {
              type: 'string',
              description: 'Library identifier',
            },
            bibcodes: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of bibcodes (1-2000)',
            },
            action: {
              type: 'string',
              enum: ['add', 'remove'],
              description: 'Action to perform',
            },
            response_format: {
              type: 'string',
              enum: ['markdown', 'json'],
              default: 'markdown',
            },
          },
          required: ['library_id', 'bibcodes', 'action'],
        },
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
      },
      {
        name: 'add_documents_by_query',
        description: 'Add documents to a library from a SciX search query.',
        inputSchema: {
          type: 'object',
          properties: {
            library_id: {
              type: 'string',
              description: 'Library identifier',
            },
            query: {
              type: 'string',
              description: 'SciX search query',
            },
            rows: {
              type: 'number',
              description: 'Number of results to add (1-2000, default 25)',
              default: 25,
            },
            response_format: {
              type: 'string',
              enum: ['markdown', 'json'],
              default: 'markdown',
            },
          },
          required: ['library_id', 'query'],
        },
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
      },
      {
        name: 'library_operation',
        description: 'Perform set operations on libraries (union, intersection, difference, copy, empty).',
        inputSchema: {
          type: 'object',
          properties: {
            library_id: {
              type: 'string',
              description: 'Target library identifier',
            },
            operation: {
              type: 'string',
              enum: ['union', 'intersection', 'difference', 'copy', 'empty'],
              description: 'Operation to perform',
            },
            source_library_ids: {
              type: 'array',
              items: { type: 'string' },
              description: 'Source library IDs for set operations (optional)',
            },
            name: {
              type: 'string',
              description: 'Name for new library (for copy operation, optional)',
            },
            description: {
              type: 'string',
              description: 'Description for new library (for copy operation, optional)',
            },
            response_format: {
              type: 'string',
              enum: ['markdown', 'json'],
              default: 'markdown',
            },
          },
          required: ['library_id', 'operation'],
        },
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
      },
      {
        name: 'get_permissions',
        description: 'Get permission information for a library.',
        inputSchema: {
          type: 'object',
          properties: {
            library_id: {
              type: 'string',
              description: 'Library identifier',
            },
            response_format: {
              type: 'string',
              enum: ['markdown', 'json'],
              default: 'markdown',
            },
          },
          required: ['library_id'],
        },
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
      },
      {
        name: 'update_permissions',
        description: 'Grant or modify permissions for a user on a library.',
        inputSchema: {
          type: 'object',
          properties: {
            library_id: {
              type: 'string',
              description: 'Library identifier',
            },
            email: {
              type: 'string',
              description: 'User email',
            },
            permission: {
              type: 'string',
              enum: ['owner', 'admin', 'write', 'read'],
              description: 'Permission level to grant',
            },
            response_format: {
              type: 'string',
              enum: ['markdown', 'json'],
              default: 'markdown',
            },
          },
          required: ['library_id', 'email', 'permission'],
        },
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
      },
      {
        name: 'transfer_library',
        description: 'Transfer ownership of a library to another user.',
        inputSchema: {
          type: 'object',
          properties: {
            library_id: {
              type: 'string',
              description: 'Library identifier',
            },
            email: {
              type: 'string',
              description: 'Email of new owner',
            },
            response_format: {
              type: 'string',
              enum: ['markdown', 'json'],
              default: 'markdown',
            },
          },
          required: ['library_id', 'email'],
        },
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
      },
      {
        name: 'get_annotation',
        description: 'Get annotation/note for a document in a library.',
        inputSchema: {
          type: 'object',
          properties: {
            library_id: {
              type: 'string',
              description: 'Library identifier',
            },
            bibcode: {
              type: 'string',
              description: 'Bibcode to get annotation for',
            },
            response_format: {
              type: 'string',
              enum: ['markdown', 'json'],
              default: 'markdown',
            },
          },
          required: ['library_id', 'bibcode'],
        },
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
      },
      {
        name: 'manage_annotation',
        description: 'Add or update an annotation/note for a document in a library.',
        inputSchema: {
          type: 'object',
          properties: {
            library_id: {
              type: 'string',
              description: 'Library identifier',
            },
            bibcode: {
              type: 'string',
              description: 'Bibcode to annotate',
            },
            content: {
              type: 'string',
              description: 'Annotation content (1-10000 characters)',
            },
            response_format: {
              type: 'string',
              enum: ['markdown', 'json'],
              default: 'markdown',
            },
          },
          required: ['library_id', 'bibcode', 'content'],
        },
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
      },
      {
        name: 'delete_annotation',
        description: 'Delete an annotation/note for a document in a library.',
        inputSchema: {
          type: 'object',
          properties: {
            library_id: {
              type: 'string',
              description: 'Library identifier',
            },
            bibcode: {
              type: 'string',
              description: 'Bibcode to remove annotation from',
            },
            response_format: {
              type: 'string',
              enum: ['markdown', 'json'],
              default: 'markdown',
            },
          },
          required: ['library_id', 'bibcode'],
        },
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
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
      case 'search': {
        const input = SearchInputSchema.parse(args);
        const result = await search(client, input);
        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'get_paper': {
        const input = GetPaperInputSchema.parse(args);
        const result = await getPaper(client, input);
        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'get_metrics': {
        const input = MetricsInputSchema.parse(args);
        const result = await getMetrics(client, input);
        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'get_citations': {
        const input = CitationsInputSchema.parse(args);
        const result = await getCitations(client, input);
        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'get_references': {
        const input = CitationsInputSchema.parse(args);
        const result = await getReferences(client, input);
        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'export': {
        const input = ExportInputSchema.parse(args);
        const result = await exportCitations(client, input);
        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'get_libraries': {
        const input = GetLibrariesInputSchema.parse(args);
        const result = await getLibraries(client, input);
        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'get_library': {
        const input = GetLibraryInputSchema.parse(args);
        const result = await getLibrary(client, input);
        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'create_library': {
        const input = CreateLibraryInputSchema.parse(args);
        const result = await createLibrary(client, input);
        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'delete_library': {
        const input = DeleteLibraryInputSchema.parse(args);
        const result = await deleteLibrary(client, input);
        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'edit_library': {
        const input = EditLibraryInputSchema.parse(args);
        const result = await editLibrary(client, input);
        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'manage_documents': {
        const input = ManageDocumentsInputSchema.parse(args);
        const result = await manageDocuments(client, input);
        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'add_documents_by_query': {
        const input = AddDocumentsByQueryInputSchema.parse(args);
        const result = await addDocumentsByQuery(client, input);
        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'library_operation': {
        const input = LibraryOperationInputSchema.parse(args);
        const result = await libraryOperation(client, input);
        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'get_permissions': {
        const input = GetPermissionsInputSchema.parse(args);
        const result = await getPermissions(client, input);
        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'update_permissions': {
        const input = UpdatePermissionsInputSchema.parse(args);
        const result = await updatePermissions(client, input);
        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'transfer_library': {
        const input = TransferLibraryInputSchema.parse(args);
        const result = await transferLibrary(client, input);
        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'get_annotation': {
        const input = GetAnnotationInputSchema.parse(args);
        const result = await getAnnotation(client, input);
        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'manage_annotation': {
        const input = ManageAnnotationInputSchema.parse(args);
        const result = await manageAnnotation(client, input);
        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'delete_annotation': {
        const input = DeleteAnnotationInputSchema.parse(args);
        const result = await deleteAnnotation(client, input);
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
  console.error('SciX MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
