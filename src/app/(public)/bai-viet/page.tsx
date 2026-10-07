import { PageHeader } from '@/components/PageHeader';
import { SITE_NAME } from '@/config/site';
import { listAllArticles } from '@/features/articles/all-articles';
import { ArticleGrid } from '@/features/articles/ArticleCard';
import { Breadcrumbs } from '@/features/catalog/Breadcrumbs';
import { pageMetadata } from '@/features/seo/metadata';

export const metadata = pageMetadata({
  title: 'Bài viết về trà',
  description: `Công thức pha trà, cách ủ trà lạnh cold brew và kinh nghiệm chọn trà túi lọc, trà rời, trà hòa tan — tổng hợp các bài viết từ ${SITE_NAME}.`,
  path: '/bai-viet',
});

/** Danh sách bài viết (FR-60), mới nhất trước. */
/**
 * Dựng tĩnh, làm mới tối đa 5 phút một lần. Đăng/sửa/xóa bài ở trang quản trị còn gọi
 * `revalidatePath` nên bài mới hiện ngay, không phải chờ.
 */
export const revalidate = 300;

export default async function ArticlesPage() {
  const articles = await listAllArticles();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <PageHeader
        title="Tin tức & bài viết"
        lead="Công thức pha chế, cách ủ trà và kinh nghiệm chọn trà cho từng nhu cầu."
      >
        <Breadcrumbs items={[{ href: '/', label: 'Trang chủ' }, { label: 'Bài viết' }]} />
      </PageHeader>
      <section aria-labelledby="all-articles" className="flex flex-col gap-6">
        <h2 id="all-articles" className="text-2xl font-bold">
          Tất cả bài viết
        </h2>
        <ArticleGrid articles={articles} />
      </section>
    </main>
  );
}
