import { PageHeader } from '@/components/PageHeader';
import { SITE_NAME } from '@/config/site';
import { EmptyState } from '@/components/EmptyState';
import { getCategoryBySlug, listCategories } from '@/data/catalog';
import { parseProductSort, QUERY_PARAM, queryProducts } from '@/data/product-query';
import { Breadcrumbs } from '@/features/catalog/Breadcrumbs';
import { ProductFilters } from '@/features/catalog/ProductFilters';
import { ProductGrid } from '@/features/catalog/ProductGrid';
import { pageMetadata } from '@/features/seo/metadata';

export const metadata = pageMetadata({
  title: 'Tất cả sản phẩm',
  description: `Toàn bộ các gói trà ${SITE_NAME}: trà túi lọc, trà rời và trà hòa tan. Lọc theo danh mục, sắp xếp theo giá và tìm theo tên để chọn gói trà phù hợp.`,
  path: '/san-pham',
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Tham số lặp (`?q=a&q=b`) thì lấy giá trị đầu. */
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Trang tất cả sản phẩm (FR-21, FR-22). */
export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = first(params[QUERY_PARAM.q])?.trim() ?? '';
  // Danh mục lạ trên URL coi như không lọc — không trả trang rỗng vì một tham số gõ sai
  const category = getCategoryBySlug(first(params[QUERY_PARAM.category]) ?? '');
  const query = {
    q,
    categorySlug: category?.slug ?? '',
    sort: parseProductSort(first(params[QUERY_PARAM.sort])),
  };
  const products = queryProducts(query);
  const filtered = q !== '' || category !== null;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <PageHeader
        title={q ? `Kết quả cho “${q}”` : (category?.name ?? 'Tất cả sản phẩm')}
        lead="Chọn danh mục, sắp xếp theo giá hoặc tìm theo tên — gõ không dấu cũng được."
      >
        <Breadcrumbs items={[{ href: '/', label: 'Trang chủ' }, { label: 'Sản phẩm' }]} />
      </PageHeader>

      <ProductFilters categories={listCategories()} query={query} />

      {/* H2 để thẻ sản phẩm (H3) không nhảy cấp ngay dưới H1 (SEO-06) */}
      {/* `role="status"` đặt ở khung bọc: gắn thẳng lên h2 sẽ làm nó mất vai trò tiêu đề */}
      <div role="status">
        <h2 className="text-lg font-bold" data-testid="result-count">
          {products.length} sản phẩm
        </h2>
      </div>

      {products.length > 0 ? (
        <ProductGrid products={products} emptyMessage="" />
      ) : (
        <EmptyState
          testId="products-empty"
          message={
            filtered ? 'Không tìm thấy sản phẩm nào khớp bộ lọc hiện tại.' : 'Chưa có sản phẩm nào.'
          }
          actionLabel="Xóa bộ lọc"
          actionHref="/san-pham"
        />
      )}
    </main>
  );
}
