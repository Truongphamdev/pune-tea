import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { listArticleProducts, readingMinutes } from '@/data/articles';
import type { Article } from '@/data/types';
import { getAnyArticleBySlug, listAllArticles } from '@/features/articles/all-articles';
import { ArticleBody } from '@/features/articles/ArticleBody';
import { ArticleGrid } from '@/features/articles/ArticleCard';
import { Breadcrumbs } from '@/features/catalog/Breadcrumbs';
import { ProductGrid } from '@/features/catalog/ProductGrid';
import { SectionHeading } from '@/features/home/SectionHeading';
import { JsonLd } from '@/features/seo/JsonLd';
import { articleJsonLd, breadcrumbJsonLd } from '@/features/seo/json-ld';
import { pageMetadata } from '@/features/seo/metadata';
import { formatDate } from '@/lib/format';

type Params = Promise<{ slug: string }>;

/** Số bài viết khác hiện cuối bài (FR-61). */
const OTHER_ARTICLE_LIMIT = 3;

/*
 * Bài có sẵn và bài đã đăng được dựng sẵn lúc build; bài đăng SAU đó được dựng ở lần xem đầu
 * (`dynamicParams`). Đường dẫn không khớp bài nào thì `notFound()` trả 404.
 */
export const dynamicParams = true;
export const revalidate = 300;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return (await listAllArticles()).map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const article = await getAnyArticleBySlug((await params).slug);
  if (!article) return {};

  return pageMetadata({
    title: article.title,
    description: article.description,
    path: `/bai-viet/${article.slug}`,
    image: article.cover,
    type: 'article',
  });
}

/** Chi tiết bài viết (FR-61). */
export default async function ArticlePage({ params }: { params: Params }) {
  const article = await getAnyArticleBySlug((await params).slug);
  if (!article) notFound();

  const products = listArticleProducts(article);
  const others = (await listAllArticles())
    .filter((other) => other.slug !== article.slug)
    .slice(0, OTHER_ARTICLE_LIMIT);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-10">
      <JsonLd data={articleJsonLd(article)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Trang chủ', path: '/' },
          { name: 'Bài viết', path: '/bai-viet' },
          { name: article.title, path: `/bai-viet/${article.slug}` },
        ])}
      />

      <article className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Breadcrumbs
          items={[
            { href: '/', label: 'Trang chủ' },
            { href: '/bai-viet', label: 'Bài viết' },
            { label: article.title },
          ]}
        />
        <ArticleHeader article={article} />
        <ArticleBody blocks={article.body} />
      </article>

      {products.length > 0 ? (
        <section aria-labelledby="article-products" className="border-t border-line pt-10">
          <SectionHeading id="article-products" title="Sản phẩm liên quan" href="/san-pham" />
          <div className="mt-8">
            <ProductGrid products={products} emptyMessage="" />
          </div>
        </section>
      ) : null}

      <section aria-labelledby="other-articles" className="border-t border-line pt-10">
        <SectionHeading id="other-articles" title="Bài viết khác" href="/bai-viet" />
        <div className="mt-8">
          <ArticleGrid articles={others} />
        </div>
      </section>
    </main>
  );
}

function ArticleHeader({ article }: { article: Article }) {
  return (
    <header className="flex flex-col gap-4">
      <h1 className="font-display text-3xl leading-tight font-bold text-brand-700 sm:text-4xl">
        {article.title}
      </h1>
      <p className="text-sm text-muted">
        <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
        {' · '}
        {article.author}
        {' · '}
        {readingMinutes(article)} phút đọc
      </p>
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-frame bg-raised">
        <Image
          src={article.cover}
          alt={article.coverAlt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
        />
      </div>
    </header>
  );
}
