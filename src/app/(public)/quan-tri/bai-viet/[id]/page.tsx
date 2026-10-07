import { notFound } from 'next/navigation';
import { EditorPage, requireAdminPage } from '@/features/articles/editor-page';
import { ADMIN_ARTICLES_PATH } from '@/features/articles/editor-state';
import { pageMetadata } from '@/features/seo/metadata';
import { findStoredArticleById } from '@/server/articles-store';

type Params = Promise<{ id: string }>;

export const metadata = pageMetadata({
  title: 'Sửa bài viết',
  description: 'Sửa bài viết đã soạn, kèm bảng chấm chuẩn SEO trực tiếp.',
  path: ADMIN_ARTICLES_PATH,
  noindex: true,
});

export default async function EditArticlePage({ params }: { params: Params }) {
  const { id } = await params;
  await requireAdminPage(`${ADMIN_ARTICLES_PATH}/${id}`);

  const article = /^\d+$/.test(id) ? await findStoredArticleById(Number(id)) : null;
  if (!article) notFound();

  return (
    <EditorPage
      title="Sửa bài viết"
      initial={{
        id: article.id,
        slug: article.slug,
        title: article.title,
        description: article.description,
        cover: article.cover,
        coverAlt: article.coverAlt,
        body: article.body,
        related: article.relatedProductSlugs,
      }}
    />
  );
}
