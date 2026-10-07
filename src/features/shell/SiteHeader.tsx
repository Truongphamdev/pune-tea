import Link from 'next/link';
import { SITE_NAME, type NavLink } from '@/config/site';
import { BrandLockup } from './BrandMark';
import { HeaderAccount } from '@/features/auth/HeaderAccount';
import { HeaderCart } from '@/features/cart/HeaderCart';
import { HeaderSearch } from './HeaderSearch';
import { MobileMenu } from './MobileMenu';
import { SiteNav, type NavGroup } from './SiteNav';

/**
 * Thanh đầu trang (FR-01, FR-02): wordmark trái, menu ngang, ô tìm kiếm, giỏ hàng.
 *
 * Dưới `lg` menu thu vào nút hamburger; dưới `md` ô tìm kiếm cũng chuyển vào ngăn menu.
 * Nền xanh brand-700, chữ trắng (7.90:1).
 */
export function SiteHeader({ links, group }: { links: readonly NavLink[]; group: NavGroup }) {
  return (
    <header className="sticky top-0 z-50 bg-brand-700 text-white shadow-lift">
      <div className="relative mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3">
        <Link
          href="/"
          aria-label={`${SITE_NAME} — Trang chủ`}
          className="shrink-0 rounded-lg transition-opacity duration-200 hover:opacity-90"
        >
          <BrandLockup />
        </Link>
        <div className="ms-4 hidden flex-1 lg:block">
          <SiteNav links={links} group={group} />
        </div>
        <div className="ms-auto flex items-center gap-1 lg:ms-0">
          <HeaderSearch id="header-search" className="me-2 hidden w-56 md:block" />
          <HeaderAccount />
          <HeaderCart />
          <MobileMenu links={links} group={group} />
        </div>
      </div>
    </header>
  );
}
