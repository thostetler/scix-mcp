# Search Implementation Summary

## Architecture

The search system is split across two repositories:

### scix-docs-scraper (Data Generation)
- Scrapes SciX help documentation from scixplorer.org
- Processes and chunks content into searchable format
- **Output**: `chunked-index.json` with 53 documentation chunks (404 pages filtered out)
- Categories: search_docs, api_docs, library_docs, faq, getting_started, etc.

### scix-mcp-server (Search Runtime)
- In-memory search using MiniSearch
- Consumes chunked index from scraper
- Provides search API for MCP tools
- **No scraping** - just searches pre-generated data

## Workflow

```bash
# 1. Generate data (in scix-docs-scraper)
cd ~/code/scix-docs-scraper
pnpm export  # Scrape -> process -> chunk

# 2. Copy to MCP server
cp output/chunked/chunked-index.json ~/code/scix-mcp-server/data/scix/

# 3. Test search (in scix-mcp-server)
cd ~/code/scix-mcp-server
pnpm test search-docs
```

## Components

### scix-docs-scraper
- `scraper.py` - Crawl4AI-based scraper
- `process.mjs` - Combines raw scrapes
- `chunk.mjs` - **NEW** - Transforms for MCP search format
- `output/chunked/chunked-index.json` - Final output

### scix-mcp-server
- `src/search-docs.ts` - Search module
- `test/search-docs.test.ts` - Test suite (23 tests)
- `data/scix/chunked-index.json` - Imported search data
- `SEARCH_SETUP.md` - API documentation

## Data Format

```json
{
  "id": "scixhelp-search-syntax__chunk0",
  "source_file": "search-syntax",
  "source_url": "https://scixplorer.org/scixhelp/search-scix/search-syntax",
  "doc_type": "scix_help",
  "category": "search_docs",
  "title": "Search Syntax",
  "section": "Basic Queries",
  "subsection": "",
  "content": "...",
  "char_count": 15772
}
```

## Categories

- `search_docs` (10) - Search syntax and features
- `actions_docs` (10) - Export, metrics, visualization
- `faq` (8) - Frequently asked questions
- `general_help` (7) - General help topics
- `library_docs` (5) - Library management
- `getting_started` (4) - Tutorials
- `orcid_docs` (3) - ORCID integration
- `policies` (5) - Terms, privacy
- `api_docs` (1) - API documentation

## Performance

- **Index Size**: 53 documents, ~1.0MB JSON
- **Search Latency**: <1ms typical
- **Index Build**: <5ms on first search
- **Memory**: ~50KB indexed

## Usage

### Programmatic
```typescript
import { searchDocs } from './build/search-docs.js';

const results = await searchDocs("how to search by author", 5);
console.log(results[0].snippet);
```

### MCP Integration (Future)
```typescript
server.tool({
  name: 'search_help',
  description: 'Search SciX documentation',
  parameters: z.object({
    query: z.string(),
    limit: z.number().optional().default(5),
  }),
  handler: async ({ query, limit }) => {
    const results = await searchDocs(query, limit);
    return formatResults(results);
  },
});
```

## Maintenance

### Update Documentation

```bash
# When SciX help docs change:
cd ~/code/scix-docs-scraper
pnpm export

# Copy new data
cp output/chunked/chunked-index.json ~/code/scix-mcp-server/data/scix/

# Verify
cd ~/code/scix-mcp-server
pnpm test search-docs

# Commit
git add data/scix/chunked-index.json
git commit -m "docs: Update SciX help documentation index"
```

## Files Modified/Created

### scix-docs-scraper
**Created:**
- `chunk.mjs` - Transform to MCP search format

**Modified:**
- `package.json` - Added `chunk` and `export` scripts
- `README.md` - Updated workflow documentation

### scix-mcp-server
**Created:**
- `src/search-docs.ts` - Search module
- `test/search-docs.test.ts` - Test suite
- `data/scix/chunked-index.json` - Search data
- `SEARCH_SETUP.md` - API docs
- `SEARCH_SUMMARY.md` - This file

**Modified:**
- `package.json` - Added minisearch dependency

## Statistics

- **Dependencies Added**: 1 (minisearch)
- **Test Coverage**: 23 tests, all passing
- **Lines of Code**: ~300 (search module + tests)
