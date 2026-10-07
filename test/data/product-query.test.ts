import { describe, expect, it } from 'vitest';
import { getProductBySlug } from '@/data/catalog';
import { listRelatedProducts, parseProductSort, queryProducts } from '@/data/product-query';

const slugs = (query: Parameters<typeof queryProducts>[0]): string[] =>
  queryProducts(query).map((product) => product.slug);

describe('queryProducts', () => {
  it('không lọc gì thì trả đủ 15 sản phẩm theo thứ tự gốc', () => {
    expect(queryProducts({})).toHaveLength(15);
  });

  it('tìm không phân biệt dấu, hoa thường và khoảng trắng thừa', () => {
    const expected = ['tra-dao-hoa-tan'];
    expect(slugs({ q: 'tra dao' })).toEqual(expected);
    expect(slugs({ q: 'TRÀ ĐÀO' })).toEqual(expected);
    expect(slugs({ q: 'trà  đào' })).toEqual(expected);
  });

  it('từ khóa không khớp thì trả mảng rỗng', () => {
    expect(queryProducts({ q: 'cà phê' })).toEqual([]);
  });

  it('lọc theo danh mục', () => {
    const products = queryProducts({ categorySlug: 'tra-roi' });
    expect(products).toHaveLength(5);
    expect(products.every((product) => product.categorySlug === 'tra-roi')).toBe(true);
  });

  it('sắp xếp theo giá thấp nhất của sản phẩm, tăng và giảm', () => {
    const lowest = (slug: string): number =>
      Math.min(...(getProductBySlug(slug)?.variants ?? []).map((variant) => variant.priceVnd));
    const ascending = slugs({ sort: 'gia-tang' }).map(lowest);
    const descending = slugs({ sort: 'gia-giam' }).map(lowest);

    expect(ascending).toEqual([...ascending].sort((a, b) => a - b));
    expect(descending).toEqual([...descending].sort((a, b) => b - a));
  });

  it('không làm đổi thứ tự dữ liệu gốc sau khi sắp xếp', () => {
    const before = slugs({});
    queryProducts({ sort: 'gia-giam' });
    expect(slugs({})).toEqual(before);
  });
});

describe('parseProductSort', () => {
  it('giá trị lạ rơi về mặc định', () => {
    expect(parseProductSort('gia-tang')).toBe('gia-tang');
    expect(parseProductSort('xyz')).toBe('mac-dinh');
    expect(parseProductSort(undefined)).toBe('mac-dinh');
  });
});

describe('listRelatedProducts', () => {
  it('cùng danh mục, không gồm chính nó, tối đa 4', () => {
    const product = getProductBySlug('tra-gung');
    if (!product) throw new Error('thiếu dữ liệu trà gừng');
    const related = listRelatedProducts(product);

    expect(related).toHaveLength(4);
    expect(related.some((item) => item.slug === 'tra-gung')).toBe(false);
    expect(related.every((item) => item.categorySlug === 'tra-tui-loc')).toBe(true);
  });
});
