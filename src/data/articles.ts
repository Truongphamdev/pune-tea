import { countWords } from '@/lib/text';
import { ARTICLES } from './articles/index';
import { getProductBySlug } from './catalog';
import type { Article, ArticleBlock, Product } from './types';

/** Tốc độ đọc trung bình dùng để ước lượng thời gian đọc. */
const WORDS_PER_MINUTE = 200;

/** Lớp đọc bài viết — trang không import thẳng mảng dữ liệu (BA §4). Mới nhất đứng trước. */
export function listArticles(): Article[] {
  return [...ARTICLES].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getArticleBySlug(slug: string): Article | null {
  return ARTICLES.find((article) => article.slug === slug) ?? null;
}

export function listOtherArticles(slug: string, limit: number): Article[] {
  return listArticles()
    .filter((article) => article.slug !== slug)
    .slice(0, limit);
}

function blockText(block: ArticleBlock): string {
  switch (block.type) {
    case 'heading':
      return block.text;
    case 'paragraph':
      return block.content.map((part) => (typeof part === 'string' ? part : part.text)).join('');
    case 'list':
      return block.items.join(' ');
    case 'image':
      return '';
  }
}

/** Toàn bộ chữ của thân bài, dùng để đếm từ. */
export function articleText(article: Article): string {
  return article.body.map(blockText).join(' ');
}

export function articleWordCount(article: Article): number {
  return countWords(articleText(article));
}

export function readingMinutes(article: Article): number {
  return Math.max(1, Math.round(articleWordCount(article) / WORDS_PER_MINUTE));
}

/** Mọi liên kết nội bộ nằm trong thân bài. */
export function articleLinks(article: Article): string[] {
  return article.body.flatMap((block) =>
    block.type === 'paragraph'
      ? block.content.flatMap((part) => (typeof part === 'string' ? [] : [part.href]))
      : [],
  );
}

export function listArticleProducts(article: Article): Product[] {
  return article.relatedProductSlugs
    .map((slug) => getProductBySlug(slug))
    .filter((product): product is Product => product !== null);
}
