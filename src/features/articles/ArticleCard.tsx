import Image from 'next/image';
import Link from 'next/link';
import { readingMinutes } from '@/data/articles';
import type { Article } from '@/data/types';
import { formatDate } from '@/lib/format';

/** Thẻ bài viết (FR-60): ảnh bìa, tiêu đề, mô tả, ngày đăng, thời gian đọc. */
function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-card border border-line bg-surface transition-all duration-300 hover:-translate-y-1 hover:shadow-lift-lg">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-raised">
        <Image
          src={article.cover}
          alt={article.coverAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs text-muted">
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          {' · '}
          {readingMinutes(article)} phút đọc
        </p>
        <h3 className="text-lg leading-snug font-bold">
          <Link
            href={`/bai-viet/${article.slug}`}
            className="transition-colors after:absolute after:inset-0 after:content-[''] group-hover:text-accent"
          >
            {article.title}
          </Link>
        </h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted">{article.description}</p>
      </div>
    </article>
  );
}

export function ArticleGrid({ articles }: { articles: readonly Article[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard key={article.slug} article={article} />
      ))}
    </div>
  );
}
