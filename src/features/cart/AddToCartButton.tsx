'use client';

import Link from 'next/link';
import type { Product } from '@/data/types';
import { addToCartIfSignedIn } from './add-with-toast';

const BUTTON_CLASS =
  'relative z-10 mt-2 inline-flex w-full items-center justify-center rounded-full bg-gold-400 px-3 py-2 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-gold-300';

/**
 * Nút trên thẻ sản phẩm (FR-20).
 *
 * Một biến thể thì thêm thẳng vào giỏ (phải đăng nhập — chưa thì được đưa sang trang đăng nhập). Nhiều biến thể thì KHÔNG đoán hộ khách — dẫn sang
 * trang chi tiết để chọn loại, vì bỏ nhầm quy cách vào giỏ là sai đơn.
 */
export function AddToCartButton({ product }: { product: Product }) {
  const [only] = product.variants;

  if (!only || product.variants.length > 1) {
    return (
      <Link href={`/san-pham/${product.slug}`} className={BUTTON_CLASS}>
        Chọn loại
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={BUTTON_CLASS}
      onClick={() =>
        void addToCartIfSignedIn(
          { productSlug: product.slug, variantId: only.id, quantity: 1 },
          product.name,
        )
      }
    >
      Thêm vào giỏ
    </button>
  );
}
