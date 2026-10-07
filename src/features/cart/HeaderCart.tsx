'use client';

import { CartLink } from '@/features/shell/CartLink';
import { useCartOwnerGuard } from './cart-owner';
import { useCart, useHydrated } from './cart-store';
import { buildCartView } from './cart-view';

/**
 * Biểu tượng giỏ hàng nối với giỏ thật (FR-01, BR-12).
 *
 * Trước khi trình duyệt đọc xong `localStorage` thì đưa `null` — HTML của máy chủ và lần
 * hydrate đầu giống hệt nhau, số chỉ hiện sau đó.
 */
export function HeaderCart() {
  useCartOwnerGuard();
  const cart = useCart();
  const hydrated = useHydrated();

  // Đếm qua `buildCartView` như trang giỏ hàng: dòng trỏ tới sản phẩm không còn tồn tại bị bỏ
  // ở cả hai nơi, nên số trên header không bao giờ lệch với số món trang giỏ hiển thị (BR-11)
  return <CartLink count={hydrated ? buildCartView(cart).itemCount : null} />;
}
