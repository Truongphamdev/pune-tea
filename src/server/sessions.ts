import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { queryOne, run } from './db';
import { findUserById, type User } from './users';

/** Phiên đăng nhập sống 30 ngày kể từ lúc đăng nhập. */
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const TOKEN_BYTES = 32;

/**
 * Database chỉ giữ BẢN BĂM của token. Ai đọc được database cũng không lấy được token để giả
 * làm người dùng — token thật chỉ nằm trong cookie của trình duyệt.
 */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Tạo phiên mới, trả token để đặt vào cookie. */
export async function createSession(userId: number, now: number = Date.now()): Promise<string> {
  const token = randomBytes(TOKEN_BYTES).toString('base64url');
  await run('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)', [
    hashToken(token),
    userId,
    now + SESSION_TTL_MS,
  ]);
  return token;
}

/** Người dùng của một token, hoặc `null` khi token lạ hay đã hết hạn (phiên hết hạn bị xóa luôn). */
export async function findSessionUser(
  token: string,
  now: number = Date.now(),
): Promise<User | null> {
  const tokenHash = hashToken(token);
  const row = await queryOne<{ user_id: number; expires_at: number }>(
    'SELECT user_id, expires_at FROM sessions WHERE token_hash = ?',
    [tokenHash],
  );

  if (!row) return null;
  if (Number(row.expires_at) <= now) {
    await run('DELETE FROM sessions WHERE token_hash = ?', [tokenHash]);
    return null;
  }
  return findUserById(Number(row.user_id));
}

export async function deleteSession(token: string): Promise<void> {
  await run('DELETE FROM sessions WHERE token_hash = ?', [hashToken(token)]);
}

/** Hủy MỌI phiên của một người dùng — dùng khi đổi mật khẩu, để thiết bị khác bị đăng xuất. */
export async function deleteSessionsByUser(userId: number): Promise<void> {
  await run('DELETE FROM sessions WHERE user_id = ?', [userId]);
}
