// @vitest-environment node
//
// A 'use client' directive is only honoured when it is the FIRST statement of the
// file (comments and blank lines may precede it). If an import ends up above it,
// Next.js fails the production build, but tsc, ESLint and the unit tests all
// pass, so this is checked here.
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'fs';
import path from 'path';

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {walk(full, out);}
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name)) {out.push(full);}
  }
  return out;
}

/** Source with leading blank lines and comments removed. */
function stripLeadingComments(src: string): string {
  let s = src.replace(/^\uFEFF/, '');
  for (;;) {
    const next = s.replace(/^\s+/, '').replace(/^\/\/[^\n]*\n?/, '').replace(/^\/\*[\s\S]*?\*\//, '');
    if (next === s.replace(/^\s+/, '') && next.length === s.replace(/^\s+/, '').length && !/^(\/\/|\/\*)/.test(next)) {return next;}
    s = next;
  }
}

describe("'use client' directive placement", () => {
  const files = walk(path.join(process.cwd(), 'src'));

  it('is the first statement in every file that declares it', () => {
    const misplaced: string[] = [];
    for (const f of files) {
      const src = readFileSync(f, 'utf8');
      if (!/^\s*['"]use client['"];?\s*$/m.test(src)) {continue;}
      const body = stripLeadingComments(src);
      if (!/^['"]use client['"]/.test(body)) {misplaced.push(path.relative(process.cwd(), f));}
    }
    expect(misplaced, "files whose 'use client' is not the first statement").toEqual([]);
  });
});
