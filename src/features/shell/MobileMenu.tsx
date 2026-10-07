'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import type { NavLink } from '@/config/site';
import type { NavGroup } from './SiteNav';
import { HeaderSearch } from './HeaderSearch';
import { CloseIcon, MenuIcon } from './UiIcons';

/**
 * Menu thu gọn cho màn hình hẹp (FR-02): nút hamburger mở/đóng một ngăn dưới thanh đầu trang.
 *
 * - Là `<button>` thật nên chạm, Enter, Space đều mở được; `aria-expanded` báo trạng thái.
 * - Chọn một mục thì đóng ngăn — điều hướng xong mà ngăn còn che trang là lỗi hay gặp nhất.
 * - Esc đóng và TRẢ tiêu điểm về nút, để người dùng bàn phím không bị ném về đầu trang.
 */
export function MobileMenu({ links, group }: { links: readonly NavLink[]; group: NavGroup }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  useEscapeToClose(open, () => {
    setOpen(false);
    buttonRef.current?.focus();
  });

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? 'Đóng menu' : 'Mở menu'}
        onClick={() => setOpen((value) => !value)}
        className="grid size-10 place-items-center rounded-full text-white transition-colors duration-200 hover:bg-white/10"
      >
        {open ? <CloseIcon className="size-6" /> : <MenuIcon className="size-6" />}
      </button>
      {open ? (
        <MobilePanel id={panelId} links={links} group={group} onNavigate={() => setOpen(false)} />
      ) : null}
    </div>
  );
}

function useEscapeToClose(open: boolean, close: () => void): void {
  const closeRef = useRef(close);
  closeRef.current = close;

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') closeRef.current();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
}

const ITEM_CLASS =
  'block rounded-lg px-3 py-2.5 text-base font-semibold text-ink transition-colors duration-200 hover:bg-accent-soft hover:text-accent';

function MobilePanel({
  id,
  links,
  group,
  onNavigate,
}: {
  id: string;
  links: readonly NavLink[];
  group: NavGroup;
  onNavigate: () => void;
}) {
  return (
    <nav
      id={id}
      aria-label="Menu di động"
      className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-white/10 bg-surface px-4 pt-4 pb-6 shadow-lift-lg"
    >
      <div className="rounded-full bg-brand-700 p-1">
        <HeaderSearch id="mobile-search" />
      </div>
      <ul className="mt-3 flex flex-col gap-1">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} onClick={onNavigate} className={ITEM_CLASS}>
              {link.label}
            </Link>
            {link.href === group.parentHref ? (
              <ul className="ms-4 border-s border-line ps-2">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-accent-soft hover:text-accent"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </nav>
  );
}
