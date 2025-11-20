import { z } from 'zod';

export enum ResponseFormat {
  MARKDOWN = 'markdown',
  JSON = 'json'
}

export enum SortOrder {
  RELEVANCE = 'score desc',
  CITATION_COUNT = 'citation_count desc',
  DATE_DESC = 'date desc',
  DATE_ASC = 'date asc',
  READ_COUNT = 'read_count desc'
}

export const SearchInputSchema = z.object({
  query: z.string().min(1).max(1000).describe('ADS search query using Solr syntax'),
  rows: z.number().int().min(1).max(100).default(10).describe('Number of results to return'),
  start: z.number().int().min(0).default(0).describe('Starting offset for pagination'),
  sort: z.nativeEnum(SortOrder).default(SortOrder.RELEVANCE).describe('Sort order for results'),
  response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe('Output format')
});

export const GetPaperInputSchema = z.object({
  bibcode: z.string().min(1).max(19).describe('ADS bibcode identifier'),
  response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN)
});

export const MetricsInputSchema = z.object({
  bibcodes: z.array(z.string()).min(1).max(2000).describe('List of bibcodes'),
  response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN)
});

export const CitationsInputSchema = z.object({
  bibcode: z.string().min(1).max(19).describe('ADS bibcode identifier'),
  rows: z.number().int().min(1).max(100).default(20).describe('Number of citations to return'),
  response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN)
});

export const ExportInputSchema = z.object({
  bibcodes: z.array(z.string()).min(1).max(2000).describe('List of bibcodes to export'),
  format: z.enum(['bibtex', 'aastex', 'endnote', 'medlars']).describe('Export format')
});

export type SearchInput = z.infer<typeof SearchInputSchema>;
export type GetPaperInput = z.infer<typeof GetPaperInputSchema>;
export type MetricsInput = z.infer<typeof MetricsInputSchema>;
export type CitationsInput = z.infer<typeof CitationsInputSchema>;
export type ExportInput = z.infer<typeof ExportInputSchema>;
