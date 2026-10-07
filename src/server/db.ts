import 'server-only';
import { createClient as createNativeClient, type Client, type InValue } from '@libsql/client';
import { createClient as createWebClient } from '@libsql/client/web';
import { mkdirSync } from 'node:fs';
import type { EnvVars } from '@/config/site';
import { dirname, resolve } from 'node:path';

/** Database mặc định khi chạy máy cá nhân: một file SQLite, nằm ngoài `src/`, không đưa vào git. */
const DEFAULT_DATABASE_URL = 'file:storage/puni-tea.db';

/**
 * Cấu trúc bảng. `CREATE TABLE IF NOT EXISTS` chạy ở lần kết nối đầu của mỗi tiến trình: không
 * có bước dựng database riêng — chạy máy cá nhân hay deploy đều tự có bảng.
 *
 * Đơn hàng CHÉP tên sản phẩm, nhãn biến thể và đơn giá tại thời điểm đặt: sau này sửa giá hay
 * gỡ sản phẩm trong mã nguồn thì lịch sử đơn vẫn đúng như lúc khách đặt.
 */
const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT NOT NULL UNIQUE,
    name          TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS sessions_user_id ON sessions(user_id);

  CREATE TABLE IF NOT EXISTS orders (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    reference     TEXT NOT NULL UNIQUE,
    user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    phone         TEXT NOT NULL,
    address       TEXT NOT NULL,
    note          TEXT NOT NULL DEFAULT '',
    total_vnd     INTEGER NOT NULL CHECK (total_vnd >= 0),
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS orders_user_id ON orders(user_id);

  CREATE TABLE IF NOT EXISTS order_items (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id       INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_slug   TEXT NOT NULL,
    product_name   TEXT NOT NULL,
    variant_label  TEXT NOT NULL,
    unit_price_vnd INTEGER NOT NULL CHECK (unit_price_vnd > 0),
    quantity       INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 99)
  );
  CREATE INDEX IF NOT EXISTS order_items_order_id ON order_items(order_id);
`;

/**
 * Kết nối database qua `@libsql/client`: cùng một API cho ba nơi —
 * - `file:…`: file SQLite trên máy cá nhân (không cần cài gì thêm);
 * - `libsql://…` + token: Turso khi deploy lên Vercel (serverless không giữ được file);
 * - `:memory:`: database trắng cho test.
 */
export type Db = Client;

export interface DatabaseConfig {
  readonly url: string;
  readonly authToken?: string;
}

/** Đọc cấu hình từ biến môi trường; thiếu thì dùng file cục bộ. */
export function databaseConfigFromEnv(env: EnvVars = process.env): DatabaseConfig {
  const url = env.DATABASE_URL?.trim() || DEFAULT_DATABASE_URL;
  /*
   * Serverless (Vercel) không có đĩa ghi được: rơi về file cục bộ ở đó thì lỗi chỉ hiện ra lúc
   * khách bấm đăng ký, dưới dạng "trang gặp trục trặc" không nói lý do. Dừng ngay với thông
   * báo nêu đúng biến còn thiếu để người deploy đọc được trong log.
   */
  if (env.VERCEL && url.startsWith('file:')) {
    throw new Error(
      'Thiếu DATABASE_URL (libsql://…) và DATABASE_AUTH_TOKEN trong Environment Variables của Vercel — serverless không lưu được file SQLite.',
    );
  }
  const authToken = env.DATABASE_AUTH_TOKEN?.trim();
  return authToken ? { url, authToken } : { url };
}

/** Mở kết nối và dựng bảng. */
export async function openDatabase(config: DatabaseConfig): Promise<Db> {
  if (config.url.startsWith('file:')) {
    mkdirSync(dirname(resolve(config.url.slice('file:'.length))), { recursive: true });
  }

  /*
   * `file:` và `:memory:` cần bản native (có binary SQLite). `libsql://` thì dùng bản web — chỉ
   * gọi HTTP, không cần binary nào — để trên serverless không phụ thuộc việc binary đúng nền
   * tảng có được cài hay không.
   */
  const isLocal = config.url.startsWith('file:') || config.url === ':memory:';
  const db = isLocal ? createNativeClient(config) : createWebClient(config);
  // SQLite cục bộ mặc định KHÔNG cưỡng chế khóa ngoại; thiếu dòng này thì ON DELETE CASCADE vô tác dụng
  await db.execute('PRAGMA foreign_keys = ON');
  await db.executeMultiple(SCHEMA);
  return db;
}

/*
 * Giữ kết nối trên `globalThis`: ở chế độ dev, Next nạp lại module sau mỗi lần sửa mã, và biến
 * cấp module sẽ mở thêm một kết nối mới mỗi lần — vài chục lần sửa là cạn file handle.
 */
const globalStore = globalThis as typeof globalThis & { __puniTeaDb?: Promise<Db> };

/** Kết nối dùng chung của ứng dụng, mở ở lần gọi đầu tiên. */
export function getDb(): Promise<Db> {
  globalStore.__puniTeaDb ??= openDatabase(databaseConfigFromEnv());
  return globalStore.__puniTeaDb;
}

/** Chỉ dùng trong test: thay kết nối dùng chung bằng một database trong bộ nhớ. */
export function useDatabaseForTest(db: Db): void {
  globalStore.__puniTeaDb = Promise.resolve(db);
}

/** Thực thi một câu lệnh có tham số trên kết nối dùng chung. */
export async function run(sql: string, args: InValue[] = []) {
  const db = await getDb();
  return db.execute({ sql, args });
}

/** Hàng đầu tiên của một truy vấn, hoặc `null`. Kiểu hàng do nơi gọi khai, khớp với câu SELECT. */
export async function queryOne<Row>(sql: string, args: InValue[] = []): Promise<Row | null> {
  const result = await run(sql, args);
  return (result.rows[0] as Row | undefined) ?? null;
}

export async function queryAll<Row>(sql: string, args: InValue[] = []): Promise<Row[]> {
  const result = await run(sql, args);
  return result.rows as unknown as Row[];
}

/**
 * Lỗi vi phạm UNIQUE. Bản cục bộ báo mã `SQLITE_CONSTRAINT_UNIQUE`, bản Turso chỉ báo
 * `SQLITE_CONSTRAINT` kèm thông điệp — nên kiểm cả hai.
 */
export function isUniqueViolation(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const code = 'code' in error && typeof error.code === 'string' ? error.code : '';
  return code.startsWith('SQLITE_CONSTRAINT') && /UNIQUE/i.test(error.message);
}
