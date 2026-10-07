import { describe, expect, it } from 'vitest';
import { countWords, foldVietnamese } from '@/lib/text';

describe('foldVietnamese', () => {
  it('bỏ dấu, đổi đ và hạ chữ thường', () => {
    expect(foldVietnamese('Trà Đào Hòa Tan')).toBe('tra dao hoa tan');
  });

  it('gộp khoảng trắng thừa và cắt hai đầu', () => {
    expect(foldVietnamese('  trà   đào ')).toBe('tra dao');
  });
});

describe('countWords', () => {
  it('đếm theo khoảng trắng, chuỗi rỗng là 0', () => {
    expect(countWords('trà  túi lọc')).toBe(3);
    expect(countWords('   ')).toBe(0);
  });
});
