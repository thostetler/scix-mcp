import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ADSAPIClient } from '../../src/client.js';
import { setupMockFetch, restoreFetch } from '../helpers/mockFetch.js';
import { exportCitations } from '../../src/tools/export.js';
import { MAX_BIBCODES } from '../../src/config.js';

describe('Export Tool', () => {
  let client: ADSAPIClient;
  const originalEnv = process.env.ADS_DEV_KEY;

  beforeEach(() => {
    process.env.ADS_DEV_KEY = 'test-api-key';
    client = new ADSAPIClient();
  });

  afterEach(() => {
    restoreFetch();
    process.env.ADS_DEV_KEY = originalEnv;
  });

  describe('exportCitations', () => {
    it('should export in BibTeX format', async () => {
      const mockExport = '@ARTICLE{2024ApJ...123..456A,\n  author = {Author, A.},\n  title = {Test Paper}\n}';
      const mockResponse = { export: mockExport };

      const mockFetch = setupMockFetch({ body: mockResponse });

      const result = await exportCitations(client, {
        bibcodes: ['2024ApJ...123..456A'],
        format: 'bibtex'
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toContain('export/bibtex');
      expect(init.method).toBe('POST');

      const body = JSON.parse(init.body);
      expect(body.bibcode).toEqual(['2024ApJ...123..456A']);

      expect(result).toBe(mockExport);
    });

    it('should export in AASTeX format', async () => {
      const mockExport = '\\bibitem{2024ApJ...123..456A} Author, A. 2024, ApJ, 123, 456';
      const mockResponse = { export: mockExport };

      const mockFetch = setupMockFetch({ body: mockResponse });

      await exportCitations(client, {
        bibcodes: ['2024ApJ...123..456A'],
        format: 'aastex'
      });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('export/aastex');
    });

    it('should export in Endnote format', async () => {
      const mockResponse = { export: '%A Author, A.\n%T Test Paper' };

      const mockFetch = setupMockFetch({ body: mockResponse });

      await exportCitations(client, {
        bibcodes: ['2024ApJ...123..456A'],
        format: 'endnote'
      });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('export/endnote');
    });

    it('should handle multiple bibcodes', async () => {
      const mockResponse = { export: 'multiple citations...' };
      const mockFetch = setupMockFetch({ body: mockResponse });

      await exportCitations(client, {
        bibcodes: ['bib1', 'bib2', 'bib3'],
        format: 'bibtex'
      });

      const [, init] = mockFetch.mock.calls[0];
      const body = JSON.parse(init.body);
      expect(body.bibcode).toEqual(['bib1', 'bib2', 'bib3']);
    });

    it('should respect MAX_BIBCODES limit', async () => {
      const bibcodes = Array.from({ length: MAX_BIBCODES }, (_, i) => `bib${i}`);
      const mockFetch = setupMockFetch({ body: { export: '' } });

      await exportCitations(client, {
        bibcodes,
        format: 'bibtex'
      });

      const [, init] = mockFetch.mock.calls[0];
      const body = JSON.parse(init.body);
      expect(body.bibcode.length).toBe(MAX_BIBCODES);
    });

    it('should return empty string if no export data', async () => {
      setupMockFetch({ body: {} });

      const result = await exportCitations(client, {
        bibcodes: ['test'],
        format: 'bibtex'
      });

      expect(result).toBe('');
    });

    it('should support different export formats', async () => {
      const formats = ['bibtex', 'aastex', 'endnote', 'ris'];

      for (const format of formats) {
        const mockFetch = setupMockFetch({ body: { export: 'test' } });

        await exportCitations(client, {
          bibcodes: ['test'],
          format: format as any
        });

        const [url] = mockFetch.mock.calls[0];
        expect(url).toContain(`export/${format}`);

        restoreFetch();
      }
    });
  });
});
