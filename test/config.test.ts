import { describe, it, expect, afterEach } from 'vitest';
import {
  SCIX_API_BASE,
  DEFAULT_FIELDS,
  REQUEST_TIMEOUT,
  MAX_BIBCODES,
  MAX_ROWS,
  getAPIKey,
} from '../src/config.js';

describe('config', () => {
  const originalToken = process.env.SCIX_API_TOKEN;

  afterEach(() => {
    if (originalToken === undefined) {
      delete process.env.SCIX_API_TOKEN;
    } else {
      process.env.SCIX_API_TOKEN = originalToken;
    }
  });

  describe('constants', () => {
    it('targets the ADS v1 API base', () => {
      expect(SCIX_API_BASE).toBe('https://api.adsabs.harvard.edu/v1');
    });

    it('caps rows at 100 and bibcodes at 2000', () => {
      expect(MAX_ROWS).toBe(100);
      expect(MAX_BIBCODES).toBe(2000);
    });

    it('uses a 30s request timeout', () => {
      expect(REQUEST_TIMEOUT).toBe(30000);
    });

    it('requests bibcode and identifier among default fields', () => {
      expect(DEFAULT_FIELDS).toContain('bibcode');
      expect(DEFAULT_FIELDS).toContain('identifier');
    });
  });

  describe('getAPIKey', () => {
    it('returns the token when set', () => {
      process.env.SCIX_API_TOKEN = 'abc123';
      expect(getAPIKey()).toBe('abc123');
    });

    it('trims surrounding whitespace', () => {
      process.env.SCIX_API_TOKEN = '  abc123  ';
      expect(getAPIKey()).toBe('abc123');
    });

    it('throws a helpful error when unset', () => {
      delete process.env.SCIX_API_TOKEN;
      expect(() => getAPIKey()).toThrow(/SCIX_API_TOKEN environment variable is not set/);
    });

    it('throws when set to whitespace only', () => {
      process.env.SCIX_API_TOKEN = '   ';
      expect(() => getAPIKey()).toThrow(/SCIX_API_TOKEN/);
    });
  });
});
