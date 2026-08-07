import { SciXAPIClient } from '../client.js';
import { DEFAULT_FIELDS } from '../config.js';
import { SearchInput, ResponseFormat } from '../types.js';
import { formatPapersListMarkdown } from '../formatters.js';

export async function search(client: SciXAPIClient, input: SearchInput): Promise<string> {
  const params = {
    q: input.query,
    fl: DEFAULT_FIELDS,
    rows: input.rows,
    start: input.start,
    sort: input.sort
  };

  const response = await client.get('search/query', params);

  const numFound = response.response?.numFound || 0;
  const docs = response.response?.docs || [];

  if (input.response_format === ResponseFormat.JSON) {
    return JSON.stringify({ numFound, start: input.start, docs }, null, 2);
  }

  const hasMore = (input.start + input.rows) < numFound;

  let result = formatPapersListMarkdown(docs, numFound);

  if (hasMore) {
    result += `\n*Use start=${input.start + input.rows} to see more results*\n`;
  }

  return result;
}
