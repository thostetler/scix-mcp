import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

// A deliberately dumb mock of the ADS/SciX API for the e2e protocol suite.
// Each route is a static (method, path-pattern) -> canned JSON mapping; there
// is no server-side state. The goal is only to let the built MCP server make a
// real HTTP round-trip so tool handlers and formatters run end to end.

interface MockRoute {
  method: string;
  pattern: RegExp;
  // status defaults to 200; body is JSON-serialised (undefined -> empty body).
  status?: number;
  body?: unknown;
}

// One canned Solr envelope serves every search/query consumer (search,
// get_paper, get_citations, get_references, and the health_check probe). The
// handlers differ in how they frame the same docs, so distinct output markers
// fall out naturally per tool.
const SOLR_RESPONSE = {
  response: {
    numFound: 1,
    start: 0,
    docs: [
      {
        bibcode: '2024SmokeT..42A',
        title: ['Smoke Test Paper Alpha'],
        author: ['Tester, A.'],
        year: 2024,
        pub: 'Journal of Smoke Testing',
        citation_count: 42,
        read_count: 7,
        doi: ['10.1000/smoke.42']
      }
    ]
  }
};

const METRICS_RESPONSE = {
  indicators: { h: 7, g: 9, i10: 5, m: 1.5, tori: 2.25 },
  'citation stats': {
    'total number of citations': 100,
    'total number of refereed citations': 80,
    'average number of citations': 12.5,
    'median number of citations': 10,
    'number of self-citations': 3
  },
  'basic stats': {
    'number of papers': 8,
    'total number of reads': 500,
    'average number of reads': 62.5
  }
};

const LIBRARY_METADATA = {
  id: 'smokeLibId',
  name: 'Smoke Library',
  description: 'A canned library for smoke tests',
  num_documents: 2,
  date_created: '2024-01-01T00:00:00Z',
  date_last_modified: '2024-01-02T00:00:00Z',
  permission: 'owner',
  owner: 'owner@example.com',
  public: false,
  num_users: 1
};

// Ordered most-specific first; first match wins.
const ROUTES: MockRoute[] = [
  { method: 'GET', pattern: /^\/search\/query$/, body: SOLR_RESPONSE },
  { method: 'POST', pattern: /^\/metrics$/, body: METRICS_RESPONSE },
  { method: 'POST', pattern: /^\/export\/[^/]+$/, body: { export: '@ARTICLE{smoke2024, title="Smoke Test Paper Alpha"}' } },

  // biblib — notes routes must precede the single-segment library route.
  { method: 'GET', pattern: /^\/biblib\/libraries\/[^/]+\/notes\/[^/]+$/, body: {
    id: 'noteId',
    bibcode: '2024SmokeT..42A',
    content: 'Smoke annotation body',
    date_created: '2024-01-01T00:00:00Z',
    date_last_modified: '2024-01-02T00:00:00Z'
  } },
  { method: 'POST', pattern: /^\/biblib\/libraries\/[^/]+\/notes\/[^/]+$/, body: { id: 'noteId' } },
  { method: 'DELETE', pattern: /^\/biblib\/libraries\/[^/]+\/notes\/[^/]+$/, body: {} },

  { method: 'POST', pattern: /^\/biblib\/libraries\/operations\/[^/]+$/, body: { library_id: 'opResultId', number_added: 5 } },
  { method: 'GET', pattern: /^\/biblib\/libraries$/, body: { libraries: [LIBRARY_METADATA] } },
  { method: 'POST', pattern: /^\/biblib\/libraries$/, body: {
    metadata: { ...LIBRARY_METADATA, name: 'Created Smoke Library', id: 'createdLibId', num_documents: 0 }
  } },
  { method: 'GET', pattern: /^\/biblib\/libraries\/[^/]+$/, body: {
    metadata: { ...LIBRARY_METADATA, name: 'Smoke Library Detail' },
    documents: ['2024SmokeT..42A', '2024SmokeT..43B']
  } },

  { method: 'POST', pattern: /^\/biblib\/documents\/[^/]+\/query$/, body: { number_added: 3 } },
  { method: 'POST', pattern: /^\/biblib\/documents\/[^/]+$/, body: { number_added: 2 } },
  { method: 'PUT', pattern: /^\/biblib\/documents\/[^/]+$/, body: {
    metadata: { ...LIBRARY_METADATA, name: 'Edited Smoke Library' }
  } },
  { method: 'DELETE', pattern: /^\/biblib\/documents\/[^/]+$/, body: {} },

  { method: 'GET', pattern: /^\/biblib\/permissions\/[^/]+$/, body: {
    owner: 'owner@example.com',
    collaborators: { 'collab@example.com': ['read'] }
  } },
  { method: 'POST', pattern: /^\/biblib\/permissions\/[^/]+$/, body: {} },
  { method: 'POST', pattern: /^\/biblib\/transfer\/[^/]+$/, body: {} }
];

export interface MockAdsServer {
  url: string;
  close: () => Promise<void>;
}

// Starts the mock on an ephemeral port (bind :0) and resolves once listening.
export async function startMockAdsServer(): Promise<MockAdsServer> {
  const server: Server = createServer((req, res) => {
    // Drain the request body so keep-alive sockets close cleanly; contents are
    // irrelevant to the static routing.
    req.resume();

    const method = req.method ?? 'GET';
    const pathname = new URL(req.url ?? '/', 'http://localhost').pathname;
    const route = ROUTES.find((r) => r.method === method && r.pattern.test(pathname));

    if (!route) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `no mock route for ${method} ${pathname}` }));
      return;
    }

    res.writeHead(route.status ?? 200, { 'Content-Type': 'application/json' });
    res.end(route.body === undefined ? '' : JSON.stringify(route.body));
  });

  // Wire both outcomes so a bind failure (EADDRINUSE, EPERM in a locked-down
  // sandbox) rejects fast with the real error instead of hanging until the
  // beforeAll hook timeout on an unhandled 'error' event.
  await new Promise<void>((resolve, reject) => {
    const onError = (err: Error) => {
      server.off('listening', onListening);
      reject(err);
    };
    const onListening = () => {
      server.off('error', onError);
      resolve();
    };
    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(0, '127.0.0.1');
  });
  const { port } = server.address() as AddressInfo;

  return {
    url: `http://127.0.0.1:${port}`,
    close: () =>
      new Promise<void>((resolve, reject) =>
        server.close((err) => (err ? reject(err) : resolve()))
      )
  };
}
