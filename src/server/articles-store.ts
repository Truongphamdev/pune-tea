import 'server-only';
import { queryAll, queryOne, run } from './db';

export type ArticleStatus = 'draft' | 'published';

/** Bài viết do quản trị viên soạn, đúng như lưu trong database (thân bài còn ở dạng cú pháp soạn). */
export interface StoredArticle {
  readonly id: number;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly cover: string;
  readonly coverAlt: string;
  readonly body: string;
  readonly relatedProductSlugs: readonly string[];
  readonly status: ArticleStatus;
  readonly publishedAt: string | null;
  readonly updatedAt: string;
}

export interface ArticleInput {
  readonly title: string;
  readonly description: string;
  readonly cover: string;
  readonly coverAlt: string;
  readonly body: string;
  readonly relatedProductSlugs: readonly string[];
  readonly status: ArticleStatus;
}

interface ArticleRow {
  id: number;
  slug: string;
  title: string;
  description: string;
  cover: string;
  cover_alt: string;
  body: string;
  related: string;
  status: string;
  published_at: string | null;
  updated_at: string;
}

function parseRelated(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function toArticle(row: ArticleRow): StoredArticle {
  return {
    id: Number(row.id),
    slug: row.slug,
    title: row.title,
    description: row.description,
    cover: row.cover,
    coverAlt: row.cover_alt,
    body: row.body,
    relatedProductSlugs: parseRelated(row.related),
    status: row.status === 'published' ? 'published' : 'draft',
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  };
}

/** Mọi bài (kể cả nháp), mới sửa trước — cho trang quản trị. */
export async function listStoredArticles(): Promise<StoredArticle[]> {
  const rows = await queryAll<ArticleRow>(
    'SELECT * FROM articles ORDER BY updated_at DESC, id DESC',
  );
  return rows.map(toArticle);
}

/** Chỉ bài ĐÃ ĐĂNG — cho mặt tiền. Bản nháp không bao giờ đi qua hàm này. */
export async function listPublishedArticles(): Promise<StoredArticle[]> {
  const rows = await queryAll<ArticleRow>(
    "SELECT * FROM articles WHERE status = 'published' ORDER BY published_at DESC, id DESC",
  );
  return rows.map(toArticle);
}

export async function findStoredArticleById(id: number): Promise<StoredArticle | null> {
  const row = await queryOne<ArticleRow>('SELECT * FROM articles WHERE id = ?', [id]);
  return row ? toArticle(row) : null;
}

export async function storedSlugExists(slug: string): Promise<boolean> {
  return (await queryOne('SELECT 1 AS found FROM articles WHERE slug = ?', [slug])) !== null;
}

export async function createStoredArticle(
  slug: string,
  input: ArticleInput,
  authorId: number,
): Promise<number> {
  const result = await run(
    `INSERT INTO articles (slug, title, description, cover, cover_alt, body, related, status, author_id, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CASE WHEN ? = 'published' THEN datetime('now') END)`,
    [
      slug,
      input.title,
      input.description,
      input.cover,
      input.coverAlt,
      input.body,
      JSON.stringify(input.relatedProductSlugs),
      input.status,
      authorId,
      input.status,
    ],
  );
  return Number(result.lastInsertRowid);
}

/**
 * Sửa bài. Đường dẫn (slug) giữ nguyên để link đã chia sẻ không chết. Ngày đăng đặt ở lần ĐẦU
 * chuyển sang "đã đăng" và giữ nguyên qua các lần sửa sau.
 */
export async function updateStoredArticle(id: number, input: ArticleInput): Promise<boolean> {
  const result = await run(
    `UPDATE articles
     SET title = ?, description = ?, cover = ?, cover_alt = ?, body = ?, related = ?, status = ?,
         published_at = CASE WHEN ? = 'published' THEN COALESCE(published_at, datetime('now')) ELSE published_at END,
         updated_at = datetime('now')
     WHERE id = ?`,
    [
      input.title,
      input.description,
      input.cover,
      input.coverAlt,
      input.body,
      JSON.stringify(input.relatedProductSlugs),
      input.status,
      input.status,
      id,
    ],
  );
  return result.rowsAffected > 0;
}

export async function deleteStoredArticle(id: number): Promise<boolean> {
  return (await run('DELETE FROM articles WHERE id = ?', [id])).rowsAffected > 0;
}
