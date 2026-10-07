import Link from 'next/link';
import type { Product } from '@/data/types';
import { AddToCartButton } from '@/features/cart/AddToCartButton';
import { ProductImage } from './ProductImage';
import { CategoryChip } from './CategoryChip';
import { cardPriceLabel } from './price';

/** Quy cách ngắn in trên thẻ: một biến thể thì in nhãn của nó, nhiều thì in số lựa chọn. */
function packingLabel(product: Product): string {
  const [first] = product.variants;
  if (!first) return '';
  return product.variants.length === 1 ? first.label : `${product.variants.length} lựa chọn`;
}

/**
 * Thẻ sản phẩm dùng chung cho trang chủ, danh sách, danh mục và khối sản phẩm liên quan (FR-20).
 *
 * Một thẻ phải trả lời trong một cái liếc: hàng gì (ảnh + tên), thuộc nhóm nào (danh mục), quy
 * cách ra sao và bao nhiêu tiền — rồi cho bỏ giỏ ngay.
 */
export function ProductCard({ product }: { product: Product }) {
  const href = `/san-pham/${product.slug}`;

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-card border border-line bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift-lg"
      data-testid="product-card"
    >
      {/* `z-10`: lớp phủ `after:inset-0` của link tiêu đề trùm cả thẻ, link ảnh phải tự nâng
          mình lên, không thì chuột giữa trên ảnh không mở được tab mới */}
      <Link href={href} className="relative z-10 block" tabIndex={-1} aria-hidden="true">
        <ProductImage
          src={product.images[0] ?? null}
          alt={product.name}
          dark={product.imageBackground === 'dark'}
        />
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        <CategoryChip categorySlug={product.categorySlug} />

        {/* Tên giữ nguyên Unicode — để CSS rút gọn, không cắt chuỗi bằng JavaScript */}
        <h3 className="line-clamp-2 text-sm leading-snug font-semibold sm:text-base">
          <Link
            href={href}
            className="transition-colors duration-200 after:absolute after:inset-0 after:content-[''] group-hover:text-accent"
          >
            {product.name}
          </Link>
        </h3>

        <p className="text-xs text-muted">{packingLabel(product)}</p>

        {/* `mt-auto` ghim giá xuống đáy thẻ: tên dài ngắn khác nhau, hàng giá vẫn thẳng hàng */}
        <p className="tabular mt-auto pt-2 font-display text-lg font-bold text-brand-700">
          {cardPriceLabel(product)}
        </p>

        <AddToCartButton product={product} />
      </div>
    </article>
  );
}
