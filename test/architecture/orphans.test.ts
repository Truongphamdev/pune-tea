import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Không có hàm API client hay component nào được phép MỒ CÔI.
 *
 * Ở bản gốc, nhiều hàm và component từng nằm đó hoàn chỉnh mà không nơi nào gọi. Với bản
 * clone này còn thêm một lý do: gỡ tính năng cũ (ví, đăng nhập, admin…) rất dễ để sót mã chết.
 * Test này bắt mọi component export trong `features/` và `components/` mà không được render ở
 * đâu (trong `src/` hoặc trong test).
 */
const SRC = join(__dirname, '../../src');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(full) && !full.endsWith('.d.ts')) out.push(full);
  }
  return out;
}

const files = walk(SRC);
const sources = new Map(files.map((f) => [f, readFileSync(f, 'utf8')]));
const testSources = walk(join(__dirname, '..')).map((f) => readFileSync(f, 'utf8'));

function usedOutside(file: string, pattern: RegExp): boolean {
  return files.some((f) => f !== file && pattern.test(sources.get(f) as string));
}

describe('Kiến trúc web — không có gì mồ côi', () => {
  it('mọi hàm export trong *-api.ts đều có nơi gọi', () => {
    const orphans: string[] = [];

    for (const file of files.filter((f) => f.endsWith('-api.ts') && f.includes('/features/'))) {
      const source = sources.get(file) as string;
      for (const match of source.matchAll(/^export (?:async )?function (\w+)/gm)) {
        const name = match[1] as string;
        // Khớp cả khi truyền làm tham chiếu (`useAsyncAction(adminApi.createProduct)`),
        // không chỉ khi gọi trực tiếp `name(`
        const mentioned = new RegExp(`\\b${name}\\b`);
        if (!usedOutside(file, mentioned)) {
          orphans.push(`${relative(SRC, file)} → ${name}()`);
        }
      }
    }

    expect(orphans).toEqual([]);
  });

  it('mọi component export trong features/ và components/ đều được render ở đâu đó', () => {
    const orphans: string[] = [];

    for (const file of files.filter(
      (f) => f.endsWith('.tsx') && (f.includes('/features/') || f.includes('/components/')),
    )) {
      const source = sources.get(file) as string;
      for (const match of source.matchAll(/^export function ([A-Z]\w+)/gm)) {
        const name = match[1] as string;
        const rendered = new RegExp(`<${name}[\\s/>]`);
        const inTests = testSources.some((s) => rendered.test(s));
        if (!usedOutside(file, rendered) && !inTests) {
          orphans.push(`${relative(SRC, file)} → <${name}>`);
        }
      }
    }

    expect(orphans).toEqual([]);
  });
});
