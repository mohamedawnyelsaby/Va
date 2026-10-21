// @vitest-environment node
//
// Guards against the failure that left the app half-unstyled: globals.css was
// overwritten by a later version that no longer contained the `vg-*` component
// rules, while ~30 pages kept using the classes. Nothing failed at build time:
// a missing CSS rule is silent. These checks make it loud.
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'fs';
import path from 'path';

const SRC = path.join(process.cwd(), 'src');

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {walk(full, out);}
    else {out.push(full);}
  }
  return out;
}

const files = walk(SRC);
const isTest = (f: string) => /\.test\.(ts|tsx)$/.test(f);
const cssFiles = files.filter((f) => f.endsWith('.css'));
const moduleFiles = cssFiles.filter((f) => f.endsWith('.module.css'));
const codeFiles = files.filter((f) => /\.(ts|tsx)$/.test(f) && !isTest(f));

const css = cssFiles.map((f) => readFileSync(f, 'utf8')).join('\n');
const code = codeFiles.map((f) => ({ f, text: readFileSync(f, 'utf8') }));

/** Every `.vg-xxx` selector defined in a stylesheet or in an inline <style> block. */
function definedVgClasses(): Set<string> {
  const defined = new Set<string>();
  const grab = (text: string) => {
    for (const m of text.matchAll(/\.(vg-[\w-]+)/g)) {defined.add(m[1]);}
  };
  grab(css);
  for (const { text } of code) {
    for (const m of text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {grab(m[1]);}
  }
  return defined;
}

describe('stylesheet integrity', () => {
  it('every vg-* class used in a component has a CSS rule', () => {
    const defined = definedVgClasses();
    const missing = new Map<string, string>();
    for (const { f, text } of code) {
      for (const m of text.matchAll(/class(?:Name)?\s*=\s*(?:"([^"]*)"|\{`([^`]*)`\}|\{'([^']*)'\})/g)) {
        const value = m[1] ?? m[2] ?? m[3] ?? '';
        for (const token of value.split(/\s+/)) {
          if (token.startsWith('vg-') && !defined.has(token)) {
            missing.set(token, path.relative(SRC, f));
          }
        }
      }
    }
    expect(
      [...missing].map(([cls, file]) => `${cls} (first seen in ${file})`),
      'classes used in components but defined in no stylesheet'
    ).toEqual([]);
  });

  it('every CSS variable read with var(--x) is defined somewhere', () => {
    const defined = new Set<string>();
    for (const m of css.matchAll(/(--[\w-]+)\s*:/g)) {defined.add(m[1]);}
    // custom properties set from JS: style={{ '--x': ... }} / setProperty('--x', ...)
    for (const { text } of code) {
      for (const m of text.matchAll(/['"`](--[\w-]+)['"`]\s*[:,]/g)) {defined.add(m[1]);}
    }
    // provided by libraries at runtime, not by our stylesheets
    const external = /^--(font-|radix-|tw-)/;

    const missing = new Map<string, string>();
    const scan = (file: string, text: string) => {
      for (const m of text.matchAll(/var\(\s*(--[\w-]+)\s*(,|\))/g)) {
        const hasFallback = m[2] === ',';
        if (!defined.has(m[1]) && !external.test(m[1]) && !hasFallback) {
          missing.set(m[1], path.relative(SRC, file));
        }
      }
    };
    for (const { f, text } of code) {scan(f, text);}
    for (const f of cssFiles) {scan(f, readFileSync(f, 'utf8'));}

    expect(
      [...missing].map(([v, file]) => `${v} (first seen in ${file})`),
      'variables read without a fallback but defined nowhere'
    ).toEqual([]);
  });

  it('every styles.xxx used from a CSS module exists in that module', () => {
    const missing: string[] = [];
    for (const { f, text } of code) {
      for (const imp of text.matchAll(/import\s+(\w+)\s+from\s+['"]([^'"]+\.module\.css)['"]/g)) {
        const [, name, rel] = imp;
        const target = rel.startsWith('.')
          ? path.resolve(path.dirname(f), rel)
          : path.join(SRC, rel.replace(/^@\//, ''));
        if (!moduleFiles.includes(target)) {continue;}
        const defined = new Set([...readFileSync(target, 'utf8').matchAll(/\.([A-Za-z_][\w-]*)/g)].map((m) => m[1]));
        const used = new Set<string>();
        for (const m of text.matchAll(new RegExp(`\\b${name}\\.([A-Za-z_][\\w]*)`, 'g'))) {used.add(m[1]);}
        for (const m of text.matchAll(new RegExp(`\\b${name}\\[['"]([\\w-]+)['"]\\]`, 'g'))) {used.add(m[1]);}
        for (const cls of used) {
          if (!defined.has(cls)) {missing.push(`${name}.${cls} (in ${path.relative(SRC, f)}, module ${path.relative(SRC, target)})`);}
        }
      }
    }
    expect(missing, 'CSS-module classes used in a component but missing from the module').toEqual([]);
  });
});
