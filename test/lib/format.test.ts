import { describe, expect, it } from 'vitest';
import { formatDate, formatVnd } from '@/lib/format';

describe('formatVnd', () => {
  it('định dạng số nguyên VND theo kiểu Việt Nam, kèm ký hiệu ₫', () => {
    expect(formatVnd(89_000)).toBe('89.000 ₫');
    expect(formatVnd(1_250_000)).toBe('1.250.000 ₫');
  });

  it('giữ số 0 thay vì chuỗi rỗng', () => {
    expect(formatVnd(0)).toBe('0 ₫');
  });

  it('giá trị không hữu hạn hiện gạch ngang thay vì "NaN ₫"', () => {
    expect(formatVnd(Number.NaN)).toBe('— ₫');
  });
});

describe('formatDate', () => {
  it('định dạng ngày ISO thành dd/mm/yyyy', () => {
    expect(formatDate('2026-10-06')).toBe('06/10/2026');
  });

  it('trả gạch ngang khi không có ngày', () => {
    expect(formatDate(null)).toBe('—');
  });
});
