'use client';

import Image from 'next/image';
import { useState } from 'react';

/**
 * Ảnh nền phủ kín một ô — dùng cho ô danh mục và băng đầu trang.
 *
 * Tải hỏng thì KHÔNG vẽ gì cả, để lớp nền phía dưới (quầng màu thương hiệu) lộ ra. Ô ảnh
 * vỡ trên nền tối trông như trang hỏng; nền màu trơn thì đọc ra là "chưa có ảnh", và đó là
 * sự thật. Ảnh có thể mất khi file trong `public/` bị đổi tên mà dữ liệu chưa sửa theo.
 */
export function CoverImage({
  src,
  alt,
  sizes,
  className,
  priority = false,
}: {
  src: string;
  /** Mô tả ảnh — ảnh ở đây là ảnh nội dung (bìa danh mục, banner), không phải trang trí. */
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
      {...(className ? { className } : {})}
    />
  );
}
