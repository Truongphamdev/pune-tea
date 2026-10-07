import { ARTICLES } from './articles/index';
import { CATEGORIES } from './categories';
import { PRODUCTS } from './products';

export interface SiteImage {
  readonly src: string;
  readonly label: string;
}

/**
 * Mọi ảnh có sẵn trong `public/images`, kèm nhãn để chọn làm ảnh bìa bài viết.
 *
 * Không có tải ảnh lên: bản deploy chạy serverless, không có chỗ lưu file. Người viết bài chọn
 * trong các ảnh đã có của site.
 */
export function listSiteImages(): SiteImage[] {
  const all: SiteImage[] = [
    ...PRODUCTS.flatMap((product) => product.images.map((src) => ({ src, label: product.name }))),
    ...CATEGORIES.map((category) => ({ src: category.image, label: `Danh mục ${category.name}` })),
    ...ARTICLES.map((article) => ({ src: article.cover, label: article.coverAlt })),
  ];
  const seen = new Set<string>();
  return all.filter((image) => (seen.has(image.src) ? false : (seen.add(image.src), true)));
}

export function isSiteImage(src: string): boolean {
  return listSiteImages().some((image) => image.src === src);
}
