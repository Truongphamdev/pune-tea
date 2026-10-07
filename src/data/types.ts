/**
 * Mô hình dữ liệu của cửa hàng — chép đúng BA §5.1.
 *
 * Thay cho kiểu dùng chung của bản gốc: mô hình trà nhỏ hơn nhiều — không file nguồn,
 * không ví, không đánh giá. Mảng dữ liệu và lớp hàm đọc nằm cạnh file này (BA §4).
 */

export interface Category {
  readonly slug: string;
  readonly name: string;
  /** Đoạn giới thiệu, dùng cho cả meta description. */
  readonly description: string;
  readonly format: string;
  /** Quy cách chuẩn của cả nhóm, theo thông tin khách cung cấp (BA §5.2). */
  readonly standardPacking: string;
  /** Ảnh bìa danh mục, đường dẫn trong `public/`. */
  readonly image: string;
}

export interface ProductVariant {
  readonly id: string;
  readonly label: string;
  /** Số nguyên VND, > 0. */
  readonly priceVnd: number;
}

export interface ProductSpec {
  readonly label: string;
  readonly value: string;
}

export interface Product {
  /** Duy nhất, không dấu. */
  readonly slug: string;
  readonly name: string;
  readonly categorySlug: string;
  readonly shortDescription: string;
  /** Các đoạn mô tả. */
  readonly description: readonly string[];
  readonly specs: readonly ProductSpec[];
  /** Ít nhất một phần tử. */
  readonly variants: readonly ProductVariant[];
  /** Ảnh đầu là ảnh bìa. */
  readonly images: readonly string[];
  /** Ảnh nền đen → khung ảnh nền tối. */
  readonly imageBackground?: 'dark';
  /** Lên khối "Sản phẩm nổi bật". */
  readonly featured?: boolean;
}

/** Một đoạn chữ trong bài: chữ thường, hoặc liên kết nội bộ tới sản phẩm/danh mục/bài khác. */
export type ArticleInline = string | { readonly text: string; readonly href: string };

/**
 * Một khối của thân bài. Thân bài là MẢNG KHỐI CÓ KIỂU chứ không phải HTML thô — không cần
 * trình đọc Markdown, không có đường nào cho HTML lạ lọt vào trang (BA §5.1, NFR-05).
 */
export type ArticleBlock =
  | { readonly type: 'heading'; readonly level: 2 | 3; readonly text: string }
  | { readonly type: 'paragraph'; readonly content: readonly ArticleInline[] }
  | { readonly type: 'list'; readonly ordered: boolean; readonly items: readonly string[] }
  | { readonly type: 'image'; readonly src: string; readonly alt: string };

export interface Article {
  readonly slug: string;
  /** ≤ 60 ký tự. */
  readonly title: string;
  /** 120–160 ký tự. */
  readonly description: string;
  readonly cover: string;
  readonly coverAlt: string;
  /** Ngày đăng dạng ISO `YYYY-MM-DD`. */
  readonly publishedAt: string;
  readonly author: string;
  readonly body: readonly ArticleBlock[];
  readonly relatedProductSlugs: readonly string[];
}
