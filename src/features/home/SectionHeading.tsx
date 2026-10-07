import Link from 'next/link';

/**
 * Tiêu đề khối: nhãn nhỏ phía trên, tiêu đề lớn, gạch vàng nhỏ bên dưới.
 *
 * `centered` canh giữa theo phong cách tham chiếu (BA §9); khi đó liên kết "xem tất cả" nằm
 * dưới tiêu đề thay vì bên phải.
 */
export function SectionHeading({
  id,
  eyebrow,
  title,
  href,
  linkLabel = 'Xem tất cả →',
  centered = false,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
  centered?: boolean;
}) {
  const link = href ? (
    <Link
      href={href}
      className="rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 transition-colors duration-200 hover:bg-brand-100"
    >
      {linkLabel}
    </Link>
  ) : null;

  return (
    <div
      className={
        centered
          ? 'flex flex-col items-center gap-3 text-center'
          : 'flex flex-wrap items-end justify-between gap-3'
      }
    >
      <div className={`flex flex-col gap-2 ${centered ? 'items-center' : ''}`}>
        {eyebrow ? (
          <span className="text-xs font-semibold tracking-[0.12em] text-accent uppercase">
            {eyebrow}
          </span>
        ) : null}
        <h2 id={id} className="font-display text-2xl font-bold text-brand-700 sm:text-3xl">
          {title}
        </h2>
        <span aria-hidden="true" className="h-1 w-14 rounded-full bg-gold-400" />
      </div>
      {link}
    </div>
  );
}
