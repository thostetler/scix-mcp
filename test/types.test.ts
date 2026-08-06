import { describe, it, expect } from 'vitest';
import {
  SearchInputSchema,
  GetPaperInputSchema,
  MetricsInputSchema,
  CitationsInputSchema,
  ExportInputSchema,
  ResponseFormat,
  SortOrder,
} from '../src/types.js';

describe('input schemas', () => {
  describe('SearchInputSchema', () => {
    it('applies defaults for rows, start, sort, and response_format', () => {
      const parsed = SearchInputSchema.parse({ query: 'black holes' });
      expect(parsed.rows).toBe(10);
      expect(parsed.start).toBe(0);
      expect(parsed.sort).toBe(SortOrder.RELEVANCE);
      expect(parsed.response_format).toBe(ResponseFormat.MARKDOWN);
    });

    it('rejects an empty query', () => {
      expect(SearchInputSchema.safeParse({ query: '' }).success).toBe(false);
    });

    it('rejects rows above the MAX_ROWS limit of 100', () => {
      expect(SearchInputSchema.safeParse({ query: 'x', rows: 101 }).success).toBe(false);
      expect(SearchInputSchema.safeParse({ query: 'x', rows: 100 }).success).toBe(true);
    });

    it('rejects rows below 1 and negative start', () => {
      expect(SearchInputSchema.safeParse({ query: 'x', rows: 0 }).success).toBe(false);
      expect(SearchInputSchema.safeParse({ query: 'x', start: -1 }).success).toBe(false);
    });
  });

  describe('CitationsInputSchema', () => {
    it('defaults rows to 20 and caps at 100', () => {
      expect(CitationsInputSchema.parse({ bibcode: '2024ApJ...1..1A' }).rows).toBe(20);
      expect(
        CitationsInputSchema.safeParse({ bibcode: '2024ApJ...1..1A', rows: 101 }).success
      ).toBe(false);
    });
  });

  describe('identifier input length and descriptions', () => {
    const doi = '10.1103/PhysRevLett.116.061102';

    it('accepts DOI-length ids that exceeded the old 19-char cap', () => {
      expect(doi.length).toBeGreaterThan(19);
      expect(GetPaperInputSchema.safeParse({ bibcode: doi }).success).toBe(true);
      expect(CitationsInputSchema.safeParse({ bibcode: doi }).success).toBe(true);
    });

    it('still enforces a sane upper bound around 200 chars', () => {
      const tooLong = 'a'.repeat(201);
      const atLimit = 'a'.repeat(200);
      expect(GetPaperInputSchema.safeParse({ bibcode: tooLong }).success).toBe(false);
      expect(GetPaperInputSchema.safeParse({ bibcode: atLimit }).success).toBe(true);
      expect(CitationsInputSchema.safeParse({ bibcode: tooLong }).success).toBe(false);
      expect(CitationsInputSchema.safeParse({ bibcode: atLimit }).success).toBe(true);
    });

    it('describes the accepted id types on both schemas', () => {
      for (const schema of [GetPaperInputSchema, CitationsInputSchema]) {
        const desc = schema.shape.bibcode.description ?? '';
        expect(desc).toMatch(/bibcode/i);
        expect(desc).toMatch(/DOI/i);
        expect(desc).toMatch(/arxiv/i);
        expect(desc).toMatch(/scix/i);
      }
    });
  });

  describe('MetricsInputSchema and ExportInputSchema bibcode limits', () => {
    it('requires at least one bibcode', () => {
      expect(MetricsInputSchema.safeParse({ bibcodes: [] }).success).toBe(false);
      expect(ExportInputSchema.safeParse({ bibcodes: [], format: 'bibtex' }).success).toBe(false);
    });

    it('rejects more than MAX_BIBCODES (2000)', () => {
      const tooMany = Array.from({ length: 2001 }, (_, i) => `b${i}`);
      const exactly = Array.from({ length: 2000 }, (_, i) => `b${i}`);
      expect(MetricsInputSchema.safeParse({ bibcodes: tooMany }).success).toBe(false);
      expect(MetricsInputSchema.safeParse({ bibcodes: exactly }).success).toBe(true);
    });

    it('rejects an unknown export format', () => {
      expect(
        ExportInputSchema.safeParse({ bibcodes: ['x'], format: 'not-a-format' }).success
      ).toBe(false);
    });
  });
});
