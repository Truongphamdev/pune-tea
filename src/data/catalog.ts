import { CATEGORIES } from './categories';
import { PRODUCTS } from './products';
import type { Category, Product } from './types';

/**
 * Lớp đọc dữ liệu danh mục & sản phẩm (BA §4) — chỗ DUY NHẤT trang được lấy dữ liệu.
 *
 * Mọi hàm trả mảng MỚI: nơi gọi có lỡ sắp xếp hay cắt mảng nhận được thì dữ liệu gốc vẫn
 * nguyên cho lần gọi sau.
 */

export function listCategories(): Category[] {
  return [...CATEGORIES];
}

export function getCategoryBySlug(slug: string): Category | null {
  return CATEGORIES.find((category) => category.slug === slug) ?? null;
}

export function listProducts(): Product[] {
  return [...PRODUCTS];
}

export function getProductBySlug(slug: string): Product | null {
  return PRODUCTS.find((product) => product.slug === slug) ?? null;
}

export function listProductsByCategory(categorySlug: string): Product[] {
  return PRODUCTS.filter((product) => product.categorySlug === categorySlug);
}

export function listFeaturedProducts(): Product[] {
  return PRODUCTS.filter((product) => product.featured === true);
}
