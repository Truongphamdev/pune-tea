'use client';

import { useState } from 'react';
import { clampQuantity, MAX_QUANTITY, MIN_QUANTITY } from './cart';

const STEP_CLASS =
  'grid size-9 place-items-center bg-brand-50 text-lg font-semibold text-brand-700 transition-colors hover:bg-brand-100 disabled:cursor-not-allowed disabled:bg-raised disabled:text-muted/50';

/** Bộ tăng/giảm số lượng 1–99 (FR-32, FR-42). `label` nói rõ đang chỉnh món nào cho trình đọc màn hình. */
export function QuantityStepper({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (quantity: number) => void;
  label: string;
}) {
  /*
   * Chữ đang gõ dở giữ riêng, không ép về số ngay. Ép ngay thì xóa trắng ô là giá trị nhảy về
   * 1, và gõ "5" tiếp theo thành "15" — khách muốn 5 lại ra 15 món.
   */
  const [draft, setDraft] = useState<string | null>(null);

  const onType = (text: string): void => {
    setDraft(text);
    if (/^\d+$/.test(text)) onChange(clampQuantity(Number(text)));
  };

  return (
    <div className="inline-flex items-center overflow-hidden rounded-full border border-line bg-surface">
      <button
        type="button"
        className={STEP_CLASS}
        aria-label={`Giảm số lượng ${label}`}
        disabled={value <= MIN_QUANTITY}
        onClick={() => onChange(clampQuantity(value - 1))}
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        maxLength={2}
        value={draft ?? String(value)}
        aria-label={`Số lượng ${label}`}
        onChange={(event) => onType(event.target.value)}
        // Rời ô thì bỏ chữ gõ dở: ô để trống hay gõ chữ lạ quay về số lượng đang có hiệu lực
        onBlur={() => setDraft(null)}
        className="tabular w-10 bg-transparent text-center text-sm font-semibold outline-none"
      />
      <button
        type="button"
        className={STEP_CLASS}
        aria-label={`Tăng số lượng ${label}`}
        disabled={value >= MAX_QUANTITY}
        onClick={() => onChange(clampQuantity(value + 1))}
      >
        +
      </button>
    </div>
  );
}
