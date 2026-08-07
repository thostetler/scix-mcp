export function buildIdentifierQuery(input: string): string {
  const isScixId = input.toLowerCase().startsWith('scix:');
  const field = isScixId ? 'scix_id' : 'identifier';
  const value = isScixId ? `scix:${input.slice(5)}` : input;
  const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

  return `${field}:"${escaped}"`;
}
