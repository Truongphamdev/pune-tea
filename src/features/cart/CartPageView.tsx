'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { formatVnd } from '@/lib/format';
import { useCart, useHydrated, cartActions } from './cart-store';
import { buildCartView, type CartView } from './cart-view';
import { CartTable } from './CartTable';
import { OrderForm } from './OrderForm';

/**
 * Nội dung trang giỏ hàng (FR-42, FR-43).
 *
 * Trước khi đọc xong `localStorage` thì vẽ khung chờ chứ không vẽ "giỏ trống": khách có hàng
 * trong giỏ mà thấy chữ "giỏ trống" nháy lên là tưởng mất giỏ.
 */
export function CartPageView({
  facebookUrl,
  customerName = '',
}: {
  facebookUrl: string;
  customerName?: string;
}) {
  const cart = useCart();
  const hydrated = useHydrated();
  const [confirmingClear, setConfirmingClear] = useState(false);

  if (!hydrated) {
    return (
      <p className="py-16 text-center text-sm text-muted" role="status">
        Đang tải giỏ hàng…
      </p>
    );
  }

  const view = buildCartView(cart);

  if (view.rows.length === 0) {
    return (
      <EmptyState
        testId="cart-empty"
        message="Giỏ hàng của bạn đang trống. Chọn vài gói trà rồi quay lại đây nhé."
        actionLabel="Xem sản phẩm"
        actionHref="/san-pham"
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <CartItems view={view} onClear={() => setConfirmingClear(true)} />

      <CartSummary view={view} facebookUrl={facebookUrl} customerName={customerName} />

      <ConfirmDialog
        open={confirmingClear}
        title="Xóa toàn bộ giỏ hàng?"
        description="Mọi món trong giỏ sẽ bị bỏ. Thao tác này không hoàn tác được."
        confirmLabel="Xóa cả giỏ"
        pendingLabel="Đang xóa…"
        saving={false}
        confirmTestId="confirm-clear-cart"
        onCancel={() => setConfirmingClear(false)}
        onConfirm={() => {
          cartActions.clear();
          setConfirmingClear(false);
        }}
      />
    </div>
  );
}

function CartItems({ view, onClear }: { view: CartView; onClear: () => void }) {
  return (
    <section aria-labelledby="cart-items" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 id="cart-items" className="text-lg font-bold">
          {view.itemCount} món trong giỏ
        </h2>
        <button
          type="button"
          onClick={onClear}
          className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
        >
          Xóa cả giỏ
        </button>
      </div>
      <CartTable rows={view.rows} />
    </section>
  );
}

function CartSummary({
  view,
  facebookUrl,
  customerName,
}: {
  view: CartView;
  facebookUrl: string;
  customerName: string;
}) {
  return (
    <aside className="flex h-fit flex-col gap-5 rounded-card border border-line bg-surface p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-bold">Tổng tiền</h2>
        <p
          className="tabular font-display text-2xl font-bold text-brand-700"
          data-testid="cart-total"
        >
          {formatVnd(view.totalVnd)}
        </p>
      </div>
      <OrderForm view={view} facebookUrl={facebookUrl} customerName={customerName} />
    </aside>
  );
}
