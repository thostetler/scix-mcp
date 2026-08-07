import { realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// True when the given module is the process entrypoint (e.g. `node build/x.js`
// or a symlinked bin), rather than being imported. realpathSync resolves
// symlinks so the bin symlink matches the module's real file URL; it is
// guarded because argv[1] may be undefined and realpathSync throws when the
// path does not exist.
export function isDirectRun(moduleUrl: string): boolean {
  const entry = process.argv[1];
  if (entry === undefined) {
    return false;
  }

  try {
    return moduleUrl === pathToFileURL(realpathSync(entry)).href;
  } catch {
    return false;
  }
}
