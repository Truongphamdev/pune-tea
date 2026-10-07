/**
 * Giỏ hàng dạng hàm thuần (FR-40, FR-41, BR-10, BR-11).
 *
 * Một dòng chỉ lưu sản phẩm + biến thể + số lượng. KHÔNG lưu giá: giá luôn tra lại từ dữ liệu
 * sản phẩm lúc hiển thị, nên sửa tay `localStorage` không đổi được giá.
 */
export interface CartLine {
  readonly productSlug: string;
  readonly variantId: string;
  readonly quantity: number;
}

export type Cart = readonly CartLine[];

export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 99;
export const MAX_CART_LINES = 50;

export const EMPTY_CART: Cart = [];

export function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return MIN_QUANTITY;
  return Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, Math.trunc(quantity)));
}

function sameLine(line: CartLine, productSlug: string, variantId: string): boolean {
  return line.productSlug === productSlug && line.variantId === variantId;
}

/** Thêm vào giỏ; trùng sản phẩm + biến thể thì cộng dồn (FR-41). Giỏ đầy thì giữ nguyên. */
export function addLine(cart: Cart, line: CartLine): Cart {
  const quantity = clampQuantity(line.quantity);
  const existing = cart.find((item) => sameLine(item, line.productSlug, line.variantId));

  if (existing) {
    return setQuantity(cart, line.productSlug, line.variantId, existing.quantity + quantity);
  }
  if (cart.length >= MAX_CART_LINES) return cart;

  return [...cart, { productSlug: line.productSlug, variantId: line.variantId, quantity }];
}

export function setQuantity(
  cart: Cart,
  productSlug: string,
  variantId: string,
  quantity: number,
): Cart {
  return cart.map((item) =>
    sameLine(item, productSlug, variantId) ? { ...item, quantity: clampQuantity(quantity) } : item,
  );
}

export function removeLine(cart: Cart, productSlug: string, variantId: string): Cart {
  return cart.filter((item) => !sameLine(item, productSlug, variantId));
}

export type AddOutcome = 'added' | 'max-quantity' | 'cart-full';

/**
 * `addLine` sẽ làm gì với dòng này — để giao diện báo đúng sự thật thay vì luôn nói "đã thêm".
 * Cộng dồn bị cắt bớt (98 + 5 → 99) vẫn tính là đã thêm.
 */
export function describeAdd(cart: Cart, line: CartLine): AddOutcome {
  const existing = cart.find((item) => sameLine(item, line.productSlug, line.variantId));
  if (existing) return existing.quantity >= MAX_QUANTITY ? 'max-quantity' : 'added';
  return cart.length >= MAX_CART_LINES ? 'cart-full' : 'added';
}

/** Số lượng THẬT SỰ vào giỏ nếu thêm dòng này — ít hơn yêu cầu khi chạm trần 99 món một dòng. */
export function addableQuantity(cart: Cart, line: CartLine): number {
  if (describeAdd(cart, line) !== 'added') return 0;
  const existing = cart.find((item) => sameLine(item, line.productSlug, line.variantId));
  return Math.min(clampQuantity(line.quantity), MAX_QUANTITY - (existing?.quantity ?? 0));
}

/** Tổng số món (cộng số lượng các dòng) — con số trên biểu tượng giỏ ở header. */
export function countItems(cart: Cart): number {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== 'object' || value === null) return false;
  const line = value as Record<string, unknown>;
  return (
    typeof line.productSlug === 'string' &&
    typeof line.variantId === 'string' &&
    typeof line.quantity === 'number' &&
    Number.isInteger(line.quantity) &&
    line.quantity >= MIN_QUANTITY &&
    line.quantity <= MAX_QUANTITY
  );
}

/**
 * Đọc giỏ từ chuỗi `localStorage` (BR-11).
 *
 * Đây là dữ liệu NGOÀI: người dùng sửa tay được, bản cũ của site có thể để lại định dạng khác.
 * JSON hỏng thì coi như giỏ trống; từng dòng sai kiểu thì bỏ riêng dòng đó.
 */
export function parseCart(raw: string | null): Cart {
  if (!raw) return EMPTY_CART;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return EMPTY_CART;
  }
  if (!Array.isArray(parsed)) return EMPTY_CART;

  return parsed
    .filter(isCartLine)
    .slice(0, MAX_CART_LINES)
    .map(({ productSlug, variantId, quantity }) => ({ productSlug, variantId, quantity }));
}

export function serializeCart(cart: Cart): string {
  return JSON.stringify(cart);
}
