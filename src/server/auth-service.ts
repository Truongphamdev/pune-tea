import 'server-only';
import { DUMMY_PASSWORD_HASH, hashPassword, verifyPassword } from './password';
import { clearHits, isRateLimited, recordHit } from './rate-limit';
import { deleteSessionsByUser } from './sessions';
import {
  createUser,
  findCredentialsByEmail,
  findPasswordHashById,
  normalizeEmail,
  updatePasswordHash,
  type User,
} from './users';

export type RegisterResult =
  | { readonly ok: true; readonly user: User }
  | { readonly ok: false; readonly reason: 'email-taken' };

export type LoginResult =
  | { readonly ok: true; readonly user: User }
  | { readonly ok: false; readonly reason: 'invalid' | 'blocked' };

/** Đăng ký tài khoản. Không có bước xác minh email — tạo xong là dùng được ngay. */
export async function registerUser(input: {
  readonly name: string;
  readonly email: string;
  readonly password: string;
}): Promise<RegisterResult> {
  const user = await createUser({
    name: input.name,
    email: input.email,
    passwordHash: hashPassword(input.password),
  });

  return user ? { ok: true, user } : { ok: false, reason: 'email-taken' };
}

/**
 * Kiểm email + mật khẩu.
 *
 * Sai email và sai mật khẩu trả CÙNG một lý do, và cùng tốn một lần băm, để không lộ ra email
 * nào đã đăng ký. Sai quá nhiều lần với một email thì tạm khóa email đó.
 */
export async function authenticate(email: string, password: string): Promise<LoginResult> {
  const key = normalizeEmail(email);
  if (isRateLimited('loginEmail', key)) return { ok: false, reason: 'blocked' };

  const found = await findCredentialsByEmail(key);
  const matches = verifyPassword(password, found?.passwordHash ?? DUMMY_PASSWORD_HASH);

  if (!found || !matches) {
    recordHit('loginEmail', key);
    return { ok: false, reason: 'invalid' };
  }

  clearHits('loginEmail', key);
  return { ok: true, user: found.user };
}

export type ChangePasswordResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: 'wrong-current' | 'same-password' | 'blocked' };

/**
 * Đổi mật khẩu của người ĐANG đăng nhập.
 *
 * Bắt buộc nhập đúng mật khẩu hiện tại: có phiên đăng nhập chưa đủ — máy để quên mở khóa không
 * được phép thành đường chiếm tài khoản. Nhập sai cũng tính vào bộ đếm của đăng nhập, nên form
 * này không thành chỗ dò mật khẩu không giới hạn.
 *
 * Đổi xong thì hủy mọi phiên của tài khoản; nơi gọi tạo lại phiên cho thiết bị hiện tại.
 */
export async function changePassword(
  user: User,
  currentPassword: string,
  newPassword: string,
): Promise<ChangePasswordResult> {
  const key = normalizeEmail(user.email);
  if (isRateLimited('loginEmail', key)) return { ok: false, reason: 'blocked' };

  const stored = await findPasswordHashById(user.id);
  if (!stored || !verifyPassword(currentPassword, stored)) {
    recordHit('loginEmail', key);
    return { ok: false, reason: 'wrong-current' };
  }
  if (verifyPassword(newPassword, stored)) return { ok: false, reason: 'same-password' };

  await updatePasswordHash(user.id, hashPassword(newPassword));
  await deleteSessionsByUser(user.id);
  clearHits('loginEmail', key);
  return { ok: true };
}
