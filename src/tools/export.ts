import { SciXAPIClient } from '../client.js';
import { ExportInput } from '../types.js';

export async function exportCitations(client: SciXAPIClient, input: ExportInput): Promise<string> {
  const data = {
    bibcode: input.bibcodes
  };

  const response = await client.post(`export/${input.format}`, data);

  return response.export || '';
}
