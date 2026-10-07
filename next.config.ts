import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /*
   * Thư mục build đổi được qua `NEXT_DIST_DIR`. `pnpm dev` dùng `.next-dev` riêng: nếu dev và
   * `next build` cùng ghi vào `.next` thì build trong lúc dev đang chạy sẽ xóa mất file của dev
   * server, và mọi trang trả 500 "ENOENT … routes-manifest.json".
   */
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  reactStrictMode: true,
  // Gói có binary native cho `file:` — để Node nạp trực tiếp, không đóng gói vào bundle
  serverExternalPackages: ['@libsql/client'],
  poweredByHeader: false,
  /**
   * Header phòng thủ cho mọi trang.
   *
   * Không đặt CSP `script-src` ở đây: Next chèn script nội tuyến khi hydrate và cần nonce
   * theo từng request để làm đúng — làm nửa vời chỉ tạo cảm giác an toàn. Những header còn
   * lại thì rẻ và chắc: chống nhúng iframe (clickjacking), chống đoán MIME, giới hạn
   * referrer và các API trình duyệt trang không dùng.
   *
   * Không đặt HSTS: đồ án chạy trên máy cá nhân qua HTTP, không có tên miền thật (BA §2.2).
   */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
        ],
      },
    ];
  },
  images: {
    // Ảnh nằm sẵn trong `public/images` — không tải ảnh từ tên miền ngoài nào (BA §4)
    remotePatterns: [],
    // Định dạng nén hiện đại, Next tự chọn theo `Accept` của trình duyệt
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
