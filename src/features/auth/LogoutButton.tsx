'use client';

import { cartActions } from '@/features/cart/cart-store';
import { logoutAction } from './actions';

/**
 * Nút đăng xuất. Xóa luôn giỏ hàng trong trình duyệt: giỏ thuộc về người vừa đăng xuất, để lại
 * thì người đăng nhập kế tiếp trên cùng máy thừa hưởng giỏ của người trước.
 */
export function LogoutButton() {
  return (
    <form action={logoutAction} onSubmit={() => cartActions.clear()}>
      <button
        type="submit"
        className="rounded-full border border-line bg-raised px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-line"
      >
        Đăng xuất
      </button>
    </form>
  );
}
