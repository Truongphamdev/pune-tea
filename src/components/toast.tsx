'use client';

import { useEffect, useState } from 'react';

/**
 * Thông báo nổi (toast) toàn site.
 *
 * Dùng cho hành động mà kết quả KHÔNG tự hiện ra trước mắt: bấm "Thêm vào giỏ" xong, trang
 * trông y như trước khi bấm — không có gì nói "đã thêm rồi". Lỗi nhập liệu thì hiện ngay
 * cạnh ô sai (`Field`); toast là kênh cho tin "đã xong" ngắn gọn rồi tự biến mất.
 *
 * Giao tiếp qua sự kiện `window` thay vì Context: chỗ gọi không cần nằm trong Provider nào, và
 * gọi được từ ngoài cây React.
 */
const TOAST_EVENT = 'puni-tea:toast';

/** Đủ lâu để đọc một câu ngắn; không lâu tới mức thành rác che nội dung. */
const TOAST_DURATION_MS = 3_500;

type ToastTone = 'success' | 'error';

interface ToastDetail {
  readonly message: string;
  readonly tone: ToastTone;
}

interface ToastEntry extends ToastDetail {
  readonly id: number;
}

/** Hiện một thông báo nổi. Gọi được từ bất kỳ đâu có `window`. */
export function showToast(message: string, tone: ToastTone = 'success'): void {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new CustomEvent<ToastDetail>(TOAST_EVENT, { detail: { message, tone } }));
}

let nextId = 1;

/**
 * Điểm hiển thị duy nhất — gắn MỘT lần ở layout gốc.
 *
 * `role="status"` + `aria-live="polite"`: trình đọc màn hình đọc thông báo mới mà không cắt
 * ngang câu đang đọc dở.
 */
export function Toaster() {
  const [toasts, setToasts] = useState<readonly ToastEntry[]>([]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    const onToast = (event: Event): void => {
      const detail = (event as CustomEvent<ToastDetail>).detail;
      if (!detail?.message) return;

      const entry: ToastEntry = { ...detail, id: nextId++ };
      setToasts((current) => [...current, entry]);
      timers.push(
        setTimeout(
          () => setToasts((current) => current.filter((toast) => toast.id !== entry.id)),
          TOAST_DURATION_MS,
        ),
      );
    };

    window.addEventListener(TOAST_EVENT, onToast);
    return () => {
      window.removeEventListener(TOAST_EVENT, onToast);
      for (const timer of timers) clearTimeout(timer);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((toast) => (
        <ToastCard
          key={toast.id}
          toast={toast}
          onDismiss={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
        />
      ))}
    </div>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastEntry; onDismiss: () => void }) {
  return (
    // Bấm vào là tắt ngay — người đã đọc xong không phải chờ nó tự trôi
    <button
      type="button"
      onClick={onDismiss}
      data-testid="toast"
      data-tone={toast.tone}
      className={`toast-in pointer-events-auto max-w-md rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-lift-lg ${
        toast.tone === 'error' ? 'bg-red-600' : 'bg-ink'
      }`}
    >
      {toast.message}
    </button>
  );
}
