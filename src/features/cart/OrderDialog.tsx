'use client';

import { useRef, useState } from 'react';
import { useModalFocus } from '@/components/use-modal-focus';

/** Chép văn bản vào clipboard; `false` khi trình duyệt chặn hoặc không hỗ trợ (FR-52). */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export interface OrderDialogProps {
  readonly message: string;
  readonly facebookUrl: string;
  /** Lần chép tự động lúc bấm đặt hàng có thành công không. */
  readonly copied: boolean;
  readonly onClose: () => void;
  readonly onClearCart: () => void;
}

/**
 * Hộp thoại sau khi bấm "Đặt hàng qua Facebook" (FR-51…53).
 *
 * Link page dạng `share/…` không điền sẵn được tin nhắn, nên nội dung đơn nằm trong clipboard
 * và hộp thoại này hướng dẫn dán. Nội dung luôn hiện trong ô văn bản: clipboard bị chặn thì
 * khách vẫn tự bôi chép được. Giỏ hàng KHÔNG tự xóa — khách quyết định.
 */
export function OrderDialog({
  message,
  facebookUrl,
  copied,
  onClose,
  onClearCart,
}: OrderDialogProps) {
  const [copyState, setCopyState] = useState<boolean>(copied);
  const closeRef = useRef<HTMLButtonElement>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  useModalFocus(true, panelRef, closeRef, onClose);

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-ink/50 p-4" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-dialog-title"
        onClick={(event) => event.stopPropagation()}
        className="toast-in flex max-h-[90dvh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-frame border border-line bg-surface p-5 shadow-lift-lg sm:p-6"
      >
        <h2 id="order-dialog-title" className="text-xl font-bold text-brand-700">
          Gửi đơn cho shop qua Facebook
        </h2>
        <p className="text-sm leading-relaxed" role="status">
          {copyState
            ? 'Nội dung đơn đã được sao chép. Dán nội dung vừa sao chép vào tin nhắn gửi page để shop xác nhận.'
            : 'Trình duyệt không cho sao chép tự động. Hãy bôi chọn nội dung bên dưới, sao chép rồi dán vào tin nhắn gửi page.'}
        </p>

        <p
          className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700"
          data-testid="order-saved"
        >
          Đơn đã được lưu vào lịch sử trong trang Tài khoản.
        </p>
        <MessageBox message={message} />

        <CopyActions
          facebookUrl={facebookUrl}
          onCopy={async () => setCopyState(await copyText(message))}
        />
        <ClearCartPrompt closeRef={closeRef} onClose={onClose} onClearCart={onClearCart} />
      </div>
    </div>
  );
}

function MessageBox({ message }: { message: string }) {
  return (
    <>
      <label htmlFor="order-message" className="sr-only">
        Nội dung đơn hàng
      </label>
      <textarea
        id="order-message"
        readOnly
        value={message}
        rows={9}
        onFocus={(event) => event.target.select()}
        className="w-full rounded-lg border border-line bg-raised/60 p-3 font-mono text-xs leading-relaxed"
      />
    </>
  );
}

function CopyActions({ facebookUrl, onCopy }: { facebookUrl: string; onCopy: () => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onCopy}
        className="rounded-full border border-brand-700 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
      >
        Sao chép lại
      </button>
      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
      >
        Mở Facebook page
      </a>
    </div>
  );
}

function ClearCartPrompt({
  closeRef,
  onClose,
  onClearCart,
}: {
  closeRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onClearCart: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
      <p className="text-sm text-muted">Đã gửi đơn xong? Bạn có muốn xóa giỏ hàng không?</p>
      <div className="flex gap-2">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="rounded-full border border-line bg-raised px-4 py-2 text-sm font-semibold transition-colors hover:bg-line"
        >
          Giữ giỏ hàng
        </button>
        <button
          type="button"
          onClick={onClearCart}
          className="rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-ink hover:bg-gold-300"
        >
          Xóa giỏ hàng
        </button>
      </div>
    </div>
  );
}
