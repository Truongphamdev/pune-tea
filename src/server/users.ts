import 'server-only';
import { isUniqueViolation, queryOne, run } from './db';

/** Tài khoản ở dạng trả ra ngoài — KHÔNG có chuỗi băm mật khẩu. */
export interface User {
  readonly id: number;
  readonly email: string;
  readonly name: string;
  readonly createdAt: string;
}

interface UserRow {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  created_at: string;
}

function toUser(row: UserRow): User {
  return { id: Number(row.id), email: row.email, name: row.name, createdAt: row.created_at };
}

/** Email lưu và tra luôn ở dạng chữ thường, bỏ khoảng trắng hai đầu. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findUserById(id: number): Promise<User | null> {
  const row = await queryOne<UserRow>('SELECT * FROM users WHERE id = ?', [id]);
  return row ? toUser(row) : null;
}

/** Dùng riêng cho việc đăng nhập: trả kèm chuỗi băm để so mật khẩu. */
export async function findCredentialsByEmail(
  email: string,
): Promise<{ readonly user: User; readonly passwordHash: string } | null> {
  const row = await queryOne<UserRow>('SELECT * FROM users WHERE email = ?', [
    normalizeEmail(email),
  ]);
  return row ? { user: toUser(row), passwordHash: row.password_hash } : null;
}

/** Tạo tài khoản; trả `null` khi email đã có người đăng ký (ràng buộc UNIQUE của database). */
export async function createUser(input: {
  readonly email: string;
  readonly name: string;
  readonly passwordHash: string;
}): Promise<User | null> {
  try {
    const result = await run('INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)', [
      normalizeEmail(input.email),
      input.name.trim(),
      input.passwordHash,
    ]);
    return findUserById(Number(result.lastInsertRowid));
  } catch (error) {
    if (isUniqueViolation(error)) return null;
    throw error;
  }
}

/** Chuỗi băm mật khẩu hiện tại của một tài khoản — chỉ dùng để xác nhận trước khi đổi mật khẩu. */
export async function findPasswordHashById(id: number): Promise<string | null> {
  const row = await queryOne<{ password_hash: string }>(
    'SELECT password_hash FROM users WHERE id = ?',
    [id],
  );
  return row?.password_hash ?? null;
}

export async function updatePasswordHash(id: number, passwordHash: string): Promise<void> {
  await run('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);
}
