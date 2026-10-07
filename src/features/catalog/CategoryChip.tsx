'use client';

import Link from 'next/link';
import { useCategory } from './category-context';

/** Nhãn danh mục nhỏ trên thẻ sản phẩm — bấm được, dẫn tới trang danh mục. */
export function CategoryChip({ categorySlug }: { categorySlug: string | null }) {
  const category = useCategory(categorySlug);
  if (!category) return null;

  return (
    <Link
      href={`/danh-muc/${category.slug}`}
      className="relative z-10 inline-flex w-fit rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold tracking-[0.06em] text-brand-700 uppercase transition-colors duration-200 hover:bg-brand-100"
    >
      {category.name}
    </Link>
  );
}
