/** Đầu trang nội dung: H1 duy nhất của trang (SEO-06) và một đoạn dẫn tùy chọn. */
export function PageHeader({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3">
      {children}
      <h1 className="font-display text-3xl leading-tight font-bold text-brand-700 sm:text-4xl">
        {title}
      </h1>
      <span aria-hidden="true" className="h-1 w-14 rounded-full bg-gold-400" />
      {lead ? <p className="max-w-2xl leading-relaxed text-muted">{lead}</p> : null}
    </header>
  );
}
