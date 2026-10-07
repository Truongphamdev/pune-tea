import { defineConfig, devices } from '@playwright/test';

/** Cổng riêng cho bộ E2E — không đụng dev server đang chạy ở 3010. */
const PORT = 3013;
const E2E_DATABASE = 'storage/e2e.db';

/**
 * Kịch bản khói trên trình duyệt thật (BA NFR-08).
 *
 * Bắt những lỗi mà test đơn vị không thấy được vì jsdom không dựng bố cục: lớp phủ bị thành
 * phần khác che, nút không bấm được, tràn ngang trên màn hình hẹp.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'mobile',
      use: { ...devices['Desktop Chrome'], viewport: { width: 360, height: 740 } },
    },
  ],
  webServer: {
    /*
     * Build vào `.next-e2e` và dùng file database riêng: chạy E2E trong lúc `pnpm dev` đang bật
     * không đè lên bản build của dev server, và không ghi tài khoản thử vào database thật.
     * Xóa database cũ trước mỗi lượt để các ca đăng ký luôn bắt đầu từ trạng thái trắng.
     */
    command: `rm -f ${E2E_DATABASE}* && pnpm build && pnpm exec next start --port ${PORT}`,
    env: { NEXT_DIST_DIR: '.next-e2e', DATABASE_URL: `file:${E2E_DATABASE}` },
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
