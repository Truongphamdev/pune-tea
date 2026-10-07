'use client';

import { useSyncExternalStore } from 'react';
import {
  addableQuantity,
  addLine,
  describeAdd,
  EMPTY_CART,
  parseCart,
  removeLine,
  serializeCart,
  setQuantity,
  type AddOutcome,
  type Cart,
  type CartLine,
} from './cart';
import { buildCartView } from './cart-view';

/** Kết quả một lần thêm: có thêm được không, và thật sự thêm được bao nhiêu món. */
export interface AddResult {
  readonly outcome: AddOutcome;
  readonly quantity: number;
}

/** Khóa `localStorage` của giỏ hàng (FR-40). Đổi định dạng thì đổi hậu tố phiên bản. */
export const CART_STORAGE_KEY = 'puni-tea:cart:v1';

/**
 * Kho giỏ hàng phía trình duyệt — lớp mỏng quanh các hàm thuần ở `cart.ts`.
 *
 * Giữ một bản trong bộ nhớ để `useSyncExternalStore` nhận CÙNG một tham chiếu giữa các lần
 * đọc (trả mảng mới mỗi lần là vòng lặp vẽ vô hạn). Bản đó nạp từ `localStorage` ở lần đăng
 * ký đầu tiên, và nạp lại khi tab khác sửa giỏ.
 */
let current: Cart = EMPTY_CART;
let loaded = false;
const listeners = new Set<() => void>();

function readStorage(): Cart {
  try {
    const cart = parseCart(window.localStorage.getItem(CART_STORAGE_KEY));
    // Dòng trỏ tới sản phẩm/biến thể không còn tồn tại bị bỏ ngay lúc nạp: để lại thì chúng
    // vô hình với khách nhưng vẫn chiếm chỗ trong giới hạn số dòng của giỏ
    return buildCartView(cart).rows.map((row) => row.line);
  } catch {
    // Trình duyệt chặn localStorage (chế độ riêng tư nghiêm ngặt) — giỏ chỉ sống trong bộ nhớ
    return EMPTY_CART;
  }
}

function writeStorage(cart: Cart): void {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, serializeCart(cart));
  } catch {
    // Hết dung lượng hoặc bị chặn: giỏ vẫn đúng trong phiên này, chỉ không còn sau khi tải lại
  }
}

function emit(): void {
  for (const listener of listeners) listener();
}

function ensureLoaded(): void {
  if (loaded) return;
  current = readStorage();
  loaded = true;
}

function onStorage(event: StorageEvent): void {
  if (event.key !== null && event.key !== CART_STORAGE_KEY) return;
  current = readStorage();
  emit();
}

function subscribe(listener: () => void): () => void {
  ensureLoaded();
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener('storage', onStorage);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener('storage', onStorage);
  };
}

function getSnapshot(): Cart {
  ensureLoaded();
  return current;
}

/** Máy chủ không biết giỏ hàng — luôn dựng như giỏ trống (BR-12). */
function getServerSnapshot(): Cart {
  return EMPTY_CART;
}

function update(next: Cart): void {
  ensureLoaded();
  if (next === current) return;
  current = next;
  writeStorage(next);
  emit();
}

export const cartActions = {
  /** Thêm vào giỏ và cho biết kết quả thật: đã thêm, đã chạm trần số lượng, hay giỏ đã đầy. */
  add(line: CartLine): AddResult {
    ensureLoaded();
    const outcome = describeAdd(current, line);
    const quantity = addableQuantity(current, line);
    if (outcome === 'added') update(addLine(current, line));
    return { outcome, quantity };
  },
  setQuantity(productSlug: string, variantId: string, quantity: number): void {
    ensureLoaded();
    update(setQuantity(current, productSlug, variantId, quantity));
  },
  remove(productSlug: string, variantId: string): void {
    ensureLoaded();
    update(removeLine(current, productSlug, variantId));
  },
  clear(): void {
    update(EMPTY_CART);
  },
};

/** Giỏ hiện tại. Lần dựng ở máy chủ và lần hydrate đầu luôn là giỏ trống. */
export function useCart(): Cart {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const subscribeNoop = (): (() => void) => () => {};

/** `false` ở máy chủ và lần hydrate đầu, `true` sau đó — để chưa đọc xong giỏ thì chưa vẽ "giỏ trống". */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

/** Chỉ dùng trong test: đưa kho về trạng thái chưa nạp. */
export function resetCartStoreForTest(): void {
  current = EMPTY_CART;
  loaded = false;
}
