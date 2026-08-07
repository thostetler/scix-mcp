#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SciXAPIClient } from './client.js';
import { isDirectRun } from './is-direct-run.js';
import { search } from './tools/search.js';
import { getPaper } from './tools/paper.js';
import { getMetrics } from './tools/metrics.js';
import { getCitations, getReferences } from './tools/citations.js';
import { exportCitations } from './tools/export.js';
import { searchDocs } from './search-docs.js';
import { formatDocsSearchMarkdown } from './formatters.js';
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
  DeleteAnnotationInputSchema,
  SearchDocsInputSchema
} from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usageGuidePath = path.join(__dirname, '..', 'USAGE_GUIDE.md');
const promptsDir = path.join(__dirname, '..', 'prompts');

function promptPath(id: string): string {
  return path.join(promptsDir, `${id}.md`);
}

// Read the version from package.json at runtime so it lives in one place.
// build/index.js sits alongside build/, so ../package.json resolves to the
// package root both in the built tree and after npm install.
function readServerVersion(): string {
  const pkgPath = path.join(__dirname, '..', 'package.json');
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not read version from ${pkgPath}: ${message}`);
  }
  if (
    typeof parsed === 'object' &&
    parsed !== null &&
    'version' in parsed &&
    typeof parsed.version === 'string'
  ) {
    return parsed.version;
  }
  throw new Error(`Could not read version from ${pkgPath}`);
}

function textResult(text: string): CallToolResult {
  return { content: [{ type: 'text', text }] };
}

function errorResult(error: unknown): CallToolResult {
  const message = error instanceof Error ? error.message : String(error);
  return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
}

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'scix-mcp',
    version: readServerVersion(),
  });

  // Construct the API client lazily so a missing/invalid SCIX_API_TOKEN
  // surfaces as a graceful tool error rather than an import-time crash.
  let cachedClient: SciXAPIClient | undefined;

  function getClient(): SciXAPIClient {
    if (!cachedClient) {
      cachedClient = new SciXAPIClient();
    }
    return cachedClient;
  }

  server.registerTool(
    'search',
    {
      description: 'Search SciX for astronomical literature. Supports full Solr query syntax including author:"Last, F.", title:keyword, abstract:keyword, year:2020-2023, and Boolean operators (AND, OR, NOT).',
      inputSchema: SearchInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input) => {
      try {
        const client = getClient();
        const result = await search(client, input);
        return textResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    'get_paper',
    {
      description: 'Get detailed information about a specific paper by identifier: bibcode, DOI, arXiv ID, or SciX ID (scix:...).',
      inputSchema: GetPaperInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input) => {
      try {
        const client = getClient();
        const result = await getPaper(client, input);
        return textResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    'get_metrics',
    {
      description: 'Get citation metrics including h-index, citation counts, and paper statistics for a list of bibcodes.',
      inputSchema: MetricsInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input) => {
      try {
        const client = getClient();
        const result = await getMetrics(client, input);
        return textResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    'get_citations',
    {
      description: 'Get papers that cite a given paper (forward citations). Accepts a bibcode, DOI, arXiv ID, or SciX ID.',
      inputSchema: CitationsInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input) => {
      try {
        const client = getClient();
        const result = await getCitations(client, input);
        return textResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    'get_references',
    {
      description: 'Get papers referenced by a given paper (backward citations). Accepts a bibcode, DOI, arXiv ID, or SciX ID.',
      inputSchema: CitationsInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input) => {
      try {
        const client = getClient();
        const result = await getReferences(client, input);
        return textResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    'export',
    {
      description: 'Export citations in 23 bibliographic formats (BibTeX, AASTeX, EndNote, IEEE, MNRAS, etc.) with support for custom formatting templates.',
      inputSchema: ExportInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (input) => {
      try {
        const client = getClient();
        const result = await exportCitations(client, input);
        return textResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    'get_libraries',
    {
      description: 'Get all libraries for the authenticated user. Can filter by type (all, owner, collaborator).',
      inputSchema: GetLibrariesInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input) => {
      try {
        const client = getClient();
        const result = await getLibraries(client, input);
        return textResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    'get_library',
    {
      description: 'Get details about a specific library including metadata and list of documents.',
      inputSchema: GetLibraryInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input) => {
      try {
        const client = getClient();
        const result = await getLibrary(client, input);
        return textResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    'create_library',
    {
      description: 'Create a new library with optional initial documents.',
      inputSchema: CreateLibraryInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (input) => {
      try {
        const client = getClient();
        const result = await createLibrary(client, input);
        return textResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    'delete_library',
    {
      description: 'Delete a library permanently.',
      inputSchema: DeleteLibraryInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (input) => {
      try {
        const client = getClient();
        const result = await deleteLibrary(client, input);
        return textResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    'edit_library',
    {
      description: 'Edit library metadata (name, description, public status).',
      inputSchema: EditLibraryInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input) => {
      try {
        const client = getClient();
        const result = await editLibrary(client, input);
        return textResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    'manage_documents',
    {
      description: 'Add or remove documents from a library.',
      inputSchema: ManageDocumentsInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input) => {
      try {
        const client = getClient();
        const result = await manageDocuments(client, input);
        return textResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    'add_documents_by_query',
    {
      description: 'Add documents to a library from a SciX search query.',
      inputSchema: AddDocumentsByQueryInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (input) => {
      try {
        const client = getClient();
        const result = await addDocumentsByQuery(client, input);
        return textResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    'library_operation',
    {
      description: 'Perform set operations on libraries (union, intersection, difference, copy, empty).',
      inputSchema: LibraryOperationInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (input) => {
      try {
        const client = getClient();
        const result = await libraryOperation(client, input);
        return textResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    'get_permissions',
    {
      description: 'Get permission information for a library.',
      inputSchema: GetPermissionsInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input) => {
      try {
        const client = getClient();
        const result = await getPermissions(client, input);
        return textResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    'update_permissions',
    {
      description: 'Grant or modify permissions for a user on a library.',
      inputSchema: UpdatePermissionsInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input) => {
      try {
        const client = getClient();
        const result = await updatePermissions(client, input);
        return textResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    'transfer_library',
    {
      description: 'Transfer ownership of a library to another user.',
      inputSchema: TransferLibraryInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (input) => {
      try {
        const client = getClient();
        const result = await transferLibrary(client, input);
        return textResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    'get_annotation',
    {
      description: 'Get annotation/note for a document in a library.',
      inputSchema: GetAnnotationInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input) => {
      try {
        const client = getClient();
        const result = await getAnnotation(client, input);
        return textResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    'manage_annotation',
    {
      description: 'Add or update an annotation/note for a document in a library.',
      inputSchema: ManageAnnotationInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input) => {
      try {
        const client = getClient();
        const result = await manageAnnotation(client, input);
        return textResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    'delete_annotation',
    {
      description: 'Delete an annotation/note for a document in a library.',
      inputSchema: DeleteAnnotationInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (input) => {
      try {
        const client = getClient();
        const result = await deleteAnnotation(client, input);
        return textResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    'search_docs',
    {
      description: 'Search SciX help documentation for information about search syntax, features, API usage, and best practices.',
      inputSchema: SearchDocsInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (input) => {
      try {
        const results = await searchDocs(input.query, input.limit);
        return textResult(formatDocsSearchMarkdown(results, input.query));
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerPrompt(
    'search-workflow',
    {
      description: 'Guide for searching astronomical literature effectively using SciX search syntax, operators, and best practices.',
    },
    async () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: await readFile(promptPath('search-workflow'), 'utf-8'),
          },
        },
      ],
    })
  );

  server.registerPrompt(
    'library-management',
    {
      description: 'Workflows for creating, managing, and organizing paper collections in SciX libraries.',
    },
    async () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: await readFile(promptPath('library-management'), 'utf-8'),
          },
        },
      ],
    })
  );

  server.registerPrompt(
    'citation-analysis',
    {
      description: 'Techniques for analyzing citation metrics, h-index, and citation networks.',
    },
    async () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: await readFile(promptPath('citation-analysis'), 'utf-8'),
          },
        },
      ],
    })
  );

  server.registerPrompt(
    'export-bibliography',
    {
      description: 'Methods for exporting citations in various formats (BibTeX, AASTeX, EndNote, etc.).',
    },
    async () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: await readFile(promptPath('export-bibliography'), 'utf-8'),
          },
        },
      ],
    })
  );

  server.registerPrompt(
    'best-practices',
    {
      description: 'General best practices, performance tips, and error handling for the SciX MCP server.',
    },
    async () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: await readFile(promptPath('best-practices'), 'utf-8'),
          },
        },
      ],
    })
  );

  server.registerResource(
    'SciX Usage Guide',
    'scix://usage-guide',
    {
      description: 'Comprehensive guide for using the SciX MCP server: search syntax, workflows, tools reference, and best practices.',
      mimeType: 'text/markdown',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'text/markdown',
          text: await readFile(usageGuidePath, 'utf-8'),
        },
      ],
    })
  );

  return server;
}

async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('SciX MCP Server running on stdio');
}

if (isDirectRun(import.meta.url)) {
  main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
  });
}
