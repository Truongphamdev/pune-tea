import Image from 'next/image';
import Link from 'next/link';
import { SITE_ADDRESS, SITE_NAME } from '@/config/site';
import { SectionHeading } from './SectionHeading';

/** Khối câu chuyện thương hiệu trên trang chủ (FR-13): chữ + ảnh, dẫn sang trang Giới thiệu. */
export function BrandStory() {
  return (
    <section aria-labelledby="brand-story" className="bg-raised/70">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-frame bg-white shadow-lift">
          <Image
            src="/images/categories/tra-tui-loc.jpg"
            alt={`Các hộp trà túi lọc ${SITE_NAME} trên nền cỏ xanh`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col items-start gap-4">
          <SectionHeading id="brand-story" eyebrow={SITE_ADDRESS} title={`Về ${SITE_NAME}`} />
          <p className="leading-relaxed">
            {SITE_NAME} mang đến ba dòng trà đóng gói sẵn: trà túi lọc cho từng ly gọn gàng, trà rời
            cho ấm trà và quầy pha chế, trà hòa tan cho những lúc cần nhanh.
          </p>
          <p className="leading-relaxed text-muted">
            Mỗi sản phẩm trên website đều ghi rõ quy cách và giá để bạn dễ chọn. Cần tư vấn thêm,
            bạn chỉ việc nhắn cho shop qua Facebook page.
          </p>
          <Link
            href="/gioi-thieu"
            className="rounded-full border border-brand-700 px-5 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
          >
            Tìm hiểu thêm
          </Link>
        </div>
      </div>
    </section>
  );
}
