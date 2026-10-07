import type { MetadataRoute } from 'next';
import { siteUrl } from '@/config/site';

/**
 * Cho phép toàn site; chặn các trang riêng của từng người (giỏ hàng, đăng nhập, đăng ký, tài
 * khoản) cùng API, và trỏ tới sitemap — SEO-04.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/gio-hang', '/dang-nhap', '/dang-ky', '/tai-khoan', '/quan-tri', '/api/'],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
