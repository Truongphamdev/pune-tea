'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatVnd } from '@/lib/format';
import { cartActions } from './cart-store';
import type { CartRow } from './cart-view';
import { QuantityStepper } from './QuantityStepper';

/** Danh sách món trong giỏ (FR-42): ảnh, tên, biến thể, đơn giá, số lượng, thành tiền, nút xóa. */
export function CartTable({ rows }: { rows: readonly CartRow[] }) {
  return (
    <ul className="flex flex-col divide-y divide-line rounded-card border border-line bg-surface">
      {rows.map((row) => (
        <li key={`${row.product.slug}:${row.variant.id}`} data-testid="cart-row">
          <div className="flex gap-3 p-3 sm:gap-4 sm:p-4">
            <RowImage row={row} />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <RowHeading row={row} />
              <RowControls row={row} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function RowImage({ row }: { row: CartRow }) {
  const dark = row.product.imageBackground === 'dark';

  return (
    <div
      className={`relative size-20 shrink-0 overflow-hidden rounded-lg sm:size-24 ${dark ? 'bg-black' : 'bg-white'}`}
    >
      <Image
        src={row.product.images[0] ?? ''}
        alt={row.product.name}
        fill
        sizes="96px"
        className="object-contain"
      />
    </div>
  );
}

function RowHeading({ row }: { row: CartRow }) {
  const { product, variant } = row;

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <Link
          href={`/san-pham/${product.slug}`}
          className="text-sm font-semibold hover:text-accent sm:text-base"
        >
          {product.name}
        </Link>
        <p className="text-xs text-muted">{variant.label}</p>
        <p className="tabular mt-1 text-xs text-muted">Đơn giá: {formatVnd(row.unitPriceVnd)}</p>
      </div>
      <button
        type="button"
        onClick={() => cartActions.remove(product.slug, variant.id)}
        aria-label={`Xóa ${product.name} — ${variant.label} khỏi giỏ`}
        className="shrink-0 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
      >
        Xóa
      </button>
    </div>
  );
}

function RowControls({ row }: { row: CartRow }) {
  const { product, variant, line } = row;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <QuantityStepper
        value={line.quantity}
        label={product.name}
        onChange={(quantity) => cartActions.setQuantity(product.slug, variant.id, quantity)}
      />
      <p className="tabular font-display text-base font-bold" data-testid="line-total">
        {formatVnd(row.lineTotalVnd)}
      </p>
    </div>
  );
}
