import { PageHeader } from '@/components/PageHeader';
import { Breadcrumbs } from '@/features/catalog/Breadcrumbs';

/** Khung chung của trang đăng nhập và đăng ký: tiêu đề, đường dẫn, thẻ chứa form. */
export function AuthPage({
  title,
  lead,
  children,
}: {
  title: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-12">
      <PageHeader title={title} lead={lead}>
        <Breadcrumbs items={[{ href: '/', label: 'Trang chủ' }, { label: title }]} />
      </PageHeader>
      <div className="rounded-frame border border-line bg-surface p-6 shadow-lift">{children}</div>
    </main>
  );
}
