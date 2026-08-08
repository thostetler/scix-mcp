/**
 * Configuration and constants for NASA SciX MCP Server
 */

// Default to the production ADS API. SCIX_API_BASE can override the base URL
// (e.g. to point the server at a local mock during e2e tests). Trim and treat
// blank as unset — mirrors getAPIKey — so a stray/empty value can't yield an
// invalid base that throws in `new URL(...)`.
const configuredBase = process.env.SCIX_API_BASE?.trim();
export const SCIX_API_BASE =
  configuredBase && configuredBase.length > 0
    ? configuredBase
    : 'https://api.adsabs.harvard.edu/v1';

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
 * Report whether a usable SCIX_API_TOKEN is present, without throwing.
 * Mirrors getAPIKey's non-empty/trim check so callers can gate on token
 * presence (e.g. the health_check probe) instead of catching a throw.
 */
export function isAPIKeyConfigured(): boolean {
  const key = process.env.SCIX_API_TOKEN;
  return typeof key === 'string' && key.trim() !== '';
}

/**
 * Validate and retrieve the SciX API key from environment
 * @throws Error if SCIX_API_TOKEN is not set
 */
export function getAPIKey(): string {
  const key = process.env.SCIX_API_TOKEN;

  if (!key || key.trim() === '') {
    throw new Error(
      'SCIX_API_TOKEN environment variable is not set. ' +
      'Get your API key from https://scixplorer.org/user/settings/token'
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
