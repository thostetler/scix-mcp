import { SciXAPIClient, SciXAPIError } from '../client.js';
import { SCIX_API_BASE, REQUEST_TIMEOUT, isAPIKeyConfigured } from '../config.js';
import {
  HealthCheckInput,
  HealthProbeResult,
  HealthReport,
  ResponseFormat
} from '../types.js';
import { formatHealthCheckMarkdown } from '../formatters.js';

// Everything health_check needs that lives in index.ts (identity, the live
// tool-name list, the shared client factory) is passed in so this stays a
// pure, testable function like the other tools.
export interface HealthCheckContext {
  serverName: string;
  serverVersion: string;
  toolNames: string[];
  createClient: () => SciXAPIClient;
}

function classifyProbeError(error: unknown): HealthProbeResult {
  if (error instanceof SciXAPIError) {
    if (error.status === 401) {
      return { state: 'unauthorized', message: error.message };
    }
    if (error.status === 429) {
      return { state: 'rate_limited', message: error.message };
    }
    return { state: 'unreachable', message: error.message };
  }
  const message = error instanceof Error ? error.message : String(error);
  return { state: 'unreachable', message };
}

async function runProbe(context: HealthCheckContext): Promise<HealthProbeResult> {
  if (!isAPIKeyConfigured()) {
    return {
      state: 'skipped',
      message: 'SCIX_API_TOKEN is not set; skipped the authenticated probe.'
    };
  }
  // Cheapest authenticated call: one id-only row. Uses the client's default
  // 30s timeout (REQUEST_TIMEOUT); a slow/hung API surfaces as `unreachable`.
  try {
    const client = context.createClient();
    await client.get('search/query', { q: '*:*', rows: 1, fl: 'id' });
    return { state: 'ok' };
  } catch (error) {
    return classifyProbeError(error);
  }
}

export async function healthCheck(
  context: HealthCheckContext,
  input: HealthCheckInput
): Promise<string> {
  const probe = await runProbe(context);
  const report: HealthReport = {
    server: { name: context.serverName, version: context.serverVersion },
    api_base: SCIX_API_BASE,
    token_configured: isAPIKeyConfigured(),
    probe,
    tools: [...context.toolNames].sort()
  };

  if (input.response_format === ResponseFormat.JSON) {
    return JSON.stringify(report, null, 2);
  }

  return formatHealthCheckMarkdown(report, REQUEST_TIMEOUT);
}
