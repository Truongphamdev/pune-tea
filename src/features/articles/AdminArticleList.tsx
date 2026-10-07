import Link from 'next/link';
import type { Article } from '@/data/types';
import { formatDate } from '@/lib/format';
import type { StoredArticle } from '@/server/articles-store';
import { deleteArticleAction } from './article-actions';
import { ADMIN_ARTICLES_PATH } from './editor-state';
import { checkSeo } from './seo-check';

const BADGE = 'rounded-full px-2.5 py-0.5 text-xs font-semibold';

function StatusBadge({ published }: { published: boolean }) {
  return published ? (
    <span className={`${BADGE} bg-brand-700 text-white`}>Đã đăng</span>
  ) : (
    <span className={`${BADGE} bg-gold-100 text-ink`}>Bản nháp</span>
  );
}

function StoredRow({ article }: { article: StoredArticle }) {
  const checks = checkSeo(article);
  const passed = checks.filter((check) => check.ok).length;
  const published = article.status === 'published';

  return (
    <li
      data-testid="admin-article"
      className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-surface p-4"
    >
      <div className="flex min-w-0 flex-col gap-1.5">
        <p className="font-semibold">{article.title}</p>
        <p className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <StatusBadge published={published} />
          <span className="tabular">
            SEO {passed}/{checks.length}
          </span>
          <span>/bai-viet/{article.slug}</span>
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {published ? (
          <Link
            href={`/bai-viet/${article.slug}`}
            className="rounded-full border border-line bg-raised px-4 py-2 text-sm font-semibold hover:bg-line"
          >
            Xem
          </Link>
        ) : null}
        <Link
          href={`${ADMIN_ARTICLES_PATH}/${article.id}`}
          className="rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100"
        >
          Sửa
        </Link>
        <form action={deleteArticleAction}>
          <input type="hidden" name="id" value={article.id} />
          <button
            type="submit"
            aria-label={`Xóa bài ${article.title}`}
            className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
          >
            Xóa
          </button>
        </form>
      </div>
    </li>
  );
}

/** Danh sách bài do quản trị viên soạn (sửa, xóa được) và các bài có sẵn trong mã nguồn (chỉ xem). */
export function AdminArticleList({
  stored,
  builtIn,
}: {
  stored: readonly StoredArticle[];
  builtIn: readonly Article[];
}) {
  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="stored-articles" className="flex flex-col gap-4">
        <h2 id="stored-articles" className="text-xl font-bold">
          Bài đã soạn ({stored.length})
        </h2>
        {stored.length === 0 ? (
          <p className="rounded-card border border-dashed border-line p-6 text-sm text-muted">
            Chưa có bài nào. Bấm “Viết bài mới” để bắt đầu.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {stored.map((article) => (
              <StoredRow key={article.id} article={article} />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="builtin-articles" className="flex flex-col gap-4">
        <h2 id="builtin-articles" className="text-xl font-bold">
          Bài có sẵn ({builtIn.length})
        </h2>
        <ul className="flex flex-col gap-2 text-sm">
          {builtIn.map((article) => (
            <li key={article.slug} className="flex flex-wrap justify-between gap-2">
              <Link href={`/bai-viet/${article.slug}`} className="font-medium hover:text-accent">
                {article.title}
              </Link>
              <span className="text-muted">{formatDate(article.publishedAt)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
