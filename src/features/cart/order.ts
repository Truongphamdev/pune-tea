import { formatVnd } from '@/lib/format';
import type { CartView } from './cart-view';

/** Thông tin nhận hàng khách điền (FR-50) — lưu cùng đơn khi chốt (FR-84). */
export interface CustomerInfo {
  readonly name: string;
  readonly phone: string;
  readonly address: string;
  readonly note: string;
}

export type CustomerErrors = Partial<Record<'name' | 'phone' | 'address', string>>;

export const EMPTY_CUSTOMER: CustomerInfo = { name: '', phone: '', address: '', note: '' };

/** Số di động Việt Nam: 10 chữ số, bắt đầu bằng 0 (FR-50). */
const PHONE_PATTERN = /^0\d{9}$/;

const NOTE_MAX_LENGTH = 500;

/** Bỏ dấu cách, chấm, gạch khách hay gõ khi nhập số điện thoại. */
export function normalizePhone(phone: string): string {
  return phone.replace(/[\s.-]/g, '');
}

export function validateCustomer(info: CustomerInfo): CustomerErrors {
  const errors: CustomerErrors = {};

  if (info.name.trim() === '') errors.name = 'Vui lòng nhập họ tên.';
  if (!PHONE_PATTERN.test(normalizePhone(info.phone))) {
    errors.phone = 'Số điện thoại gồm 10 chữ số và bắt đầu bằng 0.';
  }
  if (info.address.trim() === '') errors.address = 'Vui lòng nhập địa chỉ nhận hàng.';

  return errors;
}

export function hasErrors(errors: CustomerErrors): boolean {
  return Object.keys(errors).length > 0;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/**
 * Mã tham chiếu đơn `PT-YYMMDD-XXXX` (FR-54) — để khách và shop gọi tên cùng một đơn khi nhắn
 * tin, và là mã của đơn trong lịch sử tài khoản.
 *
 * `randomValue` trong khoảng [0, 1) được đưa từ ngoài vào để hàm này thuần và test được.
 */
export function makeOrderReference(now: Date, randomValue: number): string {
  const date = `${pad(now.getFullYear() % 100)}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const suffix = String(Math.floor(randomValue * 10_000)).padStart(4, '0');
  return `PT-${date}-${suffix}`;
}

/**
 * Soạn nội dung đơn dạng văn bản thuần để dán vào tin nhắn Facebook (FR-54).
 *
 * Nhận `CartView` chứ không tự tính lại: tổng tiền ở đây và trên trang giỏ là MỘT con số.
 */
export function buildOrderMessage(
  view: CartView,
  customer: CustomerInfo,
  reference: string,
): string {
  const items = view.rows.map(
    (row, index) =>
      `${index + 1}. ${row.product.name} — ${row.variant.label} × ${row.line.quantity} = ${formatVnd(row.lineTotalVnd)}`,
  );
  const note = customer.note.trim().slice(0, NOTE_MAX_LENGTH);

  return [
    `ĐƠN ĐẶT HÀNG ${reference}`,
    '',
    ...items,
    '',
    `Tổng cộng: ${formatVnd(view.totalVnd)}`,
    '',
    `Người nhận: ${customer.name.trim()}`,
    `Số điện thoại: ${normalizePhone(customer.phone)}`,
    `Địa chỉ: ${customer.address.trim()}`,
    ...(note ? [`Ghi chú: ${note}`] : []),
  ].join('\n');
}
