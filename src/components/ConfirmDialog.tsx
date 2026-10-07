'use client';

import { useRef } from 'react';
import { useModalFocus } from './use-modal-focus';

/**
 * Hộp thoại xác nhận cho hành động không hoàn tác được.
 *
 * Nổi giữa màn hình với nền mờ che nội dung — khác hẳn một cụm nút chen ngang cạnh form:
 * người bấm phải NHÌN THẤY câu hỏi trước khi hành động chạy, và bấm hụt ra ngoài chỉ đóng
 * hộp thoại chứ không kích hoạt gì.
 *
 * Tự dựng bằng lớp phủ `fixed` thay vì thẻ `<dialog>.showModal()`: jsdom trong bộ test chưa
 * cài đặt showModal, và nhu cầu ở đây đủ nhỏ để không đáng đổi lấy một hàng rào test.
 */
export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  pendingLabel: string;
  saving: boolean;
  /** Khóa thêm nút xác nhận ngoài lúc đang lưu. */
  confirmDisabled?: boolean;
  confirmTestId?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog(props: ConfirmDialogProps) {
  const { open, title, description, onCancel } = props;
  const cancelRef = useRef<HTMLButtonElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  // Tiêu điểm rơi vào "Hủy" — lựa chọn an toàn nhận Enter, không phải nút xóa
  useModalFocus(open, shellRef, cancelRef, onCancel);

  if (!open) return null;

  return (
    <DialogShell shellRef={shellRef} title={title} description={description} onCancel={onCancel}>
      <DialogButtons cancelRef={cancelRef} {...props} />
    </DialogShell>
  );
}

/** Lớp phủ + khung thẻ chung của mọi hộp thoại — bấm nền mờ là hủy, bấm trong thẻ thì không. */
function DialogShell({
  shellRef,
  title,
  description,
  onCancel,
  children,
}: {
  shellRef: React.RefObject<HTMLDivElement | null>;
  title: string;
  description?: string | undefined;
  onCancel: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center bg-ink/40 p-4"
      onClick={onCancel}
      data-testid="confirm-backdrop"
    >
      <div
        ref={shellRef}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className="toast-in w-full max-w-sm rounded-card border border-line bg-surface p-5 shadow-lift-lg"
      >
        <h3 className="text-base font-semibold">{title}</h3>
        {description ? <p className="mt-1.5 text-sm text-muted">{description}</p> : null}
        {children}
      </div>
    </div>
  );
}

function DialogButtons({
  cancelRef,
  saving,
  confirmLabel,
  pendingLabel,
  confirmDisabled,
  confirmTestId,
  onConfirm,
  onCancel,
}: Omit<ConfirmDialogProps, 'open' | 'title'> & {
  cancelRef: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <div className="mt-4 flex justify-end gap-2">
      <button
        ref={cancelRef}
        type="button"
        onClick={onCancel}
        className="rounded-full border border-line bg-raised px-4 py-2 text-sm font-semibold transition-colors hover:bg-line"
      >
        Hủy
      </button>
      <button
        type="button"
        disabled={saving || confirmDisabled}
        onClick={onConfirm}
        {...(confirmTestId ? { 'data-testid': confirmTestId } : {})}
        className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
      >
        {saving ? pendingLabel : confirmLabel}
      </button>
    </div>
  );
}
