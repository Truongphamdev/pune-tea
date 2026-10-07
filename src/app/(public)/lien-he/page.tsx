import { PageHeader } from '@/components/PageHeader';
import { facebookPageUrl, SITE_ADDRESS, SITE_NAME } from '@/config/site';
import { Breadcrumbs } from '@/features/catalog/Breadcrumbs';
import { OrderSteps } from '@/features/shell/OrderSteps';
import { pageMetadata } from '@/features/seo/metadata';

export const metadata = pageMetadata({
  title: 'Liên hệ',
  description: `Liên hệ ${SITE_NAME} tại ${SITE_ADDRESS} qua Facebook page để được tư vấn chọn trà, hỏi về đơn hàng và xem hướng dẫn đặt hàng trong 3 bước.`,
  path: '/lien-he',
});

/**
 * Trang Liên hệ (FR-71). Kênh liên hệ duy nhất là Facebook page — không hiện số điện thoại hay
 * email vì khách chưa cung cấp, và không có form gửi thư.
 */
export default function ContactPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-10">
      <PageHeader
        title="Liên hệ"
        lead={`Cần tư vấn chọn trà hoặc hỏi về đơn hàng? Nhắn cho ${SITE_NAME} qua Facebook page.`}
      >
        <Breadcrumbs items={[{ href: '/', label: 'Trang chủ' }, { label: 'Liên hệ' }]} />
      </PageHeader>

      <ContactCard />

      <section aria-labelledby="order-guide" className="flex flex-col gap-6">
        <h2 id="order-guide" className="text-2xl font-bold text-brand-700">
          Hướng dẫn đặt hàng
        </h2>
        <OrderSteps />
      </section>
    </main>
  );
}

function ContactCard() {
  return (
    <section
      aria-labelledby="contact-info"
      className="grid gap-6 rounded-frame border border-line bg-surface p-6 md:grid-cols-[1fr_auto] md:items-center"
    >
      <div className="flex flex-col gap-3">
        <h2 id="contact-info" className="text-2xl font-bold text-brand-700">
          Thông tin liên hệ
        </h2>
        <dl className="flex flex-col gap-3 text-sm">
          <div>
            <dt className="text-xs font-semibold tracking-wide text-muted uppercase">
              Thương hiệu
            </dt>
            <dd className="text-base font-medium">{SITE_NAME}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-wide text-muted uppercase">Địa chỉ</dt>
            <dd className="text-base font-medium">{SITE_ADDRESS}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-wide text-muted uppercase">
              Kênh liên hệ
            </dt>
            <dd className="text-base font-medium">Facebook page {SITE_NAME}</dd>
          </div>
        </dl>
      </div>
      <a
        href={facebookPageUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full bg-brand-700 px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-600"
      >
        Mở Facebook page
      </a>
    </section>
  );
}
