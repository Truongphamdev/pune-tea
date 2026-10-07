import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { SITE_NAME } from '@/config/site';
import { ChangePasswordForm } from '@/features/auth/ChangePasswordForm';
import { LogoutButton } from '@/features/auth/LogoutButton';
import { OrderHistory } from '@/features/auth/OrderHistory';
import { Breadcrumbs } from '@/features/catalog/Breadcrumbs';
import { pageMetadata } from '@/features/seo/metadata';
import { getCurrentUser } from '@/server/current-user';
import { listOrdersByUser } from '@/server/orders';
import type { User } from '@/server/users';

export const metadata = pageMetadata({
  title: 'Tài khoản',
  description: `Thông tin tài khoản ${SITE_NAME} và lịch sử các đơn bạn đã đặt khi đang đăng nhập.`,
  path: '/tai-khoan',
  noindex: true,
});

/** Trang tài khoản: chưa đăng nhập thì đưa sang trang đăng nhập rồi quay lại đây. */
export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/dang-nhap?tiep=%2Ftai-khoan');

  const orders = await listOrdersByUser(user.id);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-10">
      <PageHeader title="Tài khoản">
        <Breadcrumbs items={[{ href: '/', label: 'Trang chủ' }, { label: 'Tài khoản' }]} />
      </PageHeader>

      <AccountCard user={user} />

      <section aria-labelledby="order-history" className="flex flex-col gap-5">
        <h2 id="order-history" className="text-2xl font-bold text-brand-700">
          Lịch sử đơn hàng ({orders.length})
        </h2>
        <OrderHistory orders={orders} />
      </section>

      <section
        aria-labelledby="change-password"
        className="flex flex-col gap-5 rounded-frame border border-line bg-surface p-6"
      >
        <h2 id="change-password" className="text-2xl font-bold text-brand-700">
          Đổi mật khẩu
        </h2>
        <ChangePasswordForm />
      </section>
    </main>
  );
}

function AccountCard({ user }: { user: User }) {
  return (
    <section
      aria-labelledby="account-info"
      className="flex flex-wrap items-center justify-between gap-4 rounded-frame border border-line bg-surface p-6"
    >
      <div className="flex flex-col gap-1">
        <h2 id="account-info" className="text-xl font-bold">
          {user.name}
        </h2>
        <p className="text-sm text-muted">{user.email}</p>
      </div>
      <LogoutButton />
    </section>
  );
}
