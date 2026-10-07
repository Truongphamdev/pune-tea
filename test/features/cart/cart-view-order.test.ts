import { describe, expect, it } from 'vitest';
import { parseCart } from '@/features/cart/cart';
import { buildCartView } from '@/features/cart/cart-view';
import {
  buildOrderMessage,
  hasErrors,
  makeOrderReference,
  normalizePhone,
  validateCustomer,
} from '@/features/cart/order';

const CART = [
  { productSlug: 'tra-gung', variantId: '40g', quantity: 2 },
  { productSlug: 'tra-dao-hoa-tan', variantId: '240g', quantity: 1 },
];

describe('buildCartView', () => {
  it('lấy giá từ dữ liệu sản phẩm và tính tổng', () => {
    const view = buildCartView(CART);
    expect(view.rows.map((row) => row.lineTotalVnd)).toEqual([78_000, 58_000]);
    expect(view.totalVnd).toBe(136_000);
    expect(view.itemCount).toBe(3);
  });

  it('bỏ qua sản phẩm hoặc biến thể không tồn tại (BR-11)', () => {
    const view = buildCartView([
      ...CART,
      { productSlug: 'khong-co', variantId: 'x', quantity: 1 },
      { productSlug: 'tra-gung', variantId: 'khong-co', quantity: 1 },
    ]);
    expect(view.rows).toHaveLength(2);
    expect(view.totalVnd).toBe(136_000);
  });

  it('sửa tay giá trong localStorage không đổi được tổng (BR-10)', () => {
    const tampered = JSON.stringify(CART.map((line) => ({ ...line, priceVnd: 1 })));
    expect(buildCartView(parseCart(tampered)).totalVnd).toBe(136_000);
  });
});

const CUSTOMER = { name: ' Lan ', phone: '0901 234 567', address: '12 Lê Lợi', note: '' };

describe('validateCustomer (FR-50)', () => {
  it('thông tin hợp lệ thì không có lỗi', () => {
    expect(hasErrors(validateCustomer(CUSTOMER))).toBe(false);
  });

  it('bỏ trống thì báo lỗi từng ô', () => {
    const errors = validateCustomer({ name: ' ', phone: '', address: '', note: '' });
    expect(Object.keys(errors).sort()).toEqual(['address', 'name', 'phone']);
  });

  it.each(['090123456', '09012345678', '1901234567', '09012x4567'])(
    'số %s không hợp lệ',
    (phone) => {
      expect(validateCustomer({ ...CUSTOMER, phone }).phone).toBeDefined();
    },
  );

  it('chấp nhận dấu cách, chấm, gạch trong số điện thoại', () => {
    expect(normalizePhone('0901.234-567')).toBe('0901234567');
  });
});

describe('makeOrderReference', () => {
  it('có dạng PT-YYMMDD-XXXX', () => {
    expect(makeOrderReference(new Date(2026, 9, 6), 0.1234)).toBe('PT-261006-1234');
    expect(makeOrderReference(new Date(2026, 0, 5), 0)).toBe('PT-260105-0000');
  });
});

describe('buildOrderMessage (FR-54)', () => {
  const view = buildCartView(CART);
  const message = buildOrderMessage(
    view,
    { ...CUSTOMER, note: ' Giao giờ hành chính ' },
    'PT-261006-1234',
  );

  it('có mã, từng dòng hàng, tổng tiền và thông tin nhận hàng', () => {
    expect(message).toContain('PT-261006-1234');
    expect(message).toContain('1. Trà Gừng — 40g (20 túi) × 2 = 78.000 ₫');
    expect(message).toContain('2. Trà Đào Hòa Tan — 240g (16 gói × 15g) × 1 = 58.000 ₫');
    expect(message).toContain('Tổng cộng: 136.000 ₫');
    expect(message).toContain('Người nhận: Lan');
    expect(message).toContain('Số điện thoại: 0901234567');
    expect(message).toContain('Địa chỉ: 12 Lê Lợi');
    expect(message).toContain('Ghi chú: Giao giờ hành chính');
  });

  it('không có ghi chú thì không in dòng ghi chú', () => {
    expect(buildOrderMessage(view, CUSTOMER, 'PT-1')).not.toContain('Ghi chú');
  });
});
