import { SITE_NAME } from '@/config/site';

/**
 * Nhận diện Puni Tea — wordmark chữ "Puni Tea" kèm hình lá đơn giản tự dựng (BA BR-05: khách
 * chưa gửi file logo nên không vẽ lại logo trong ảnh bao bì).
 *
 * Lá tô `currentColor`; nơi dùng chọn màu (vàng trên nền xanh, xanh trên nền sáng).
 */
export function BrandMark({ className = 'size-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true" focusable="false">
      <path
        d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M5 19 14 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Tên shop bằng chữ thật (không phải ảnh) — trình đọc màn hình đọc được ngay khi nó là nội dung
 * duy nhất của link về trang chủ.
 */
function BrandWordmark({ className = 'text-xl' }: { className?: string }) {
  return <span className={`font-display font-bold tracking-tight ${className}`}>{SITE_NAME}</span>;
}

/** Lá + chữ, dùng ở header và footer. Màu lá vàng: tương phản 4.78:1 trên nền xanh brand-700. */
export function BrandLockup({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <span className="flex items-center gap-2">
      <BrandMark className={`${size === 'lg' ? 'size-9' : 'size-8'} text-gold-400`} />
      <BrandWordmark className={size === 'lg' ? 'text-2xl' : 'text-xl'} />
    </span>
  );
}
