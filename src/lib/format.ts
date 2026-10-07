/**
 * Định dạng hiển thị.
 *
 * Tiền là số nguyên VND kiểu `number` trong toàn bộ dữ liệu (giá trà không bao giờ vượt 2^53),
 * và chỉ được đổi sang chuỗi ở đúng đây, ngay trước khi hiển thị.
 */

export function formatVnd(amount: number): string {
  // Dữ liệu hỏng (NaN, Infinity) hiện gạch ngang — "NaN ₫" trên thẻ giá trông như trang vỡ
  if (!Number.isFinite(amount)) return '— ₫';

  return `${amount.toLocaleString('vi-VN')} ₫`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return '—';

  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
