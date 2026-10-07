'use client';

import Image from 'next/image';
import { useCallback, useRef } from 'react';
import { useLightboxKeys } from './use-lightbox-keys';

/** Một ảnh trong bộ ảnh sản phẩm — `id` ổn định để làm `key`. */
export interface GalleryImage {
  readonly id: string;
  readonly url: string;
}

export interface LightboxProps {
  readonly images: readonly GalleryImage[];
  readonly title: string;
  /** Ảnh đang xem, hoặc `null` khi đóng. */
  readonly index: number | null;
  readonly onIndexChange: (index: number) => void;
  readonly onClose: () => void;
}

/**
 * Xem ảnh sản phẩm toàn màn hình.
 *
 * Ảnh hiện TRỌN khung (`object-contain`) — ở trang chi tiết ảnh bìa bị cắt cho vừa tỉ lệ
 * 4:3, còn ở đây khách cần đọc được cả chữ in trên bao bì.
 *
 * Tự dựng lớp phủ `fixed` như `ConfirmDialog` (jsdom chưa có `showModal`). Chuyển ảnh vòng
 * tròn: bấm "sau" ở ảnh cuối về ảnh đầu, đỡ phải bấm ngược cả dãy.
 */
export function Lightbox({ images, title, index, onIndexChange, onClose }: LightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = index !== null && images.length > 0;
  const count = images.length;

  const onPrev = useCallback(() => {
    if (index !== null && count > 1) onIndexChange((index - 1 + count) % count);
  }, [index, count, onIndexChange]);
  const onNext = useCallback(() => {
    if (index !== null && count > 1) onIndexChange((index + 1) % count);
  }, [index, count, onIndexChange]);

  useLightboxKeys(open, { onClose, onPrev, onNext }, closeRef);

  if (!open) return null;
  const image = images[index];
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-[95] flex flex-col bg-black/90 p-3 sm:p-6"
      onClick={onClose}
      data-testid="lightbox-backdrop"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Ảnh ${index + 1} / ${count} — ${title}`}
        className="flex min-h-0 flex-1 flex-col gap-3"
      >
        <LightboxTopBar closeRef={closeRef} position={index + 1} count={count} onClose={onClose} />

        <div className="relative min-h-0 flex-1">
          <Image
            // Đổi `key` theo ảnh để next/image không giữ ảnh cũ trong lúc tải ảnh mới
            key={image.id}
            src={image.url}
            alt={`${title} — ảnh ${index + 1}`}
            fill
            sizes="100vw"
            onClick={(event) => event.stopPropagation()}
            className="object-contain"
            data-testid="lightbox-image"
          />
          {count > 1 ? <LightboxArrows onPrev={onPrev} onNext={onNext} /> : null}
        </div>
      </div>
    </div>
  );
}

function LightboxArrows({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  const className =
    'absolute top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-2xl text-white hover:bg-black/70';

  return (
    <>
      <button
        type="button"
        aria-label="Ảnh trước"
        onClick={(event) => {
          event.stopPropagation();
          onPrev();
        }}
        className={`${className} start-1`}
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Ảnh sau"
        onClick={(event) => {
          event.stopPropagation();
          onNext();
        }}
        className={`${className} end-1`}
      >
        ›
      </button>
    </>
  );
}

function LightboxTopBar({
  closeRef,
  position,
  count,
  onClose,
}: {
  closeRef: React.RefObject<HTMLButtonElement | null>;
  position: number;
  count: number;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between text-sm text-white/80">
      <span data-testid="lightbox-counter">
        {position} / {count}
      </span>
      <button
        ref={closeRef}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        aria-label="Đóng"
        className="rounded-md px-3 py-1.5 text-2xl leading-none text-white hover:bg-white/10"
      >
        ×
      </button>
    </div>
  );
}
