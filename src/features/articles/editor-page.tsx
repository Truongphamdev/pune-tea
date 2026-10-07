import { notFound, redirect } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { siteUrl } from '@/config/site';
import { listProducts } from '@/data/catalog';
import { listSiteImages } from '@/data/images';
import { Breadcrumbs } from '@/features/catalog/Breadcrumbs';
import { getAdmin } from '@/server/admin';
import { getCurrentUser } from '@/server/current-user';
import { ArticleEditor, type EditorValues } from './ArticleEditor';
import { ADMIN_ARTICLES_PATH } from './editor-state';

/**
 * Cổng vào khu quản trị: chưa đăng nhập thì sang đăng nhập rồi quay lại; đã đăng nhập mà không
 * phải quản trị viên thì trả 404 — không tiết lộ là có trang quản trị ở đây.
 */
export async function requireAdminPage(returnTo: string): Promise<void> {
  if (await getAdmin()) return;
  if (!(await getCurrentUser())) redirect(`/dang-nhap?tiep=${encodeURIComponent(returnTo)}`);
  notFound();
}

/** Khung trang soạn bài, dùng chung cho "bài mới" và "sửa bài". */
export function EditorPage({ title, initial }: { title: string; initial: EditorValues }) {
  const products = listProducts().map((product) => ({ value: product.slug, label: product.name }));

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <PageHeader
        title={title}
        lead="Soạn bài ở cột trái; cột phải chấm chuẩn SEO theo từng chữ bạn gõ. Bài đạt đủ tiêu chí mới đăng được, bản nháp thì lưu lúc nào cũng được."
      >
        <Breadcrumbs
          items={[
            { href: '/', label: 'Trang chủ' },
            { href: ADMIN_ARTICLES_PATH, label: 'Quản trị bài viết' },
            { label: title },
          ]}
        />
      </PageHeader>
      <ArticleEditor
        initial={initial}
        images={listSiteImages()}
        products={products}
        host={new URL(siteUrl()).host}
      />
    </main>
  );
}
