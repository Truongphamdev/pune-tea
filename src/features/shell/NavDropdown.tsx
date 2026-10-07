'use client';

import Link from 'next/link';
import { useRef, useState, type FocusEvent, type KeyboardEvent, type RefObject } from 'react';
import type { NavLink } from '@/config/site';
import { ChevronDownIcon } from './UiIcons';

/**
 * Mục menu có danh sách con ("Sản phẩm" → 3 danh mục, FR-01).
 *
 * Danh sách mở bằng CSS khi rê chuột HOẶC khi tiêu điểm nằm trong mục (`focus-within`), nên
 * Tab tới "Sản phẩm" là thấy danh sách, Tab tiếp là vào từng danh mục. Phần JavaScript duy nhất
 * là Esc (WCAG 1.4.13 — nội dung hiện theo tiêu điểm phải tắt được): Esc ẩn danh sách và đưa
 * tiêu điểm về "Sản phẩm"; danh sách mở lại khi tiêu điểm rời khỏi mục hoặc chuột rê vào lại.
 *
 * Lần dựng đầu `dismissed = false` ở cả máy chủ lẫn trình duyệt — không lệch khi hydrate.
 */
export function NavDropdown({
  link,
  items,
  linkClassName,
}: {
  link: NavLink;
  items: readonly NavLink[];
  linkClassName: string;
}) {
  const parentRef = useRef<HTMLAnchorElement>(null);
  const { dismissed, handlers } = useEscapeDismiss(parentRef);
  const open = dismissed
    ? 'invisible opacity-0'
    : 'invisible opacity-0 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100';

  return (
    <li className="group relative" {...handlers}>
      <Link ref={parentRef} href={link.href} className={linkClassName}>
        {link.label}
        <ChevronDownIcon className="size-4 transition-transform duration-200 group-focus-within:rotate-180 group-hover:rotate-180" />
      </Link>
      {/* `pt-2` thay cho `mt-2`: khoảng hở giữa link và danh sách vẫn thuộc vùng rê chuột */}
      <div
        data-testid="nav-dropdown"
        data-dismissed={dismissed}
        className={`absolute top-full left-0 z-50 pt-2 transition-opacity duration-150 ${open}`}
      >
        <DropdownList items={items} />
      </div>
    </li>
  );
}

/** Esc ẩn danh sách và trả tiêu điểm về link cha; rời mục (tiêu điểm hoặc chuột) thì bỏ ẩn. */
function useEscapeDismiss(parentRef: RefObject<HTMLAnchorElement | null>) {
  const [dismissed, setDismissed] = useState(false);

  const handlers = {
    onKeyDown: (event: KeyboardEvent<HTMLLIElement>): void => {
      if (event.key !== 'Escape') return;
      setDismissed(true);
      parentRef.current?.focus();
    },
    onBlur: (event: FocusEvent<HTMLLIElement>): void => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDismissed(false);
    },
    onMouseLeave: (): void => setDismissed(false),
  };

  return { dismissed, handlers };
}

function DropdownList({ items }: { items: readonly NavLink[] }) {
  return (
    <ul className="min-w-52 rounded-card border border-line bg-surface p-2 shadow-lift-lg">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-ink transition-colors duration-200 hover:bg-accent-soft hover:text-accent"
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
