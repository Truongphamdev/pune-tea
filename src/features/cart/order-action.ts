'use server';

import { randomInt } from 'node:crypto';
import { z } from 'zod';
import { getCurrentUser } from '@/server/current-user';
import { isUniqueViolation } from '@/server/db';
import { createOrder } from '@/server/orders';
import { consume } from '@/server/rate-limit';
import { addLine, EMPTY_CART, MAX_CART_LINES, MAX_QUANTITY, MIN_QUANTITY } from './cart';
import { buildCartView, type CartView } from './cart-view';
import {
  buildOrderMessage,
  hasErrors,
  makeOrderReference,
  normalizePhone,
  validateCustomer,
  type CustomerInfo,
} from './order';

/** Số lần thử lại khi mã tham chiếu vừa sinh trùng với một đơn đã có. */
const REFERENCE_ATTEMPTS = 5;
const REFERENCE_SUFFIX_RANGE = 10_000;
const TEXT_MAX_LENGTH = 500;

const requestSchema = z.object({
  lines: z
    .array(
      z.object({
        productSlug: z.string().max(120),
        variantId: z.string().max(60),
        quantity: z.number().int().min(MIN_QUANTITY).max(MAX_QUANTITY),
      }),
    )
    .min(1)
    .max(MAX_CART_LINES),
  customer: z.object({
    name: z.string().max(TEXT_MAX_LENGTH),
    phone: z.string().max(30),
    address: z.string().max(TEXT_MAX_LENGTH),
    note: z.string().max(TEXT_MAX_LENGTH),
  }),
});

export type PlaceOrderResult =
  | {
      readonly ok: true;
      readonly message: string;
      readonly reference: string;
    }
  | {
      readonly ok: false;
      readonly error: string;
      /** `unauthenticated`: phiên đăng nhập không còn — giao diện đưa khách sang đăng nhập lại. */
      readonly code: 'invalid' | 'unauthenticated' | 'rate-limited';
    };

function invalid(error: string): PlaceOrderResult {
  return { ok: false, code: 'invalid', error };
}

/** Lưu đơn với một mã tham chiếu chưa ai dùng; trùng mã thì sinh mã khác và thử lại. */
async function saveOrder(userId: number, view: CartView, customer: CustomerInfo): Promise<string> {
  for (let attempt = 0; attempt < REFERENCE_ATTEMPTS; attempt += 1) {
    const reference = newReference();
    try {
      await createOrder({
        reference,
        userId,
        customerName: customer.name.trim(),
        phone: normalizePhone(customer.phone),
        address: customer.address.trim(),
        note: customer.note.trim(),
        totalVnd: view.totalVnd,
        items: view.rows.map((row) => ({
          productSlug: row.product.slug,
          productName: row.product.name,
          variantLabel: row.variant.label,
          unitPriceVnd: row.unitPriceVnd,
          quantity: row.line.quantity,
        })),
      });
      return reference;
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
  }
  throw new Error('Không sinh được mã tham chiếu chưa dùng.');
}

function newReference(): string {
  return makeOrderReference(new Date(), randomInt(REFERENCE_SUFFIX_RANGE) / REFERENCE_SUFFIX_RANGE);
}

/**
 * Chốt đơn ở máy chủ: lưu đơn vào lịch sử của người đang đăng nhập và soạn nội dung đơn.
 *
 * Trình duyệt chỉ gửi lên `{ sản phẩm, biến thể, số lượng }`. Tên, giá và tổng tiền được TÍNH
 * LẠI ở đây từ dữ liệu sản phẩm — không tin bất kỳ con số tiền nào từ phía trình duyệt. Vẫn
 * không có thanh toán: đơn lưu lại chỉ để khách xem lịch sử.
 */
export async function placeOrderAction(input: unknown): Promise<PlaceOrderResult> {
  /*
   * Kiểm đăng nhập TRƯỚC TIÊN và ngay tại máy chủ: giỏ hàng nằm ở trình duyệt nên rào "đăng nhập
   * mới được thêm giỏ" ở giao diện tự nó không chặn được ai gọi thẳng action này.
   */
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, code: 'unauthenticated', error: 'Vui lòng đăng nhập để đặt hàng.' };
  }

  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) return invalid('Dữ liệu đơn hàng không hợp lệ.');

  const { lines, customer } = parsed.data;
  if (hasErrors(validateCustomer(customer))) {
    return invalid('Thông tin nhận hàng chưa hợp lệ.');
  }

  /*
   * Dựng lại giỏ bằng chính luật của giỏ hàng (gộp dòng trùng, tối đa 99 món một dòng): giới
   * hạn ở trình duyệt không chặn được ai gửi thẳng 50 dòng × 99 của cùng một món.
   */
  const view = buildCartView(lines.reduce(addLine, EMPTY_CART));
  if (view.rows.length === 0) return invalid('Giỏ hàng không có sản phẩm hợp lệ.');

  // Kiểm sau cùng, khi đơn đã hợp lệ: đơn bị từ chối vì dữ liệu sai không ăn vào số lượt
  if (!consume('orderUser', String(user.id))) {
    return {
      ok: false,
      code: 'rate-limited',
      error: 'Bạn đã đặt quá nhiều đơn trong thời gian ngắn. Vui lòng thử lại sau ít phút.',
    };
  }

  const reference = await saveOrder(user.id, view, customer);

  return {
    ok: true,
    reference,
    message: buildOrderMessage(view, customer, reference),
  };
}
