import type { MetadataRoute } from 'next';
import { siteUrl } from '@/config/site';
import { listCategories, listProducts } from '@/data/catalog';
import { listAllArticles } from '@/features/articles/all-articles';

/** Trang tĩnh của site. `/gio-hang` cố ý vắng mặt (SEO-03). */
const STATIC_PATHS = ['/', '/san-pham', '/bai-viet', '/gioi-thieu', '/lien-he'] as const;

/**
 * Sơ đồ site (SEO-03), phục vụ ở `/sitemap.xml`.
 *
 * Danh mục, sản phẩm và bài viết SINH TỪ lớp đọc dữ liệu — thêm sản phẩm là sitemap tự có.
 */
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await listAllArticles();
  const base = siteUrl();
  const entry = (path: string, priority: number, lastModified?: string) => ({
    url: `${base}${path === '/' ? '' : path}`,
    changeFrequency: 'weekly' as const,
    priority,
    ...(lastModified ? { lastModified } : {}),
  });

  return [
    ...STATIC_PATHS.map((path) => entry(path, path === '/' ? 1 : 0.8)),
    ...listCategories().map((category) => entry(`/danh-muc/${category.slug}`, 0.8)),
    ...listProducts().map((product) => entry(`/san-pham/${product.slug}`, 0.7)),
    ...articles.map((article) => entry(`/bai-viet/${article.slug}`, 0.6, article.publishedAt)),
  ];
}
