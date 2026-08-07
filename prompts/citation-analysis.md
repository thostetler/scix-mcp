# SciX Citation Analysis Guide

## Citation Metrics Overview

Use these tools to analyze research impact, track citations, and identify influential papers.

## Core Tools

### get_metrics - Citation Statistics

Calculate h-index and citation metrics for paper collections (1-2000 bibcodes):

```
get_metrics(
  bibcodes=["2023ApJ...950..123S", "2022MNRAS.517.1234T"],
  response_format="markdown"
)
```

**Returns:**
- h-index, g-index, i10-index
- Total citations
- Paper counts (total, refereed, first-author)
- Usage statistics (reads, downloads)

### get_citations - Forward Citations

Find papers that cite a given paper:

```
get_citations(
  bibcode="2020ApJ...905....3A",
  rows=20,
  response_format="markdown"
)
```

**Use cases:**
- Track paper impact over time
- Find recent work building on foundational papers
- Identify research trends

### get_references - Backward Citations

Find papers cited by a given paper:

```
get_references(
  bibcode="2020ApJ...905....3A",
  rows=20,
  response_format="markdown"
)
```

**Use cases:**
- Literature review
- Find foundational papers in a field
- Understand paper context

## Analysis Workflows

### Author Impact Analysis

1. Search for author's papers:
   ```
   search(query="author:\"Last, F.\" AND property:refereed")
   ```

2. Calculate metrics on all papers:
   ```
   get_metrics(bibcodes=[...])
   ```

3. Analyze top papers:
   ```
   get_citations(bibcode="most_cited_paper")
   ```

### Find Seminal Papers

1. Broad topic search:
   ```
   search(query="dark matter detection", sort="citation_count desc")
   ```

2. Get citations for top results:
   ```
   get_citations(bibcode="top_result")
   ```

Highly cited papers with many forward citations = foundational work

### Track Citation Metrics Over Time

1. Get author's papers with search
2. Run `get_metrics` to get current h-index and citations
3. Store results for comparison later
4. Repeat periodically to track growth

### Literature Review with Citation Network

1. Find key paper on topic
2. `get_references` - foundational papers cited
3. `get_citations` - recent developments
4. Create library with all papers
5. Add annotations as you read

## Understanding Metrics

**h-index**: An author has h-index of h if h papers have at least h citations each
- Common metric for researcher impact
- Combines productivity and citation impact

**g-index**: Largest number g where top g papers have ≥ g² citations combined
- Gives more weight to highly-cited papers

**i10-index**: Number of papers with at least 10 citations
- Simple productivity metric

## Best Practices

- Use `response_format="json"` for programmatic analysis
- Batch bibcodes (up to 2000) for efficiency
- Combine with library tools to organize analysis
- Consider both metrics AND qualitative impact