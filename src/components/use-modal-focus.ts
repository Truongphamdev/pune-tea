'use client';

import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Hành vi bàn phím chung của hộp thoại (BA §9 — truy cập):
 *
 * - mở ra thì đưa tiêu điểm vào `initialRef` (lựa chọn an toàn, không phải nút phá hủy);
 * - Tab và Shift+Tab đi vòng TRONG hộp thoại — `aria-modal` chỉ là lời hứa với trình đọc màn
 *   hình, bàn phím vẫn lọt ra trang nền nếu không tự giữ;
 * - Esc đóng;
 * - đóng xong trả tiêu điểm về đúng phần tử đã mở hộp thoại, không để rơi về đầu trang.
 */
export function useModalFocus(
  open: boolean,
  containerRef: RefObject<HTMLElement | null>,
  initialRef: RefObject<HTMLElement | null>,
  onClose: () => void,
): void {
  /*
   * Giữ `onClose` mới nhất trong ref thay vì đưa vào danh sách phụ thuộc của effect. Nơi gọi
   * thường truyền hàm mới mỗi lần vẽ; nếu effect chạy lại theo nó thì mỗi lần component cha vẽ
   * lại (tab khác sửa giỏ…) tiêu điểm bị giật về nút mặc định và khách mất phần đang bôi chọn.
   */
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;

    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    initialRef.current?.focus();

    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') return onCloseRef.current();
      if (event.key !== 'Tab') return;

      const items = [...(containerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])];
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;

      const active = document.activeElement;
      const outside = !containerRef.current?.contains(active);
      if (event.shiftKey && (active === first || outside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || outside)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      // Phần tử mở hộp thoại có thể đã biến mất (xóa cả giỏ) — khi đó không có gì để trả về
      if (opener?.isConnected) opener.focus();
    };
  }, [open, containerRef, initialRef]);
}
