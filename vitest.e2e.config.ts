import { defineConfig } from 'vitest/config';

// The e2e suite spawns `node build/index.js` and talks MCP over stdio, so it
// needs a longer timeout than the unit tests and a fresh build (see the
// `test:e2e` script, which runs `pnpm build` first). Kept in its own config so
// `pnpm test` stays unit-only and does not depend on build/ being current.
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/e2e/**/*.test.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    // Match the unit config: single thread avoids tinypool worker crashes.
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    }
  }
});
