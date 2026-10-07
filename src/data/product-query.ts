import { foldVietnamese } from '@/lib/text';
import { PRODUCTS } from './products';
import type { Product } from './types';

/** Các kiểu sắp xếp của trang sản phẩm (FR-21). */
export const PRODUCT_SORTS = ['mac-dinh', 'gia-tang', 'gia-giam'] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export const PRODUCT_SORT_LABELS: Readonly<Record<ProductSort, string>> = {
  'mac-dinh': 'Mặc định',
  'gia-tang': 'Giá tăng dần',
  'gia-giam': 'Giá giảm dần',
};

export interface ProductQuery {
  readonly q?: string;
  readonly categorySlug?: string;
  readonly sort?: ProductSort;
}

/** Số sản phẩm cùng danh mục hiện ở trang chi tiết (FR-34). */
export const RELATED_LIMIT = 4;

export function parseProductSort(value: string | undefined): ProductSort {
  return PRODUCT_SORTS.find((sort) => sort === value) ?? 'mac-dinh';
}

function lowestPrice(product: Product): number {
  return Math.min(...product.variants.map((variant) => variant.priceVnd));
}

function sortProducts(products: readonly Product[], sort: ProductSort): Product[] {
  if (sort === 'mac-dinh') return [...products];
  const direction = sort === 'gia-tang' ? 1 : -1;
  return [...products].sort((a, b) => (lowestPrice(a) - lowestPrice(b)) * direction);
}

/**
 * Lọc + tìm + sắp xếp sản phẩm (FR-21).
 *
 * Tìm theo TÊN, không phân biệt dấu và hoa thường: "tra dao" khớp "Trà Đào".
 */
export function queryProducts(query: ProductQuery): Product[] {
  const needle = foldVietnamese(query.q ?? '');
  const matched = PRODUCTS.filter(
    (product) =>
      (!query.categorySlug || product.categorySlug === query.categorySlug) &&
      (needle === '' || foldVietnamese(product.name).includes(needle)),
  );
  return sortProducts(matched, query.sort ?? 'mac-dinh');
}

/** Sản phẩm cùng danh mục, không gồm chính nó (FR-34). */
export function listRelatedProducts(product: Product, limit: number = RELATED_LIMIT): Product[] {
  return PRODUCTS.filter(
    (other) => other.categorySlug === product.categorySlug && other.slug !== product.slug,
  ).slice(0, limit);
}

/** Tên tham số trên URL của trang sản phẩm — trạng thái lọc nằm trên URL để chia sẻ được. */
export const QUERY_PARAM = { q: 'q', category: 'danh-muc', sort: 'sort' } as const;

/** Dựng URL `/san-pham` cho một trạng thái lọc; bỏ tham số rỗng và giá trị mặc định cho gọn. */
export function productsHref(query: ProductQuery): string {
  const params = new URLSearchParams();
  const q = query.q?.trim();
  if (q) params.set(QUERY_PARAM.q, q);
  if (query.categorySlug) params.set(QUERY_PARAM.category, query.categorySlug);
  if (query.sort && query.sort !== 'mac-dinh') params.set(QUERY_PARAM.sort, query.sort);

  const search = params.toString();
  return search ? `/san-pham?${search}` : '/san-pham';
}
