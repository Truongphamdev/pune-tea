import Link from 'next/link';
import { CartIcon } from './UiIcons';

/**
 * Biểu tượng giỏ hàng trên thanh đầu trang (FR-01).
 *
 * `count` là số món trong giỏ, `null` khi CHƯA BIẾT. Máy chủ không đọc được `localStorage`,
 * nên lần dựng đầu luôn là `null` và không vẽ ô đếm — số chỉ hiện sau khi trình duyệt đọc xong
 * giỏ (BR-12). Như vậy HTML của máy chủ và lần hydrate đầu luôn giống hệt nhau.
 */
export function CartLink({ count }: { count: number | null }) {
  const label = count ? `Giỏ hàng, ${count} món` : 'Giỏ hàng';

  return (
    <Link
      href="/gio-hang"
      aria-label={label}
      className="relative grid size-10 place-items-center rounded-full text-white transition-colors duration-200 hover:bg-white/10"
    >
      <CartIcon className="size-6" />
      {count ? (
        <span
          aria-hidden="true"
          data-testid="header-cart-count"
          className="tabular absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-gold-400 px-1 text-[11px] font-bold text-ink"
        >
          {count}
        </span>
      ) : null}
    </Link>
  );
}
