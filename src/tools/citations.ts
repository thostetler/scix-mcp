import { SciXAPIClient } from '../client.js';
import { DEFAULT_FIELDS } from '../config.js';
import { CitationsInput, ResponseFormat } from '../types.js';
import { formatCitationNetworkMarkdown } from '../formatters.js';
import { buildIdentifierQuery } from '../identifier-query.js';

export async function getCitations(client: SciXAPIClient, input: CitationsInput): Promise<string> {
  const params = {
    q: `citations(${buildIdentifierQuery(input.bibcode)})`,
    fl: DEFAULT_FIELDS,
    rows: input.rows,
    sort: 'citation_count desc'
  };

  const response = await client.get('search/query', params);
  const numFound = response.response?.numFound || 0;
  const docs = response.response?.docs || [];

  if (input.response_format === ResponseFormat.JSON) {
    return JSON.stringify({ numFound, start: 0, docs }, null, 2);
  }

  return formatCitationNetworkMarkdown(docs, `Papers citing ${input.bibcode}`, numFound);
}

export async function getReferences(client: SciXAPIClient, input: CitationsInput): Promise<string> {
  const params = {
    q: `references(${buildIdentifierQuery(input.bibcode)})`,
    fl: DEFAULT_FIELDS,
    rows: input.rows,
    sort: 'citation_count desc'
  };

  const response = await client.get('search/query', params);
  const numFound = response.response?.numFound || 0;
  const docs = response.response?.docs || [];

  if (input.response_format === ResponseFormat.JSON) {
    return JSON.stringify({ numFound, start: 0, docs }, null, 2);
  }

  return formatCitationNetworkMarkdown(docs, `Papers referenced by ${input.bibcode}`, numFound);
}
