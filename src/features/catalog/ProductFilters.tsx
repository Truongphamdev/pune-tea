import Link from 'next/link';
import {
  PRODUCT_SORT_LABELS,
  PRODUCT_SORTS,
  productsHref,
  QUERY_PARAM,
  type ProductQuery,
} from '@/data/product-query';
import type { Category } from '@/data/types';

const PILL = 'rounded-full border px-4 py-1.5 text-sm transition-colors';
const PILL_ON = 'border-brand-700 bg-brand-700 font-semibold text-white';
const PILL_OFF = 'border-line bg-surface hover:border-brand-300';

/**
 * Bộ lọc trang sản phẩm (FR-21): danh mục là các liên kết, tìm + sắp xếp là một form GET.
 *
 * Không cần JavaScript: mọi trạng thái nằm trên URL nên chia sẻ được và nút Quay lại của
 * trình duyệt hoạt động đúng.
 */
export function ProductFilters({
  categories,
  query,
}: {
  categories: readonly Category[];
  query: ProductQuery;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-card border border-line bg-surface p-4">
      <CategoryPills categories={categories} query={query} />
      <SearchSortForm query={query} />
    </div>
  );
}

function CategoryPills({
  categories,
  query,
}: {
  categories: readonly Category[];
  query: ProductQuery;
}) {
  return (
    <nav aria-label="Lọc theo danh mục" className="flex flex-wrap gap-2">
      <Link
        href={productsHref({ ...query, categorySlug: '' })}
        aria-current={query.categorySlug ? undefined : 'true'}
        className={`${PILL} ${query.categorySlug ? PILL_OFF : PILL_ON}`}
      >
        Tất cả
      </Link>
      {categories.map((category) => {
        const active = category.slug === query.categorySlug;
        return (
          <Link
            key={category.slug}
            href={productsHref({ ...query, categorySlug: category.slug })}
            aria-current={active ? 'true' : undefined}
            className={`${PILL} ${active ? PILL_ON : PILL_OFF}`}
          >
            {category.name}
          </Link>
        );
      })}
    </nav>
  );
}

function SearchSortForm({ query }: { query: ProductQuery }) {
  return (
    <form action="/san-pham" method="get" role="search" className="flex flex-wrap items-end gap-3">
      {query.categorySlug ? (
        <input type="hidden" name={QUERY_PARAM.category} value={query.categorySlug} />
      ) : null}
      <div className="flex min-w-48 flex-1 flex-col gap-1">
        <label htmlFor="filter-q" className="text-xs font-semibold text-muted">
          Tìm theo tên
        </label>
        <input
          id="filter-q"
          name={QUERY_PARAM.q}
          type="search"
          defaultValue={query.q ?? ''}
          placeholder="Ví dụ: trà đào"
          className="rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="filter-sort" className="text-xs font-semibold text-muted">
          Sắp xếp
        </label>
        <select
          id="filter-sort"
          name={QUERY_PARAM.sort}
          defaultValue={query.sort ?? 'mac-dinh'}
          className="rounded-md border border-line bg-surface px-3 py-2 text-sm"
        >
          {PRODUCT_SORTS.map((sort) => (
            <option key={sort} value={sort}>
              {PRODUCT_SORT_LABELS[sort]}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="rounded-full bg-brand-700 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600"
      >
        Áp dụng
      </button>
    </form>
  );
}
