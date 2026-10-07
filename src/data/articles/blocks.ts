import type { ArticleBlock, ArticleInline } from '../types';

/** Vài hàm dựng khối để file bài viết đọc như văn bản, không như cây object. */

export const h2 = (text: string): ArticleBlock => ({ type: 'heading', level: 2, text });

export const h3 = (text: string): ArticleBlock => ({ type: 'heading', level: 3, text });

export const p = (...content: ArticleInline[]): ArticleBlock => ({ type: 'paragraph', content });

export const ul = (...items: string[]): ArticleBlock => ({ type: 'list', ordered: false, items });

export const ol = (...items: string[]): ArticleBlock => ({ type: 'list', ordered: true, items });

export const link = (text: string, href: string): ArticleInline => ({ text, href });

/** Liên kết tới trang sản phẩm — slug được test đối chiếu với dữ liệu sản phẩm. */
export const product = (text: string, slug: string): ArticleInline =>
  link(text, `/san-pham/${slug}`);

export const category = (text: string, slug: string): ArticleInline =>
  link(text, `/danh-muc/${slug}`);
