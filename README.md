# NASA ADS MCP Server

A production-grade Model Context Protocol (MCP) server for the NASA Astrophysics Data System (ADS) API. This server enables LLMs to search astronomical literature, retrieve paper metadata, analyze citation metrics, and export bibliographic data.

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

1. Create an account at [ADS](https://ui.adsabs.harvard.edu/)
2. Generate an API token at https://ui.adsabs.harvard.edu/user/settings/token
3. Set the environment variable:

```bash
export ADS_DEV_KEY=your_api_key_here
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
      "command": "node",
      "args": ["/path/to/scix-mcp/build/index.js"],
      "env": {
        "ADS_DEV_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Available Tools

### ads_search

Search the ADS database with full Solr query syntax.

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

### ads_get_paper

Get detailed information about a specific paper.

**Parameters:**
- `bibcode` (string, required): ADS bibcode (e.g., "2019ApJ...886..145M")
- `response_format` (string, optional): "markdown" or "json"

### ads_get_metrics

Calculate citation metrics for a set of papers.

**Parameters:**
- `bibcodes` (array, required): List of bibcodes (1-2000)
- `response_format` (string, optional): "markdown" or "json"

**Returns:** h-index, g-index, total citations, paper counts, usage statistics

### ads_get_citations

Get papers that cite a given paper (forward citations).

**Parameters:**
- `bibcode` (string, required): ADS bibcode
- `rows` (number, optional): Number of citations (1-100, default 20)
- `response_format` (string, optional): "markdown" or "json"

### ads_get_references

Get papers referenced by a given paper (backward citations).

**Parameters:**
- `bibcode` (string, required): ADS bibcode
- `rows` (number, optional): Number of references (1-100, default 20)
- `response_format` (string, optional): "markdown" or "json"

### ads_export

Export citations in various formats.

**Parameters:**
- `bibcodes` (array, required): List of bibcodes (1-2000)
- `format` (string, required): "bibtex", "aastex", "endnote", or "medlars"

**Returns:** Formatted citation export as plain text

## Rate Limits

- **5000 requests per day** per API key
- Rate limit info is returned in response headers
- Contact adshelp@cfa.harvard.edu for higher limits

## ADS Search Syntax

The ADS search supports powerful query syntax:

| Syntax | Description | Example |
|--------|-------------|---------|
| `author:"Last, F."` | Exact author | `author:"Huchra, John"` |
| `author:^Last` | First author | `author:^Smith` |
| `title:keyword` | Title search | `title:exoplanet` |
| `abstract:keyword` | Abstract search | `abstract:"dark matter"` |
| `year:YYYY-YYYY` | Year range | `year:2020-2023` |
| `property:refereed` | Refereed only | `property:refereed` |
| `citations(bibcode:X)` | Papers citing X | `citations(bibcode:2019ApJ...)` |
| `references(bibcode:X)` | Papers cited by X | `references(bibcode:2019ApJ...)` |
| `AND`, `OR`, `NOT` | Boolean operators | `black holes AND galaxy` |

## Development

```bash
# Watch mode
npm run dev

# Build
npm run build

# Test with MCP Inspector
npx @modelcontextprotocol/inspector node build/index.js
```

## Project Structure

```
src/
├── index.ts          # Main server entry point
├── client.ts         # ADS API client wrapper
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

## Example Usage

### Search for papers
```
Use ads_search with query "supernova 2023" to find recent supernova papers
```

### Get paper details
```
Use ads_get_paper with bibcode "2023ApJ...950..123S"
```

### Calculate metrics
```
Use ads_get_metrics with bibcodes ["2023ApJ...950..123S", "2022MNRAS.517.1234T"]
```

### Export citations
```
Use ads_export with bibcodes ["2023ApJ...950..123S"] and format "bibtex"
```

## Error Handling

The server provides clear error messages:

- **401**: Invalid API key - check `ADS_DEV_KEY`
- **404**: Resource not found - check bibcode format
- **429**: Rate limit exceeded - wait until reset
- **Timeout**: Request took > 30 seconds

## Resources

- [ADS Homepage](https://ui.adsabs.harvard.edu/)
- [ADS API Documentation](https://github.com/adsabs/adsabs-dev-api)
- [ADS Search Syntax](https://adsabs.github.io/help/search/search-syntax)
- [MCP Documentation](https://modelcontextprotocol.io/)

## License

MIT

## Support

For API issues: adshelp@cfa.harvard.edu
For server issues: Open an issue on GitHub
