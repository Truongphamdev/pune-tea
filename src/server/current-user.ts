import 'server-only';
import { cookies } from 'next/headers';
import { siteUrl } from '@/config/site';
import { createSession, deleteSession, findSessionUser, SESSION_TTL_MS } from './sessions';
import type { User } from './users';

export const SESSION_COOKIE = 'puni_session';

/**
 * Cookie phiên: `httpOnly` để JavaScript của trang không đọc được token, `sameSite=lax` để
 * trang khác không gửi kèm cookie trong các yêu cầu ghi.
 *
 * `secure` bật theo giao thức của site chứ không theo NODE_ENV: người chấm chạy `pnpm start`
 * trên http://localhost, và một số trình duyệt bỏ cookie `Secure` trên kết nối không mã hóa —
 * triệu chứng là đăng nhập "thành công" nhưng tải lại là mất phiên.
 */
function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: siteUrl().startsWith('https://'),
    path: '/',
    maxAge: maxAgeSeconds,
  };
}

/** Người đang đăng nhập, hoặc `null`. Đọc cookie nên trang gọi hàm này luôn dựng theo yêu cầu. */
export async function getCurrentUser(): Promise<User | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? findSessionUser(token) : null;
}

export async function signIn(userId: number): Promise<void> {
  const token = await createSession(userId);
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions(SESSION_TTL_MS / 1000));
}

export async function signOut(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await deleteSession(token);
  store.set(SESSION_COOKIE, '', cookieOptions(0));
}
