import type { Metadata } from 'next';
import { SITE_NAME } from '@/config/site';

/** Ảnh chia sẻ mặc định, sinh từ `app/opengraph-image.tsx` và `app/twitter-image.tsx`. */
export const DEFAULT_OG_IMAGE = '/opengraph-image';
export const DEFAULT_TWITTER_IMAGE = '/twitter-image';

export interface PageMeta {
  readonly title: string;
  readonly description: string;
  /** Đường dẫn tương đối bắt đầu bằng `/` — thành `canonical` (SEO-01). */
  readonly path: string;
  /** Ảnh chia sẻ riêng của trang; bỏ trống thì dùng ảnh mặc định của site (SEO-02). */
  readonly image?: string;
  readonly type?: 'website' | 'article';
  readonly noindex?: boolean;
}

/**
 * Metadata của một trang (SEO-01, SEO-02): tiêu đề, mô tả, canonical, Open Graph, Twitter.
 *
 * Dùng chung một hàm để không trang nào quên canonical hay thẻ chia sẻ. `metadataBase` ở
 * layout gốc biến các đường dẫn tương đối ở đây thành URL tuyệt đối.
 */
export function pageMetadata(meta: PageMeta): Metadata {
  /*
   * Trang không có ảnh riêng thì chỉ rõ ảnh mặc định của site. Không thể để trống: `openGraph`
   * của trang THAY HẲN `openGraph` của layout, nên bỏ trống là trang đó mất luôn thẻ og:image.
   */
  const ogImage = meta.image ?? DEFAULT_OG_IMAGE;
  const twitterImage = meta.image ?? DEFAULT_TWITTER_IMAGE;

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: meta.path },
    ...(meta.noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: meta.type ?? 'website',
      locale: 'vi_VN',
      siteName: SITE_NAME,
      title: meta.title,
      description: meta.description,
      url: meta.path,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [twitterImage],
    },
  };
}
