import Image from 'next/image';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { SITE_NAME } from '@/config/site';
import { listCategories, listProductsByCategory } from '@/data/catalog';
import { Breadcrumbs } from '@/features/catalog/Breadcrumbs';
import { OrderSteps } from '@/features/shell/OrderSteps';
import { pageMetadata } from '@/features/seo/metadata';

export const metadata = pageMetadata({
  title: 'Giới thiệu',
  description: `Giới thiệu ${SITE_NAME}: ba dòng trà đóng gói sẵn gồm trà túi lọc, trà rời, trà hòa tan và cách đặt hàng qua Facebook page.`,
  path: '/gioi-thieu',
});

/** Trang Giới thiệu (FR-70) — chỉ nói điều khách cung cấp hoặc thấy trên bao bì (BR-01). */
export default function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-10">
      <div className="grid items-center gap-8 md:grid-cols-2">
        <PageHeader
          title={`Về ${SITE_NAME}`}
          lead={`${SITE_NAME} là thương hiệu trà đóng gói sẵn. Website này giới thiệu các gói trà của ${SITE_NAME} kèm quy cách và giá, để bạn chọn và đặt hàng thuận tiện.`}
        >
          <Breadcrumbs items={[{ href: '/', label: 'Trang chủ' }, { label: 'Giới thiệu' }]} />
        </PageHeader>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-frame bg-white shadow-lift">
          <Image
            src="/images/categories/tra-roi.jpg"
            alt={`Các gói trà nền ${SITE_NAME}: trà đen, trà Nhãn Vàng và trà ô long`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>

      <ProductLines />

      <Promises />

      <section aria-labelledby="how-to-order" className="flex flex-col gap-6">
        <h2 id="how-to-order" className="text-2xl font-bold text-brand-700">
          Đặt hàng trong 3 bước
        </h2>
        <OrderSteps />
      </section>
    </main>
  );
}

function ProductLines() {
  const categories = listCategories();

  return (
    <section aria-labelledby="lines" className="flex flex-col gap-6">
      <h2 id="lines" className="text-2xl font-bold text-brand-700">
        Ba dòng sản phẩm
      </h2>
      <ul className="grid gap-4 sm:grid-cols-3">
        {categories.map((category) => (
          <li
            key={category.slug}
            className="flex flex-col gap-2 rounded-card border border-line bg-surface p-5"
          >
            <h3 className="text-lg font-bold">
              <Link href={`/danh-muc/${category.slug}`} className="hover:text-accent">
                {category.name}
              </Link>
            </h3>
            <p className="text-sm leading-relaxed text-muted">{category.description}</p>
            <p className="mt-auto text-sm font-semibold text-accent">
              {listProductsByCategory(category.slug).length} sản phẩm · {category.format}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Promises() {
  return (
    <section aria-labelledby="promise" className="flex flex-col gap-4">
      <h2 id="promise" className="text-2xl font-bold text-brand-700">
        Cam kết của website
      </h2>
      <ul className="flex list-disc flex-col gap-2 ps-6 leading-relaxed">
        <li>Mỗi sản phẩm ghi rõ quy cách đóng gói và giá của từng lựa chọn.</li>
        <li>Thông tin mô tả lấy từ chữ in trên bao bì, không thêm công dụng không có căn cứ.</li>
        <li>
          Website không thu tiền trực tuyến: mọi đơn đều được shop xác nhận qua tin nhắn Facebook.
        </li>
        <li>Thông tin nhận hàng bạn điền chỉ dùng để soạn nội dung đơn, không được lưu lại.</li>
      </ul>
    </section>
  );
}
