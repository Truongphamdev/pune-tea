'use client';

import { useEffect } from 'react';
import { useSessionState } from '@/features/auth/session-store';
import { cartActions } from './cart-store';

/** Khóa `localStorage` ghi giỏ hàng hiện tại thuộc về tài khoản nào. */
export const CART_OWNER_KEY = 'puni-tea:cart-owner';

function readOwner(): string | null {
  try {
    return window.localStorage.getItem(CART_OWNER_KEY);
  } catch {
    return null;
  }
}

function writeOwner(email: string | null): void {
  try {
    if (email === null) window.localStorage.removeItem(CART_OWNER_KEY);
    else window.localStorage.setItem(CART_OWNER_KEY, email);
  } catch {
    // localStorage bị chặn: giỏ cũng chỉ sống trong bộ nhớ, không có gì để thừa hưởng
  }
}

/**
 * Giữ cho giỏ hàng chỉ thuộc về MỘT tài khoản.
 *
 * Giỏ nằm trong `localStorage` của trình duyệt, không gắn với phiên đăng nhập. Nút Đăng xuất
 * có xóa giỏ, nhưng phiên còn mất theo đường khác: hết hạn, hoặc bị hủy vì đổi mật khẩu ở máy
 * khác. Không dọn ở đây thì người đăng nhập kế tiếp trên cùng máy thừa hưởng giỏ của người trước.
 *
 * Giỏ chưa ghi chủ (từ trước khi có tính năng này) thì gán cho người đang đăng nhập.
 */
export function reconcileCartOwner(email: string | null): void {
  const owner = readOwner();
  if (owner === email) return;

  if (owner !== null) cartActions.clear();
  writeOwner(email);
}

/** Đối chiếu chủ giỏ mỗi khi có câu trả lời DỨT KHOÁT về phiên đăng nhập. */
export function useCartOwnerGuard(): void {
  const { user, loaded } = useSessionState();

  useEffect(() => {
    if (loaded) reconcileCartOwner(user?.email ?? null);
  }, [user, loaded]);
}
