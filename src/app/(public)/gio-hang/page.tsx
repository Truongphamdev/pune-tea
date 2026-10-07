import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { facebookPageUrl, SITE_NAME } from '@/config/site';
import { CartPageView } from '@/features/cart/CartPageView';
import { Breadcrumbs } from '@/features/catalog/Breadcrumbs';
import { pageMetadata } from '@/features/seo/metadata';
import { getCurrentUser } from '@/server/current-user';

export const metadata = pageMetadata({
  title: 'Giỏ hàng',
  description: `Xem lại các gói trà trong giỏ, chỉnh số lượng và gửi đơn cho ${SITE_NAME} qua Facebook page. Website không thu tiền trực tuyến.`,
  path: '/gio-hang',
  // Nội dung riêng từng trình duyệt — không đáng lập chỉ mục (BA §6)
  noindex: true,
});

/**
 * Trang giỏ hàng & đặt hàng (FR-42…54, FR-84). Phải đăng nhập: chưa thì sang trang đăng nhập rồi
 * quay lại đây. Nội dung giỏ dựng ở trình duyệt vì giỏ nằm trong localStorage.
 */
export default async function CartPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/dang-nhap?tiep=%2Fgio-hang');

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <PageHeader title="Giỏ hàng">
        <Breadcrumbs items={[{ href: '/', label: 'Trang chủ' }, { label: 'Giỏ hàng' }]} />
      </PageHeader>
      <CartPageView facebookUrl={facebookPageUrl()} customerName={user.name} />
    </main>
  );
}
