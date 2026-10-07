import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { listArticles } from '@/data/articles';
import { AdminArticleList } from '@/features/articles/AdminArticleList';
import { requireAdminPage } from '@/features/articles/editor-page';
import { ADMIN_ARTICLES_PATH } from '@/features/articles/editor-state';
import { Breadcrumbs } from '@/features/catalog/Breadcrumbs';
import { pageMetadata } from '@/features/seo/metadata';
import { listStoredArticles } from '@/server/articles-store';

export const metadata = pageMetadata({
  title: 'Quản trị bài viết',
  description: 'Danh sách bài viết đã soạn: viết bài mới, sửa, xóa và xem điểm chuẩn SEO.',
  path: ADMIN_ARTICLES_PATH,
  noindex: true,
});

export default async function AdminArticlesPage() {
  await requireAdminPage(ADMIN_ARTICLES_PATH);
  const stored = await listStoredArticles();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10">
      <PageHeader
        title="Quản trị bài viết"
        lead="Viết, sửa và đăng bài viết chuẩn SEO cho website."
      >
        <Breadcrumbs items={[{ href: '/', label: 'Trang chủ' }, { label: 'Quản trị bài viết' }]} />
      </PageHeader>
      <Link
        href={`${ADMIN_ARTICLES_PATH}/moi`}
        className="w-fit rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold-300"
      >
        + Viết bài mới
      </Link>
      <AdminArticleList stored={stored} builtIn={listArticles()} />
    </main>
  );
}
