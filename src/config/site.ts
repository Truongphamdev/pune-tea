/**
 * Cấu hình chung của site (BA §4): tên shop, địa chỉ, link Facebook page, URL site, menu.
 *
 * Hai giá trị đổi theo môi trường đọc từ biến `NEXT_PUBLIC_*` (xem `.env.example`). Chúng được
 * đọc LÚC GỌI chứ không lúc nạp module để test và lúc build đều thấy giá trị hiện hành.
 */

export const SITE_NAME = 'Puni Tea';

/** Một câu giới thiệu ngắn, dùng ở chân trang. */
export const SITE_TAGLINE = 'Trà túi lọc, trà rời và trà hòa tan đóng gói sẵn của Puni Tea.';

/** Địa chỉ — đọc từ tên page "Puni Tea | Biên Hòa" (BA FR-71). Không bịa số nhà. */
export const SITE_ADDRESS = 'Biên Hòa, Đồng Nai';

/** Link page khách đã xác nhận (BA §7.6, 06/10/2026). */
export const DEFAULT_FACEBOOK_PAGE_URL =
  'https://www.facebook.com/share/19fniaMu8F/?mibextid=wwXIfr';

/** Địa chỉ mặc định khi chưa khai biến môi trường — trùng cổng dev của dự án (NFR-06). */
const DEFAULT_SITE_URL = 'http://localhost:3010';

export interface NavLink {
  readonly href: string;
  readonly label: string;
}

/** Menu chính, đúng thứ tự FR-01; đường dẫn theo bản đồ trang BA §6. */
export const NAV_LINKS: readonly NavLink[] = [
  { href: '/', label: 'Trang chủ' },
  { href: '/san-pham', label: 'Sản phẩm' },
  { href: '/bai-viet', label: 'Bài viết' },
  { href: '/gioi-thieu', label: 'Giới thiệu' },
  { href: '/lien-he', label: 'Liên hệ' },
];

/**
 * Đọc một URL từ biến môi trường, rơi về mặc định khi để trống.
 *
 * Giá trị sai định dạng thì DỪNG NGAY với thông báo nêu tên biến: để lọt xuống `new URL()` ở
 * `layout.tsx` thì lỗi hiện ra lúc build là "Invalid URL" trần, không biết sửa ở đâu.
 */
function urlFromEnv(
  name: string,
  value: string | undefined,
  fallback: string,
  protocols: readonly string[],
): URL {
  const raw = value?.trim() || fallback;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`${name} không phải URL hợp lệ: "${raw}"`);
  }
  if (!protocols.includes(url.protocol)) {
    throw new Error(`${name} phải bắt đầu bằng ${protocols.join(' hoặc ')} — nhận "${raw}"`);
  }
  return url;
}

/** URL gốc tuyệt đối của site, không có `/` ở cuối (SEO-08). */
export function siteUrl(): string {
  const url = urlFromEnv(
    'NEXT_PUBLIC_SITE_URL',
    process.env.NEXT_PUBLIC_SITE_URL,
    DEFAULT_SITE_URL,
    ['http:', 'https:'],
  );
  return url.href.replace(/\/+$/, '');
}

/**
 * Link Facebook page — kênh đặt hàng duy nhất. Chỉ nhận `https:` vì link này được gắn thẳng
 * vào `href`: một giá trị `javascript:` lọt vào đây là lỗ XSS.
 */
export function facebookPageUrl(): string {
  return urlFromEnv(
    'NEXT_PUBLIC_FACEBOOK_PAGE_URL',
    process.env.NEXT_PUBLIC_FACEBOOK_PAGE_URL,
    DEFAULT_FACEBOOK_PAGE_URL,
    ['https:'],
  ).href;
}
