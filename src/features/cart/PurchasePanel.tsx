'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Product, ProductVariant } from '@/data/types';
import { formatVnd } from '@/lib/format';
import { addToCartIfSignedIn } from './add-with-toast';
import { QuantityStepper } from './QuantityStepper';

/**
 * Khối mua hàng ở trang chi tiết (FR-31, FR-32): chọn biến thể, số lượng, thêm vào giỏ.
 *
 * Giá hiển thị đổi theo biến thể đang chọn; mặc định là biến thể đầu. Sản phẩm một biến thể
 * thì không vẽ bộ chọn — một lựa chọn duy nhất không phải là lựa chọn.
 */
export function PurchasePanel({ product }: { product: Product }) {
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? '');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const variant = product.variants.find((item) => item.id === variantId) ?? product.variants[0];

  if (!variant) return null;

  const onAdd = async (): Promise<void> => {
    const outcome = await addToCartIfSignedIn(
      { productSlug: product.slug, variantId: variant.id, quantity },
      product.name,
    );
    // Chạm giới hạn thì vẫn chỉ đường sang giỏ: đó là nơi khách bớt món
    if (outcome !== 'login-required') setAdded(true);
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="tabular font-display text-3xl font-bold text-brand-700" data-testid="price">
        {formatVnd(variant.priceVnd)}
      </p>

      {product.variants.length > 1 ? (
        <VariantPicker variants={product.variants} selected={variant.id} onSelect={setVariantId} />
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper value={quantity} onChange={setQuantity} label={product.name} />
        <button
          type="button"
          onClick={() => void onAdd()}
          className="rounded-full bg-gold-400 px-6 py-2.5 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-gold-300"
        >
          Thêm vào giỏ hàng
        </button>
      </div>

      {added ? (
        <Link
          href="/gio-hang"
          className="w-fit rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100"
        >
          Xem giỏ hàng →
        </Link>
      ) : null}
    </div>
  );
}

function VariantPicker({
  variants,
  selected,
  onSelect,
}: {
  variants: readonly ProductVariant[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-semibold">Chọn loại</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {variants.map((variant) => (
          <label
            key={variant.id}
            className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-700 ${
              variant.id === selected
                ? 'border-brand-700 bg-brand-700 font-semibold text-white'
                : 'border-line bg-surface hover:border-brand-300'
            }`}
          >
            <input
              type="radio"
              name="variant"
              value={variant.id}
              checked={variant.id === selected}
              onChange={() => onSelect(variant.id)}
              className="sr-only"
            />
            {variant.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
