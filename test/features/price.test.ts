import { describe, expect, it } from 'vitest';
import { cardPriceLabel, lowestPriceVnd } from '@/features/catalog/price';
import { MULTI_VARIANT, SINGLE_VARIANT } from '../fixtures/catalog';

describe('giá trên thẻ sản phẩm (BA §5.1)', () => {
  it('một biến thể: in đúng giá đó', () => {
    expect(cardPriceLabel(SINGLE_VARIANT)).toBe('39.000 ₫');
  });

  it('nhiều biến thể: "Từ" + giá THẤP NHẤT, dù biến thể rẻ không đứng đầu', () => {
    expect(lowestPriceVnd(MULTI_VARIANT)).toBe(45_000);
    expect(cardPriceLabel(MULTI_VARIANT)).toBe('Từ 45.000 ₫');
  });

  it('không có biến thể (dữ liệu hỏng): không bịa giá', () => {
    expect(lowestPriceVnd({ variants: [] })).toBeNull();
    expect(cardPriceLabel({ variants: [] })).toBe('Liên hệ');
  });
});
