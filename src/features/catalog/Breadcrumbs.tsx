import Link from 'next/link';

export interface Crumb {
  readonly href?: string;
  readonly label: string;
}

/**
 * Đường dẫn phân cấp.
 *
 * Khách vào thẳng trang sản phẩm từ Google hay từ link chia sẻ thì không có gì cho biết mình
 * đang ở đâu trong cửa hàng — và không có đường nào sang hàng cùng loại ngoài nút Quay lại
 * của trình duyệt. Mục cuối không phải liên kết: bấm vào chính trang đang mở là một cú
 * nhấp không đi đâu cả.
 */
export function Breadcrumbs({ items }: { items: readonly Crumb[] }) {
  return (
    <nav aria-label="Đường dẫn" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1.5 text-muted">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {index > 0 ? (
              <span aria-hidden="true" className="text-line">
                /
              </span>
            ) : null}
            {item.href ? (
              <Link href={item.href} className="transition-colors duration-200 hover:text-accent">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
