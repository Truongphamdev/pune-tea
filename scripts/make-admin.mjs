#!/usr/bin/env node
/**
 * Cấp (hoặc gỡ) quyền quản trị cho một tài khoản đã đăng ký.
 *
 *   node --env-file=.env.local scripts/make-admin.mjs email@vidu.com          # cấp quyền
 *   node --env-file=.env.local scripts/make-admin.mjs email@vidu.com --remove # gỡ quyền
 *
 * Đọc `DATABASE_URL` / `DATABASE_AUTH_TOKEN` như ứng dụng; không khai thì dùng file cục bộ.
 * Không có trang web nào tự cấp quyền quản trị — chỉ người cầm database mới làm được.
 */
import { createClient } from '@libsql/client';

const [email, flag] = process.argv.slice(2);
if (!email) {
  console.error('Cách dùng: node --env-file=.env.local scripts/make-admin.mjs <email> [--remove]');
  process.exit(1);
}

const url = process.env.DATABASE_URL?.trim() || 'file:storage/puni-tea.db';
const authToken = process.env.DATABASE_AUTH_TOKEN?.trim();
const db = createClient(authToken ? { url, authToken } : { url });
const role = flag === '--remove' ? 'user' : 'admin';

const columns = await db.execute('PRAGMA table_info(users)');
if (!columns.rows.some((column) => column.name === 'role')) {
  await db.execute("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'");
}

const result = await db.execute({
  sql: 'UPDATE users SET role = ? WHERE email = ?',
  args: [role, email.trim().toLowerCase()],
});

if (result.rowsAffected === 0) {
  console.error(`Không có tài khoản ${email}. Hãy đăng ký tài khoản này trên web trước.`);
  process.exit(1);
}
console.log(`${email} → ${role === 'admin' ? 'quản trị viên' : 'người dùng thường'}`);
