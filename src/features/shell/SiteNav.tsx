import Link from 'next/link';
import type { NavLink } from '@/config/site';
import { NavDropdown } from './NavDropdown';

/** Mục menu mang danh sách con (danh mục) — FR-01: "Sản phẩm" xổ ra 3 danh mục. */
export interface NavGroup {
  readonly parentHref: string;
  readonly items: readonly NavLink[];
}

const LINK_CLASS =
  'flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap text-white transition-colors duration-200 hover:bg-white/10';

/**
 * Menu ngang trên màn hình rộng (`SiteHeader` chỉ hiện nó từ `lg`). Màn hình hẹp dùng
 * `MobileMenu`. Mục có danh sách con do `NavDropdown` vẽ.
 */
export function SiteNav({ links, group }: { links: readonly NavLink[]; group: NavGroup }) {
  return (
    <nav aria-label="Điều hướng chính">
      <ul className="flex items-center gap-1">
        {links.map((link) =>
          link.href === group.parentHref ? (
            <NavDropdown
              key={link.href}
              link={link}
              items={group.items}
              linkClassName={LINK_CLASS}
            />
          ) : (
            <li key={link.href}>
              <Link href={link.href} className={LINK_CLASS}>
                {link.label}
              </Link>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}
