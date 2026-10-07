'use client';

import Image from 'next/image';
import { useState } from 'react';

/** Kích thước hiển thị theo từng vị trí — trình duyệt dùng để chọn đúng cỡ ảnh cần tải. */
const SIZES = {
  card: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
  detail: '(max-width: 1024px) 100vw, 50vw',
} as const;

export type ImageVariant = keyof typeof SIZES;

/**
 * Ảnh sản phẩm.
 *
 * Dùng `next/image` để có ba thứ mà thẻ `<img>` trần không có: nhiều kích cỡ qua `srcset`
 * (điện thoại không tải ảnh cỡ màn hình lớn), chuyển sang định dạng nén hiện đại khi trình
 * duyệt hỗ trợ, và tải trễ mặc định.
 *
 * `priority` chỉ bật cho ảnh LỚN NHẤT nằm ngay đầu trang chi tiết. Bật cho ảnh trong danh
 * sách sẽ khiến hai mươi ảnh cùng tranh băng thông ngay khi mở trang, và ảnh quan trọng
 * nhất về CHẬM hơn — đúng ngược lại điều mong muốn.
 *
 * ═══ Ảnh TẢI HỎNG cũng rơi về khung giữ chỗ ═══
 *
 * `src` là `null` khi sản phẩm chưa có ảnh — trường hợp dễ. Trường hợp khó là dữ liệu CÓ
 * đường dẫn nhưng file trong `public/` đã bị đổi tên hay xóa. Khi đó trình duyệt vẽ ô ảnh vỡ
 * — thứ trông hỏng hơn hẳn một khung "chưa có ảnh" gọn gàng. Bắt `onError` để hai trường hợp
 * cho ra cùng một kết quả nhìn thấy được.
 */
export function ProductImage({
  src,
  alt,
  variant = 'card',
  priority = false,
  dark = false,
}: {
  src: string | null;
  alt: string;
  variant?: ImageVariant;
  priority?: boolean;
  /** Ảnh nền đen (`imageBackground: 'dark'`) → khung nền tối để trông có chủ ý (BA §9). */
  dark?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) return <ImagePlaceholder />;

  return (
    // Ảnh quảng cáo nhiều tỉ lệ và có chữ: khung vuông + `object-contain` để không cắt mất chữ
    <div
      className={`relative aspect-square w-full overflow-hidden rounded-card ${dark ? 'bg-black' : 'bg-white'}`}
      data-dark={dark ? 'true' : 'false'}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={SIZES[variant]}
        priority={priority}
        onError={() => setFailed(true)}
        // `loading` do `priority` quyết định; đặt thêm ở đây sẽ xung đột với nó
        className="object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        data-testid="product-image"
      />
    </div>
  );
}

/**
 * Khung giữ chỗ khi sản phẩm chưa có ảnh.
 *
 * Hoạ tiết sọc chéo nhạt và một biểu tượng đơn giản — đủ để đọc ra "chưa có ảnh".
 */
export function ImagePlaceholder() {
  return (
    <div
      className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-card bg-raised"
      data-testid="product-image-placeholder"
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, var(--color-brand-500) 0 1px, transparent 1px 11px)',
        }}
      />
      <span className="relative flex flex-col items-center gap-1.5 text-muted">
        <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden="true">
          <path
            d="M12 3.5 20.5 8 12 12.5 3.5 8z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M3.5 12.5 12 17l8.5-4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-xs">Chưa có ảnh</span>
      </span>
    </div>
  );
}
