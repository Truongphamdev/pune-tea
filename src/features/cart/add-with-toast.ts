import { showToast } from '@/components/toast';
import { ensureSession, goToLogin } from '@/features/auth/session-store';
import { MAX_CART_LINES, MAX_QUANTITY, type AddOutcome, type CartLine } from './cart';
import { cartActions } from './cart-store';

/**
 * Thêm vào giỏ rồi báo ĐÚNG kết quả. Chạm giới hạn (99 món một dòng, 50 dòng một giỏ) thì giỏ
 * không đổi — nói "đã thêm" lúc đó là báo sai cho khách.
 */
function addToCartWithToast(line: CartLine, productName: string): AddOutcome {
  const { outcome, quantity } = cartActions.add(line);

  if (outcome === 'added') {
    // In số lượng THẬT SỰ vào giỏ: đang có 98 món mà thêm 5 thì chỉ vào được 1
    const count = quantity > 1 ? `${quantity} × ` : '';
    showToast(`Đã thêm ${count}${productName} vào giỏ hàng.`);
  } else if (outcome === 'max-quantity') {
    showToast(`Mỗi món tối đa ${MAX_QUANTITY} — ${productName} trong giỏ đã đủ.`, 'error');
  } else {
    showToast(`Giỏ hàng tối đa ${MAX_CART_LINES} dòng. Hãy bớt một món trước khi thêm.`, 'error');
  }

  return outcome;
}

/**
 * Thêm vào giỏ — CHỈ khi đã đăng nhập (BA FR-84). Chưa đăng nhập thì đưa sang trang đăng nhập
 * rồi quay lại đúng trang đang xem.
 *
 * Đây là rào ở giao diện cho trải nghiệm rõ ràng; rào THẬT nằm ở máy chủ: trang giỏ hàng và
 * việc chốt đơn đều kiểm phiên đăng nhập, vì giỏ nằm trong `localStorage` — thứ người dùng tự
 * sửa được.
 */
export async function addToCartIfSignedIn(
  line: CartLine,
  productName: string,
): Promise<AddOutcome | 'login-required'> {
  if (!(await ensureSession())) {
    goToLogin();
    return 'login-required';
  }
  return addToCartWithToast(line, productName);
}
