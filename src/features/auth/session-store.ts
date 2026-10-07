'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useSyncExternalStore } from 'react';

export interface SessionUser {
  readonly name: string;
  readonly email: string;
}

/** Đường dẫn API trả người đang đăng nhập. */
export const SESSION_ENDPOINT = '/api/phien';

/**
 * Trạng thái đăng nhập nhìn từ trình duyệt, DÙNG CHUNG cho cả trang.
 *
 * Một kho duy nhất thay vì mỗi component tự hỏi API: trang sản phẩm có 15 nút "Thêm vào giỏ",
 * mỗi nút tự hỏi là 15 yêu cầu giống hệt nhau cho một câu trả lời.
 *
 * Hỏi API chứ không đọc cookie ở máy chủ trong khung trang: khung trang đọc cookie thì MỌI
 * trang (sản phẩm, bài viết…) mất dựng tĩnh.
 */
export interface SessionState {
  readonly user: SessionUser | null;
  /** `true` khi `user` là câu trả lời DỨT KHOÁT của máy chủ, không phải "chưa hỏi" hay "hỏi lỗi". */
  readonly loaded: boolean;
}

const UNKNOWN: SessionState = { user: null, loaded: false };

let state: SessionState = UNKNOWN;
/** `true` khi đang hỏi lại — lúc đó `state` có thể đã cũ. */
let stale = true;
let inflight: Promise<SessionUser | null> | null = null;
const listeners = new Set<() => void>();

function isSessionUser(value: unknown): value is SessionUser {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.name === 'string' && typeof candidate.email === 'string';
}

/** Ném lỗi khi máy chủ không trả lời được — "không biết" khác với "chưa đăng nhập". */
async function fetchSessionUser(): Promise<SessionUser | null> {
  const response = await fetch(SESSION_ENDPOINT, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Phiên: HTTP ${response.status}`);

  const body: unknown = await response.json();
  const found =
    typeof body === 'object' && body !== null ? (body as { user?: unknown }).user : null;
  return isSessionUser(found) ? found : null;
}

function publish(next: SessionUser | null): SessionUser | null {
  state = { user: next, loaded: true };
  stale = false;
  inflight = null;
  for (const listener of listeners) listener();
  return next;
}

/**
 * Hỏi lại máy chủ. Nhiều nơi gọi cùng lúc chỉ sinh MỘT yêu cầu.
 *
 * Mất mạng hay API lỗi thì KHÔNG công bố gì: giữ nguyên điều đã biết. Coi lỗi mạng là "đã đăng
 * xuất" sẽ làm các nơi nghe trạng thái này hành động sai — ví dụ xóa giỏ của người vẫn đang
 * đăng nhập chỉ vì một yêu cầu rớt.
 */
export function refreshSession(): Promise<SessionUser | null> {
  stale = true;
  inflight ??= fetchSessionUser().then(publish, () => {
    inflight = null;
    return state.user;
  });
  return inflight;
}

/**
 * Người đang đăng nhập, CHỜ câu trả lời nếu chưa có — dùng ngay trước một hành động cần đăng
 * nhập, để không coi nhầm "chưa kịp hỏi xong" là "chưa đăng nhập".
 */
export function ensureSession(): Promise<SessionUser | null> {
  return stale ? refreshSession() : Promise.resolve(state.user);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Trạng thái đầy đủ: người dùng + đã có câu trả lời dứt khoát chưa. */
export function useSessionState(): SessionState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => UNKNOWN,
  );
}

/** Người đang đăng nhập — `null` khi chưa đăng nhập HOẶC chưa biết. */
export function useSessionUser(): SessionUser | null {
  return useSessionState().user;
}

/**
 * Hỏi lại trạng thái đăng nhập mỗi khi đổi trang — đặt ở MỘT chỗ (thanh đầu trang), để giao
 * diện cập nhật ngay sau khi đăng nhập hoặc đăng xuất.
 */
export function useSessionSync(): void {
  const pathname = usePathname();

  useEffect(() => {
    void refreshSession();
  }, [pathname]);
}

/** Đưa sang trang đăng nhập, đăng nhập xong quay lại đúng trang đang đứng. */
export function goToLogin(): void {
  const here = `${window.location.pathname}${window.location.search}`;
  window.location.assign(`/dang-nhap?tiep=${encodeURIComponent(here)}`);
}

/** Chỉ dùng trong test: đặt sẵn trạng thái đăng nhập, hoặc `undefined` để về trạng thái chưa hỏi. */
export function setSessionForTest(next: SessionUser | null | undefined): void {
  state = next === undefined ? UNKNOWN : { user: next, loaded: true };
  stale = next === undefined;
  inflight = null;
  for (const listener of listeners) listener();
}
