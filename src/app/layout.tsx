import type { Metadata } from 'next';
import { Be_Vietnam_Pro, Lora } from 'next/font/google';
import { Toaster } from '@/components/toast';
import { SITE_NAME, siteUrl } from '@/config/site';
import './globals.css';

/*
 * Hai họ chữ, nạp qua `next/font` để tự host — không gọi ra fonts.googleapis.com lúc chạy.
 * Tự host được ba thứ: không có yêu cầu mạng chặn hiển thị, không rò địa chỉ IP người dùng
 * sang bên thứ ba, và không phụ thuộc một tên miền ngoài để trang đọc được.
 *
 * `subsets` BẮT BUỘC có "vietnamese". Thiếu nó thì mọi chữ có dấu rơi về font hệ thống, và
 * một dòng tiêu đề sẽ trộn hai kiểu chữ khác nhau — lỗi rất dễ lọt vì người viết code
 * thường thử bằng chữ không dấu.
 */
const display = Lora({
  subsets: ['vietnamese', 'latin'],
  weight: ['500', '600', '700'],
  variable: '--font-app-display',
  display: 'swap',
});

const sans = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-app-sans',
  display: 'swap',
});

/**
 * Metadata mặc định của toàn site. Từng trang ghi đè `title`/`description` của mình; mẫu
 * tiêu đề `%s | Puni Tea` theo SEO-01. `metadataBase` để đường dẫn tương đối trong thẻ OG
 * thành URL tuyệt đối. Ảnh chia sẻ mặc định sinh từ `opengraph-image.tsx` / `twitter-image.tsx`.
 */
const DESCRIPTION = `${SITE_NAME} — trà túi lọc, trà rời và trà hòa tan đóng gói sẵn. Xem giá, bỏ giỏ và đặt hàng qua Facebook page.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-dvh font-sans antialiased">
        {children}
        {/* Điểm hiển thị toast duy nhất của toàn site — xem components/toast.tsx */}
        <Toaster />
      </body>
    </html>
  );
}
