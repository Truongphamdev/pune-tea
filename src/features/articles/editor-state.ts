import type { SeoCheck } from './seo-check';

export type ArticleField = 'title' | 'description' | 'cover' | 'coverAlt' | 'body';

/** Trạng thái form soạn bài trả về từ server action. */
export interface ArticleFormState {
  readonly errors: Partial<Record<ArticleField, string>>;
  readonly message?: string;
  /** Các tiêu chí SEO chưa đạt khi bấm Đăng — máy chủ chấm lại, không tin kết quả chấm ở trình duyệt. */
  readonly failedChecks?: readonly SeoCheck[];
}

export const EMPTY_ARTICLE_STATE: ArticleFormState = { errors: {} };

/** Đường dẫn khu quản trị bài viết. */
export const ADMIN_ARTICLES_PATH = '/quan-tri/bai-viet';
