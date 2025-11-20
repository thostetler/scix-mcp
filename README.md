# NASA SciX MCP Server

A production-grade Model Context Protocol (MCP) server for the NASA Astrophysics Data System (SciX) API. This server enables LLMs to search astronomical literature, retrieve paper metadata, analyze citation metrics, and export bibliographic data.

## Features

- **Literature Search**: Full-text search with advanced Solr query syntax
- **Paper Details**: Retrieve comprehensive metadata for any publication
- **Citation Metrics**: Calculate h-index, citation counts, and usage statistics
- **Citation Network**: Explore forward and backward citations
- **Export**: Generate citations in BibTeX, AASTeX, EndNote, and MEDLARS formats
- **Dual Format**: Support for both human-readable Markdown and machine-readable JSON

## Installation

```bash
npm install
npm run build
```

## Configuration

### Get an API Key

1. Create an account at [SciX](https://scixplorer.org/)
2. Generate an API token at https://scixplorer.org/user/settings/token
3. Set the environment variable:

```bash
export SCIX_API_TOKEN=your_api_key_here
```

Or create a `.env` file:

```bash
cp .env.example .env
# Edit .env and add your key
```

### Add to MCP Client

Add to your MCP client configuration (e.g., Claude Desktop `config.json`):

```json
{
  "mcpServers": {
    "ads": {
      "command": "npx",
      "args": ["scix-mcp"],
      "env": {
        "SCIX_API_TOKEN": "your_api_key_here"
      }
    }
  }
}
```

Local MCP clients that read `.mcp/server.json` can also pick up the packaged config in `.mcp/server.json`; just drop in your `SCIX_API_TOKEN`.

## Available Tools

### search

Search the SciX database with full Solr query syntax.

**Parameters:**

- `query` (string, required): Search query
- `rows` (number, optional): Results to return (1-100, default 10)
- `start` (number, optional): Pagination offset (default 0)
- `sort` (string, optional): Sort order (default "score desc")
- `response_format` (string, optional): "markdown" or "json" (default "markdown")

**Example queries:**

```
author:"Einstein, A." title:relativity
black holes year:2020-2023
author:^Smith (first author only)
dark energy AND galaxy clusters
```

### get_paper

Get detailed information about a specific paper.

**Parameters:**

- `bibcode` (string, required): SciX bibcode (e.g., "2019ApJ...886..145M")
- `response_format` (string, optional): "markdown" or "json"

### get_metrics

Calculate citation metrics for a set of papers.

**Parameters:**

- `bibcodes` (array, required): List of bibcodes (1-2000)
- `response_format` (string, optional): "markdown" or "json"

**Returns:** h-index, g-index, total citations, paper counts, usage statistics

### get_citations

Get papers that cite a given paper (forward citations).

**Parameters:**

- `bibcode` (string, required): SciX bibcode
- `rows` (number, optional): Number of citations (1-100, default 20)
- `response_format` (string, optional): "markdown" or "json"

### get_references

Get papers referenced by a given paper (backward citations).

**Parameters:**

- `bibcode` (string, required): SciX bibcode
- `rows` (number, optional): Number of references (1-100, default 20)
- `response_format` (string, optional): "markdown" or "json"

### export

Export citations in various formats.

**Parameters:**

- `bibcodes` (array, required): List of bibcodes (1-2000)
- `format` (string, required): "bibtex", "aastex", "endnote", or "medlars"

**Returns:** Formatted citation export as plain text

## Rate Limits

- **5000 requests per day** per API key
- Rate limit info is returned in response headers
- Contact adshelp@cfa.harvard.edu for higher limits

## SciX Search Syntax

The SciX search supports powerful query syntax:

| Syntax                  | Description       | Example                          |
| ----------------------- | ----------------- | -------------------------------- |
| `author:"Last, F."`     | Exact author      | `author:"Huchra, John"`          |
| `author:^Last`          | First author      | `author:^Smith`                  |
| `title:keyword`         | Title search      | `title:exoplanet`                |
| `abstract:keyword`      | Abstract search   | `abstract:"dark matter"`         |
| `year:YYYY-YYYY`        | Year range        | `year:2020-2023`                 |
| `property:refereed`     | Refereed only     | `property:refereed`              |
| `citations(bibcode:X)`  | Papers citing X   | `citations(bibcode:2019ApJ...)`  |
| `references(bibcode:X)` | Papers cited by X | `references(bibcode:2019ApJ...)` |
| `AND`, `OR`, `NOT`      | Boolean operators | `black holes AND galaxy`         |

## Development

```bash
# Watch mode
npm run dev

# Build
npm run build

# Test with MCP Inspector
npx @modelcontextprotocol/inspector node build/index.js
```

## Testing

The project includes a comprehensive test suite using Vitest.

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Test Structure

Tests are organized in the `test/` directory:

```
test/
├── helpers/
│   └── mockFetch.ts        # Fetch mocking utilities
├── client.test.ts           # HTTP client tests
└── tools/
    ├── search.test.ts       # Search tool tests
    ├── paper.test.ts        # Paper details tests
    ├── metrics.test.ts      # Metrics tests
    ├── citations.test.ts    # Citations/references tests
    ├── export.test.ts       # Export tests
    └── library.test.ts      # Library management tests
```

### Test Coverage

The test suite covers:

- **HTTP Client**: GET/POST/PUT/DELETE methods, error handling (401/404/429), timeouts, request formatting
- **Search Tools**: Query parameter encoding, pagination, result limiting, response formatting
- **Paper Tools**: Bibcode validation, field selection, error handling for missing papers
- **Metrics Tools**: Batch bibcode processing, MAX_BIBCODES limits, metric type selection
- **Citation Tools**: Forward/backward citations, sorting, row limits
- **Export Tools**: Multiple export formats (BibTeX, AASTeX, EndNote, etc.), batch processing
- **Library Tools**: All CRUD operations, permissions, annotations, library operations

### API Token for Tests

Tests use mock fetch and don't require a real API token. The test suite sets `ADS_DEV_KEY=test-api-key` automatically.

### Live Integration Tests (Optional)

To run tests against the real ADS API (skipped by default):

1. Set your real API key:
   ```bash
   export ADS_DEV_KEY=your_real_api_key
   ```

2. Run integration tests (not implemented yet):
   ```bash
   pnpm test:integration
   ```

**Note**: Integration tests count against your daily rate limit (5000 requests/day).

## Project Structure

```
src/
├── index.ts          # Main server entry point
├── client.ts         # SciX API client wrapper
├── types.ts          # TypeScript/Zod type definitions
├── formatters.ts     # Response formatting utilities
├── config.ts         # Configuration constants
└── tools/
    ├── search.ts     # Search tool
    ├── paper.ts      # Paper details tool
    ├── metrics.ts    # Metrics tool
    ├── citations.ts  # Citation network tools
    └── export.ts     # Export tool
```

### Library tools

- `get_libraries` / `get_library`: List and inspect libraries
- `create_library` / `delete_library` / `edit_library`: Manage library metadata
- `manage_documents`: Add/remove bibcodes to a library
- `add_documents_by_query`: Add results from a search query to a library
- `library_operation`: Union/intersection/difference/copy/empty on libraries
- `get_permissions` / `update_permissions` / `transfer_library`: Manage sharing
- `get_annotation` / `manage_annotation` / `delete_annotation`: Handle notes on documents

## Example Usage

### Search for papers

```
Use search with query "supernova 2023" to find recent supernova papers
```

### Get paper details

```
Use get_paper with bibcode "2023ApJ...950..123S"
```

### Calculate metrics

```
Use get_metrics with bibcodes ["2023ApJ...950..123S", "2022MNRAS.517.1234T"]
```

### Export citations

```
Use export with bibcodes ["2023ApJ...950..123S"] and format "bibtex"
```

## Error Handling

The server provides clear error messages:

- **401**: Invalid API key - check `SCIX_API_TOKEN`
- **404**: Resource not found - check bibcode format
- **429**: Rate limit exceeded - wait until reset
- **Timeout**: Request took > 30 seconds

## Resources

- [SciX Homepage](https://scixplorer.org/)
- [SciX API Documentation](https://github.com/adsabs/adsabs-dev-api)
- [SciX Search Syntax](https://adsabs.github.io/help/search/search-syntax)
- [MCP Documentation](https://modelcontextprotocol.io/)

## License

MIT

## Support

For API issues: adshelp@cfa.harvard.edu
For server issues: Open an issue on GitHub
