import { describe, expect, it } from 'vitest';
import {
  getCategoryBySlug,
  getProductBySlug,
  listCategories,
  listFeaturedProducts,
  listProducts,
  listProductsByCategory,
} from '@/data/catalog';

describe('lớp đọc dữ liệu', () => {
  it('tìm danh mục / sản phẩm theo slug, slug lạ trả null', () => {
    expect(getCategoryBySlug('tra-roi')?.name).toBe('Trà rời');
    expect(getCategoryBySlug('khong-co')).toBeNull();
    expect(getProductBySlug('tra-gung')?.name).toBe('Trà Gừng');
    expect(getProductBySlug('khong-co')).toBeNull();
  });

  it('lọc theo danh mục giữ thứ tự gốc', () => {
    expect(listProductsByCategory('tra-hoa-tan').map((p) => p.slug)).toEqual([
      'tra-dao-hoa-tan',
      'tra-sam-bi-dao-hoa-tan',
      'tra-hoa-tan-vi-hoa-qua',
    ]);
    expect(listProductsByCategory('khong-co')).toEqual([]);
  });

  it('sản phẩm nổi bật chỉ gồm sản phẩm featured', () => {
    expect(listFeaturedProducts().every((p) => p.featured === true)).toBe(true);
    expect(listFeaturedProducts()).toHaveLength(6);
  });

  it('trả mảng mới mỗi lần — trang sửa mảng nhận được không làm hỏng dữ liệu gốc', () => {
    const first = listProducts() as unknown[];
    first.length = 0;
    expect(listProducts()).toHaveLength(15);
    expect(listCategories()).not.toBe(listCategories());
  });
});
