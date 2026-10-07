'use client';

import Image from 'next/image';
import { useCallback, useState } from 'react';
import { ImagePlaceholder, ProductImage } from './ProductImage';
import { Lightbox, type GalleryImage } from './Lightbox';

/** Ảnh lớn nhất nằm ngay đầu trang nên được ưu tiên tải. */
const MAIN_IMAGE = { variant: 'detail', priority: true } as const;

/**
 * Bộ ảnh ở trang chi tiết: ảnh lớn phía trên, dải ảnh nhỏ phía dưới, bấm ảnh lớn để xem
 * toàn màn hình.
 *
 * Bấm ảnh nhỏ chỉ ĐỔI ảnh lớn chứ không mở lightbox ngay — khách lướt nhanh qua cả bộ mà
 * không bị một lớp phủ nhảy ra mỗi lần chạm. Chỉ một ảnh thì không có dải: một ô nhỏ trùng
 * ảnh lớn chỉ tốn chỗ.
 */
export function ProductGallery({
  images,
  title,
  dark = false,
}: {
  images: readonly GalleryImage[];
  title: string;
  dark?: boolean;
}) {
  const [active, setActive] = useState(0);
  const [viewing, setViewing] = useState<number | null>(null);
  // Ổn định tham chiếu để trình nghe phím của lightbox không gắn lại sau mỗi lần vẽ
  const onIndexChange = useCallback((index: number) => {
    setViewing(index);
    setActive(index);
  }, []);
  const onClose = useCallback(() => setViewing(null), []);

  const current = images[active] ?? images[0];
  if (!current) return <ImagePlaceholder />;

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setViewing(images.indexOf(current))}
        aria-label="Phóng to ảnh"
        className="block w-full cursor-zoom-in rounded-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600"
        data-testid="gallery-main"
      >
        {/* `key` theo ảnh: đổi ảnh thì ProductImage dựng lại, trạng thái "tải hỏng" không dính sang */}
        {/* `priority` vì đây là ảnh lớn nhất nằm ngay đầu trang */}
        <ProductImage key={current.id} src={current.url} alt={title} {...MAIN_IMAGE} dark={dark} />
      </button>

      {images.length > 1 ? (
        <ThumbnailStrip images={images} title={title} active={active} onSelect={setActive} />
      ) : null}

      <Lightbox
        images={images}
        title={title}
        index={viewing}
        onIndexChange={onIndexChange}
        onClose={onClose}
      />
    </div>
  );
}

function ThumbnailStrip({
  images,
  title,
  active,
  onSelect,
}: {
  images: readonly GalleryImage[];
  title: string;
  active: number;
  onSelect: (index: number) => void;
}) {
  return (
    <ul className="flex gap-2 overflow-x-auto pb-1" aria-label="Các ảnh của sản phẩm">
      {images.map((image, index) => (
        <li key={image.id} className="shrink-0">
          <button
            type="button"
            onClick={() => onSelect(index)}
            aria-label={`Xem ảnh ${index + 1}`}
            aria-pressed={index === active}
            className={`relative block h-[72px] w-[72px] overflow-hidden rounded-md border-2 bg-raised transition ${
              index === active
                ? 'border-brand-600'
                : 'border-transparent opacity-70 hover:opacity-100'
            }`}
            data-testid="gallery-thumb"
          >
            <Image
              src={image.url}
              alt={`${title} — ảnh ${index + 1}`}
              fill
              sizes="72px"
              className="object-cover"
            />
          </button>
        </li>
      ))}
    </ul>
  );
}
