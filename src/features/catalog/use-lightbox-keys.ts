'use client';

import { useEffect, type RefObject } from 'react';

interface LightboxKeyHandlers {
  readonly onClose: () => void;
  readonly onPrev: () => void;
  readonly onNext: () => void;
}

/**
 * Bàn phím và cuộn trang khi đang xem ảnh lớn.
 *
 * - Esc đóng, ← → chuyển ảnh — cách ai cũng thử đầu tiên với một trình xem ảnh.
 * - Khóa cuộn trang nền: vuốt trên điện thoại không được làm trang phía sau trôi đi.
 * - Tiêu điểm vào nút Đóng khi mở và TRẢ VỀ chỗ cũ khi đóng, để người dùng bàn phím không
 *   bị ném về đầu trang.
 */
export function useLightboxKeys(
  open: boolean,
  handlers: LightboxKeyHandlers,
  closeRef: RefObject<HTMLButtonElement | null>,
): void {
  const { onClose, onPrev, onNext } = handlers;

  useEffect(() => {
    if (!open) return undefined;

    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
      else if (event.key === 'ArrowLeft') onPrev();
      else if (event.key === 'ArrowRight') onNext();
      else if (event.key === 'Tab') trapFocus(event, closeRef.current?.closest('[role="dialog"]'));
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose, onPrev, onNext, closeRef]);

  useEffect(() => {
    if (!open) return undefined;

    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [open, closeRef]);
}

/** Tab / Shift+Tab xoay vòng trong hộp thoại — `aria-modal` mà Tab lọt ra trang sau là nói dối. */
function trapFocus(event: KeyboardEvent, dialog: Element | null | undefined): void {
  if (!dialog) return;
  const buttons = Array.from(dialog.querySelectorAll<HTMLButtonElement>('button:not([disabled])'));
  const first = buttons[0];
  const last = buttons[buttons.length - 1];
  if (!first || !last) return;

  const inside = dialog.contains(document.activeElement);
  if (event.shiftKey && (document.activeElement === first || !inside)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (document.activeElement === last || !inside)) {
    event.preventDefault();
    first.focus();
  }
}
