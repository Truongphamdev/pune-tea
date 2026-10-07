import Link from 'next/link';
import { formatVnd } from '@/lib/format';
import type { SavedOrder } from '@/server/orders';

/** SQLite lưu giờ UTC dạng `YYYY-MM-DD HH:MM:SS` — đổi sang giờ Việt Nam để hiển thị. */
function formatOrderTime(createdAt: string): string {
  return new Date(`${createdAt.replace(' ', 'T')}Z`).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

/** Lịch sử đơn của tài khoản, mới nhất trước. Chưa có đơn thì mời đi mua, không để trang trống. */
export function OrderHistory({ orders }: { orders: readonly SavedOrder[] }) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-card border border-dashed border-line p-6">
        <p className="text-sm text-muted">
          Bạn chưa có đơn nào. Đơn đặt khi đang đăng nhập sẽ hiện ở đây.
        </p>
        <Link
          href="/san-pham"
          className="rounded-full bg-gold-400 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-gold-300"
        >
          Xem sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {orders.map((order) => (
        <li key={order.reference} data-testid="order-card">
          <OrderCard order={order} />
        </li>
      ))}
    </ul>
  );
}

function OrderCard({ order }: { order: SavedOrder }) {
  return (
    <article className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="tabular font-sans text-base font-bold">{order.reference}</h3>
        <p className="text-sm text-muted">{formatOrderTime(order.createdAt)}</p>
      </header>

      <ul className="flex flex-col gap-1.5 text-sm">
        {order.items.map((item) => (
          <li
            key={`${item.productSlug}:${item.variantLabel}`}
            className="flex justify-between gap-3"
          >
            <span>
              {item.productName} — {item.variantLabel} × {item.quantity}
            </span>
            <span className="tabular shrink-0">{formatVnd(item.lineTotalVnd)}</span>
          </li>
        ))}
      </ul>

      <footer className="flex flex-wrap items-end justify-between gap-3 border-t border-line pt-3">
        <p className="text-xs leading-relaxed text-muted">
          {order.customerName} · {order.phone}
          <br />
          {order.address}
          {order.note ? ` · Ghi chú: ${order.note}` : ''}
        </p>
        <p className="tabular font-display text-lg font-bold text-brand-700">
          {formatVnd(order.totalVnd)}
        </p>
      </footer>
    </article>
  );
}
