import Image from 'next/image';
import { SITE_NAME } from '@/config/site';

/** Kích thước gốc của hai file logo trong `public/brand/` — để trình duyệt giữ chỗ đúng tỉ lệ. */
const LOGO = { src: '/brand/logo.png', width: 458, height: 308 } as const;
const LOGO_OUTLINE = { src: '/brand/logo-outline.png', width: 482, height: 332 } as const;

/**
 * Logo Puni Tea do khách gửi (07/10/2026), đã tách nền.
 *
 * Hai bản: bản thường cho nền sáng, và bản có viền trắng (`onDark`) cho nền xanh của thanh đầu
 * trang và chân trang — huy hiệu vốn màu xanh, đặt thẳng lên nền xanh thì chìm mất.
 *
 * Chiều cao do `className` quyết định (`h-10`, `h-14`…), bề ngang tự theo tỉ lệ.
 */
export function BrandLogo({
  className = 'h-10',
  onDark = false,
  priority = false,
}: {
  className?: string;
  onDark?: boolean;
  priority?: boolean;
}) {
  const logo = onDark ? LOGO_OUTLINE : LOGO;

  return (
    <Image
      src={logo.src}
      alt={SITE_NAME}
      width={logo.width}
      height={logo.height}
      priority={priority}
      sizes="160px"
      // `self-start` + `shrink-0`: trong khung flex cột, ảnh mặc định bị kéo giãn hết bề ngang
      className={`w-auto shrink-0 self-start object-contain ${className}`}
    />
  );
}
