import { redirect } from 'next/navigation';
import { SITE_NAME } from '@/config/site';
import { RegisterForm } from '@/features/auth/AuthForms';
import { AuthPage } from '@/features/auth/AuthPage';
import { safeNextPath } from '@/features/auth/schemas';
import { pageMetadata } from '@/features/seo/metadata';
import { getCurrentUser } from '@/server/current-user';

export const metadata = pageMetadata({
  title: 'Đăng ký',
  description: `Tạo tài khoản ${SITE_NAME} chỉ với họ tên, email và mật khẩu — không cần xác minh email, dùng được ngay.`,
  path: '/dang-ky',
  noindex: true,
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function RegisterPage({ searchParams }: { searchParams: SearchParams }) {
  const next = safeNextPath((await searchParams).tiep);
  if (await getCurrentUser()) redirect(next);

  return (
    <AuthPage title="Đăng ký" lead="Tạo tài khoản là dùng được ngay, không cần xác minh email.">
      <RegisterForm next={next} />
    </AuthPage>
  );
}
