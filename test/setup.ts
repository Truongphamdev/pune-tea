import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

/**
 * jsdom KHÔNG cài `window.matchMedia`, mà nút "Lên đầu trang" gọi nó để đọc
 * `prefers-reduced-motion` (người đã tắt hiệu ứng thì nhảy thẳng lên đầu, không cuộn mượt).
 *
 * Trả `matches: false` = mặc định của trình duyệt (KHÔNG yêu cầu giảm chuyển động).
 */
// Test của phần máy chủ chạy ở môi trường `node` — ở đó không có `window` để vá
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string): MediaQueryList =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  });
}

afterEach(() => {
  cleanup();
});
