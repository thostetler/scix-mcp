/**
 * Configuration and constants for NASA ADS MCP Server
 */

export const ADS_API_BASE = 'https://api.adsabs.harvard.edu/v1';

/**
 * Default fields to retrieve in search queries
 */
export const DEFAULT_FIELDS = [
  'bibcode',
  'title',
  'author',
  'year',
  'pubdate',
  'abstract',
  'citation_count',
  'read_count',
  'doi',
  'arxiv_id',
  'pub',
  'volume',
  'page',
  'keyword',
  'aff',
  'identifier'
];

/**
 * Rate limit information
 */
export const RATE_LIMIT = {
  REQUESTS_PER_DAY: 5000,
  HEADERS: {
    LIMIT: 'X-RateLimit-Limit',
    REMAINING: 'X-RateLimit-Remaining',
    RESET: 'X-RateLimit-Reset'
  }
};

/**
 * API request timeout in milliseconds
 */
export const REQUEST_TIMEOUT = 30000;

/**
 * Validate and retrieve the ADS API key from environment
 * @throws Error if ADS_DEV_KEY is not set
 */
export function getAPIKey(): string {
  const key = process.env.ADS_DEV_KEY;

  if (!key || key.trim() === '') {
    throw new Error(
      'ADS_DEV_KEY environment variable is not set. ' +
      'Get your API key from https://ui.adsabs.harvard.edu/user/settings/token'
    );
  }

  return key.trim();
}

/**
 * Maximum bibcodes for metrics and export operations
 */
export const MAX_BIBCODES = 2000;

/**
 * Maximum rows per search request
 */
export const MAX_ROWS = 100;
