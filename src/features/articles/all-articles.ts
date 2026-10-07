import 'server-only';
import { getArticleBySlug, listArticles } from '@/data/articles';
import type { Article } from '@/data/types';
import { SITE_NAME } from '@/config/site';
import { listPublishedArticles, type StoredArticle } from '@/server/articles-store';
import { parseMarkup } from './markup';

/** Bài trong database → cùng kiểu `Article` với các bài có sẵn trong mã nguồn. */
export function toArticle(stored: StoredArticle): Article {
  return {
    slug: stored.slug,
    title: stored.title,
    description: stored.description,
    cover: stored.cover,
    coverAlt: stored.coverAlt,
    // SQLite lưu `YYYY-MM-DD HH:MM:SS` — mặt tiền chỉ cần ngày
    publishedAt: (stored.publishedAt ?? stored.updatedAt).slice(0, 10),
    author: SITE_NAME,
    body: parseMarkup(stored.body),
    relatedProductSlugs: stored.relatedProductSlugs,
  };
}

/**
 * Bài đã đăng trong database. Database hỏng thì trả mảng rỗng: trang chủ và trang bài viết vẫn
 * phải hiện các bài có sẵn, không sập cả site vì phần bài viết mới.
 */
async function publishedFromDatabase(): Promise<Article[]> {
  try {
    return (await listPublishedArticles()).map(toArticle);
  } catch (error) {
    console.error('Không đọc được bài viết từ database:', error);
    return [];
  }
}

/** Mọi bài hiển thị trên site: bài có sẵn trong mã nguồn + bài đã đăng từ trang quản trị, mới nhất trước. */
export async function listAllArticles(): Promise<Article[]> {
  const stored = await publishedFromDatabase();
  return [...listArticles(), ...stored].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getAnyArticleBySlug(slug: string): Promise<Article | null> {
  const builtIn = getArticleBySlug(slug);
  if (builtIn) return builtIn;
  return (await publishedFromDatabase()).find((article) => article.slug === slug) ?? null;
}
