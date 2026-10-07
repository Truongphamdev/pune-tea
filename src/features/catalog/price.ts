import type { Product } from '@/data/types';
import { formatVnd } from '@/lib/format';

/** Giá thấp nhất trong các biến thể; `null` khi sản phẩm không có biến thể nào (dữ liệu hỏng). */
export function lowestPriceVnd(product: Pick<Product, 'variants'>): number | null {
  if (product.variants.length === 0) return null;
  return Math.min(...product.variants.map((variant) => variant.priceVnd));
}

/**
 * Giá in trên thẻ sản phẩm (BA §5.1): một biến thể → giá đó; nhiều biến thể → "Từ {giá thấp
 * nhất}" để khách không tưởng giá rẻ nhất là giá mọi quy cách.
 */
export function cardPriceLabel(product: Pick<Product, 'variants'>): string {
  const lowest = lowestPriceVnd(product);
  if (lowest === null) return 'Liên hệ';

  const price = formatVnd(lowest);
  return product.variants.length > 1 ? `Từ ${price}` : price;
}
