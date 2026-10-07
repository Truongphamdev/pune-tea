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
   * Không tự đặt HSTS ở đây: bản chạy trên máy cá nhân dùng HTTP, còn bản deploy đã được
   * Vercel gắn sẵn header đó.
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
    /*
     * Chỉ WebP, không AVIF. Mỗi cỡ ảnh được nén ở lần đầu có người xem; nén AVIF một ảnh
     * 1254px mất 1–3 giây, nên khách đầu tiên của mỗi trang sản phẩm nhìn khung trống vài giây.
     * WebP nén nhanh gấp nhiều lần mà dung lượng chỉ nhỉnh hơn chút ít.
     */
    formats: ['image/webp'],
    /*
     * Ảnh gốc rộng nhất 1536px: không sinh bản 1920/2048/3840 — phóng to không thêm chi tiết,
     * chỉ tốn thời gian nén và làm trình duyệt màn hình 2x chọn bản khổng lồ.
     */
    deviceSizes: [384, 640, 750, 828, 1080, 1200, 1536],
    imageSizes: [72, 96, 128, 256],
    // Bản đã nén giữ 30 ngày (ảnh tĩnh trong repo, đổi ảnh là đổi URL khi deploy lại)
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
