'use client';

import { createContext, useContext, useMemo } from 'react';
import type { Category } from '@/data/types';

/**
 * Danh mục theo slug — để thẻ sản phẩm ở BẤT KỲ đâu (trang chủ, danh sách, sản phẩm liên
 * quan) gắn được nhãn danh mục mà không phải kéo danh sách danh mục xuống từng nơi.
 *
 * `SiteChrome` đưa danh sách vào ngữ cảnh một lần cho cả khung trang.
 */
const CategoryContext = createContext<ReadonlyMap<string, Category>>(new Map());

export function CategoryProvider({
  categories,
  children,
}: {
  categories: readonly Category[];
  children: React.ReactNode;
}) {
  const bySlug = useMemo(
    () => new Map(categories.map((category) => [category.slug, category])),
    [categories],
  );

  return <CategoryContext.Provider value={bySlug}>{children}</CategoryContext.Provider>;
}

export function useCategory(slug: string | null): Category | null {
  const bySlug = useContext(CategoryContext);
  return slug ? (bySlug.get(slug) ?? null) : null;
}
