'use client';

import { useEffect, useState } from 'react';
import { ArrowUpIcon } from './UiIcons';

/** Cuộn quá chừng này (px) mới hiện nút — ở đầu trang thì nút vô nghĩa và chỉ che nội dung. */
const SHOW_AFTER_PX = 400;

/**
 * Nút "Lên đầu trang" (FR-04).
 *
 * Lần dựng đầu (máy chủ và hydrate) luôn ẩn; chỉ hiện sau khi trình duyệt đọc vị trí cuộn —
 * không có cảnh HTML máy chủ lệch với lần hydrate. Người đã tắt hiệu ứng chuyển động thì
 * nhảy thẳng lên đầu thay vì cuộn mượt.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = (): void => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  const toTop = (): void => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Lên đầu trang"
      className="grid size-11 place-items-center rounded-full border border-line bg-surface text-brand-700 shadow-lift-lg transition-transform duration-200 hover:-translate-y-0.5"
    >
      <ArrowUpIcon className="size-5" />
    </button>
  );
}
