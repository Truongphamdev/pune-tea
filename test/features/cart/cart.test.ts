import { describe, expect, it } from 'vitest';
import {
  addLine,
  clampQuantity,
  countItems,
  EMPTY_CART,
  MAX_CART_LINES,
  parseCart,
  removeLine,
  serializeCart,
  setQuantity,
  type Cart,
} from '@/features/cart/cart';

const GUNG = { productSlug: 'tra-gung', variantId: '40g' };

describe('addLine', () => {
  it('thêm dòng mới và không đổi giỏ cũ', () => {
    const next = addLine(EMPTY_CART, { ...GUNG, quantity: 2 });
    expect(next).toEqual([{ ...GUNG, quantity: 2 }]);
    expect(EMPTY_CART).toEqual([]);
  });

  it('cùng sản phẩm + biến thể thì cộng dồn, không tạo dòng mới (FR-41)', () => {
    const once = addLine(EMPTY_CART, { ...GUNG, quantity: 2 });
    const twice = addLine(once, { ...GUNG, quantity: 3 });
    expect(twice).toEqual([{ ...GUNG, quantity: 5 }]);
  });

  it('khác biến thể là dòng riêng', () => {
    const cart = addLine(
      addLine(EMPTY_CART, { productSlug: 'tra-dao-hoa-tan', variantId: '180g', quantity: 1 }),
      { productSlug: 'tra-dao-hoa-tan', variantId: '240g', quantity: 1 },
    );
    expect(cart).toHaveLength(2);
  });

  it('cộng dồn vượt 99 thì chặn ở 99 (BR-11)', () => {
    const cart = addLine(addLine(EMPTY_CART, { ...GUNG, quantity: 98 }), { ...GUNG, quantity: 5 });
    expect(cart[0]?.quantity).toBe(99);
  });

  it('giỏ đủ 50 dòng thì không nhận thêm dòng mới', () => {
    const full: Cart = Array.from({ length: MAX_CART_LINES }, (_, index) => ({
      productSlug: `sp-${index}`,
      variantId: 'a',
      quantity: 1,
    }));
    expect(addLine(full, { ...GUNG, quantity: 1 })).toBe(full);
  });
});

describe('setQuantity / removeLine / countItems', () => {
  const cart = addLine(addLine(EMPTY_CART, { ...GUNG, quantity: 2 }), {
    productSlug: 'tra-den-barista',
    variantId: '200g',
    quantity: 1,
  });

  it('đặt số lượng, kẹp trong 1–99', () => {
    expect(setQuantity(cart, 'tra-gung', '40g', 7)[0]?.quantity).toBe(7);
    expect(setQuantity(cart, 'tra-gung', '40g', 0)[0]?.quantity).toBe(1);
    expect(setQuantity(cart, 'tra-gung', '40g', 500)[0]?.quantity).toBe(99);
  });

  it('xóa đúng một dòng', () => {
    expect(removeLine(cart, 'tra-gung', '40g')).toEqual([
      { productSlug: 'tra-den-barista', variantId: '200g', quantity: 1 },
    ]);
  });

  it('đếm tổng số món', () => {
    expect(countItems(cart)).toBe(3);
  });
});

describe('clampQuantity', () => {
  it('số thập phân bị cắt, NaN về 1', () => {
    expect(clampQuantity(2.9)).toBe(2);
    expect(clampQuantity(Number.NaN)).toBe(1);
  });
});

describe('parseCart (BR-11)', () => {
  it('đọc lại đúng thứ đã ghi', () => {
    const cart = addLine(EMPTY_CART, { ...GUNG, quantity: 2 });
    expect(parseCart(serializeCart(cart))).toEqual(cart);
  });

  it.each([null, '', '{oops', '"chuỗi"', '{"a":1}'])('dữ liệu hỏng %s → giỏ trống', (raw) => {
    expect(parseCart(raw)).toEqual([]);
  });

  it('bỏ riêng từng dòng sai kiểu, giữ dòng đúng', () => {
    const raw = JSON.stringify([
      { ...GUNG, quantity: 2 },
      { ...GUNG, quantity: -1 },
      { ...GUNG, quantity: 1.5 },
      { ...GUNG, quantity: '3' },
      { productSlug: 5, variantId: '40g', quantity: 1 },
      null,
    ]);
    expect(parseCart(raw)).toEqual([{ ...GUNG, quantity: 2 }]);
  });

  it('không mang theo trường lạ như giá (BR-10)', () => {
    const raw = JSON.stringify([{ ...GUNG, quantity: 1, priceVnd: 1 }]);
    expect(parseCart(raw)).toEqual([{ ...GUNG, quantity: 1 }]);
  });
});
