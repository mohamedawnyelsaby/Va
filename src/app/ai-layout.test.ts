// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';

const css = readFileSync(path.join(process.cwd(), 'src/app/[locale]/ai/page.module.css'), 'utf8');
const rule = (sel: string) => css.match(new RegExp(`^\\${sel}\\s*\\{([^}]*)\\}`, 'm'))?.[1] ?? '';

describe('AI chat layout invariants', () => {
  it('the chat shell is pinned between the fixed header and the fixed bottom nav', () => {
    const page = rule('.page');
    expect(page).toMatch(/position:\s*fixed/);
    expect(page).toMatch(/top:\s*var\(--navH\)/);
    expect(page).toMatch(/bottom:\s*var\(--bnavH/);
    expect(page).toMatch(/flex-direction:\s*column/);
  });

  it('the message list takes the free space, so the input stays at the bottom', () => {
    expect(rule('.messages')).toMatch(/flex:\s*1/);
    expect(rule('.inputArea')).toMatch(/flex-shrink:\s*0/);
  });

  it('suggestions are a single scrollable row, not a block that squeezes the conversation', () => {
    expect(rule('.chips')).toMatch(/flex-wrap:\s*nowrap/);
    expect(rule('.chips')).toMatch(/overflow-x:\s*auto/);
  });
});
