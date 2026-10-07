import { EditorPage, requireAdminPage } from '@/features/articles/editor-page';
import { ADMIN_ARTICLES_PATH } from '@/features/articles/editor-state';
import { pageMetadata } from '@/features/seo/metadata';

const PATH = `${ADMIN_ARTICLES_PATH}/moi`;

export const metadata = pageMetadata({
  title: 'Viết bài mới',
  description: 'Soạn bài viết mới cho website với bảng chấm chuẩn SEO trực tiếp.',
  path: PATH,
  noindex: true,
});

export default async function NewArticlePage() {
  await requireAdminPage(PATH);

  return (
    <EditorPage
      title="Viết bài mới"
      initial={{
        id: null,
        slug: null,
        title: '',
        description: '',
        cover: '',
        coverAlt: '',
        body: '',
        related: [],
      }}
    />
  );
}
