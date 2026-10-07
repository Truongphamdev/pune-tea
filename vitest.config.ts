import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // Gói `server-only` cố ý ném lỗi khi nạp ngoài máy chủ của Next — trong test thay bằng module rỗng
      'server-only': resolve(__dirname, './test/stubs/empty.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'test/**/*.{test,spec}.{ts,tsx}'],
    /*
     * Cổng coverage theo BA NFR-02: ≥ 80% trên PHẦN LOGIC — `src/lib`, `src/data`, `src/config`
     * và các file `.ts` trong `src/features`. Thành phần giao diện then chốt (thẻ sản phẩm, giỏ
     * hàng, form đặt hàng) được kiểm bằng test hành vi, không tính vào con số này.
     */
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      include: [
        'src/lib/**/*.ts',
        'src/data/**/*.ts',
        'src/config/**/*.ts',
        'src/features/**/*.ts',
        'src/server/**/*.ts',
      ],
      exclude: ['src/**/*.d.ts'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
