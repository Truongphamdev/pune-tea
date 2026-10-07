import Link from 'next/link';

/**
 * Trạng thái rỗng là lời mời, không phải báo cáo.
 *
 * "Bạn chưa có đơn hàng nào." đúng nhưng là ngõ cụt: nó nói cho khách biết họ KHÔNG có gì
 * mà không nói đi đâu để có. Mọi màn hình rỗng (giỏ trống, lọc không ra kết quả) dùng chung
 * khuôn này để không trang nào thành ngõ cụt.
 */
export function EmptyState({
  message,
  actionLabel,
  actionHref,
  testId,
}: {
  message: string;
  actionLabel: string;
  actionHref: string;
  testId: string;
}) {
  return (
    <section
      className="flex flex-col items-center gap-4 rounded-frame border border-dashed border-line px-6 py-16 text-center"
      data-testid={testId}
    >
      <p className="max-w-sm text-sm text-muted">{message}</p>

      <Link
        href={actionHref}
        className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
      >
        {actionLabel}
      </Link>
    </section>
  );
}
