import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Bản clone đã gỡ sạch phần của cửa hàng asset số (BA §4.1, NFR-04, §6).
 *
 * Test này thay cho lệnh `grep` chạy tay: lần sau ai chép lại một file từ bản gốc mà quên gỡ
 * phần ví/đăng nhập thì bộ test báo ngay.
 */
const ROOT = join(__dirname, '../..');
const SRC = join(ROOT, 'src');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/** Chuỗi cấm theo NFR-04 — không phân biệt hoa thường để bắt cả `Wallet`, `SEPAY`, `Asset…`. */
const FORBIDDEN = [/HIÊN nhà Thỏ/i, /@dam\//, /wallet/i, /sepay/i, /asset/i];

/** Route của bản gốc không được còn tồn tại (BA §6). */
const LEGACY_ROUTES = [
  'admin',
  '(auth)',
  '(account)',
  '(public)/products',
  '(public)/categories',
  '(public)/search',
];

describe('Đã gỡ sạch bản gốc', () => {
  it('không còn chuỗi của bản gốc trong src/ (NFR-04)', () => {
    const hits = walk(SRC)
      .filter((file) => /\.(tsx?|css|json)$/.test(file))
      .flatMap((file) => {
        const source = readFileSync(file, 'utf8');
        return FORBIDDEN.filter((pattern) => pattern.test(source)).map(
          (pattern) => `${relative(ROOT, file)} ~ ${pattern}`,
        );
      });

    expect(hits).toEqual([]);
  });

  it('không còn route cũ, middleware APP_MODE hay lớp gọi API', () => {
    const leftovers = [
      ...LEGACY_ROUTES.map((route) => join(SRC, 'app', route)),
      join(SRC, 'middleware.ts'),
      join(SRC, 'lib/api-client.ts'),
      join(SRC, 'lib/server-api.ts'),
    ].filter((path) => existsSync(path));

    expect(leftovers.map((path) => relative(ROOT, path))).toEqual([]);
  });

  it('package.json không phụ thuộc gói workspace @dam/*', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as {
      name: string;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const names = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });

    expect(pkg.name.startsWith('@dam/')).toBe(false);
    expect(names.filter((name) => name.startsWith('@dam/'))).toEqual([]);
  });
});
