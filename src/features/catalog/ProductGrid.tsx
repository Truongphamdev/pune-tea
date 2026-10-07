import type { Product } from '@/data/types';
import { ProductCard } from './ProductCard';

/** Lưới sản phẩm dùng chung: 2 / 3 / 4 cột theo bề rộng màn hình (BA §9). */
export function ProductGrid({
  products,
  emptyMessage,
}: {
  products: readonly Product[];
  emptyMessage: string;
}) {
  if (products.length === 0) {
    return emptyMessage ? <p className="text-sm text-muted">{emptyMessage}</p> : null;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
