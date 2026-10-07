import { redirect } from 'next/navigation';
import { SITE_NAME } from '@/config/site';
import { LoginForm } from '@/features/auth/AuthForms';
import { AuthPage } from '@/features/auth/AuthPage';
import { safeNextPath } from '@/features/auth/schemas';
import { pageMetadata } from '@/features/seo/metadata';
import { getCurrentUser } from '@/server/current-user';

export const metadata = pageMetadata({
  title: 'Đăng nhập',
  description: `Đăng nhập tài khoản ${SITE_NAME} để thêm trà vào giỏ, đặt hàng và xem lại lịch sử đơn của bạn.`,
  path: '/dang-nhap',
  noindex: true,
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const next = safeNextPath((await searchParams).tiep);
  // Đã đăng nhập rồi thì không hiện lại form
  if (await getCurrentUser()) redirect(next);

  return (
    <AuthPage
      title="Đăng nhập"
      lead="Đăng nhập để thêm trà vào giỏ, đặt hàng và xem lại lịch sử đơn."
    >
      <LoginForm next={next} />
    </AuthPage>
  );
}
