import { facebookPageUrl, SITE_ADDRESS, SITE_NAME } from '@/config/site';
import { listArticles } from '@/data/articles';
import { listCategories, listFeaturedProducts, listProductsByCategory } from '@/data/catalog';
import { ArticleGrid } from '@/features/articles/ArticleCard';
import { ProductGrid } from '@/features/catalog/ProductGrid';
import { BrandStory } from '@/features/home/BrandStory';
import { CategoryTiles } from '@/features/home/CategoryTiles';
import { FacebookCta } from '@/features/home/FacebookCta';
import { Hero } from '@/features/home/Hero';
import { SectionHeading } from '@/features/home/SectionHeading';
import { JsonLd } from '@/features/seo/JsonLd';
import { organizationJsonLd } from '@/features/seo/json-ld';
import { pageMetadata } from '@/features/seo/metadata';

/** Số bài viết mới nhất hiện trên trang chủ (FR-14). */
const HOME_ARTICLE_LIMIT = 3;

export const metadata = {
  ...pageMetadata({
    title: `${SITE_NAME} — Trà túi lọc, trà rời, trà hòa tan`,
    description: `${SITE_NAME} — trà túi lọc, trà rời và trà hòa tan đóng gói sẵn. Xem giá từng gói trà, bỏ giỏ hàng và đặt hàng nhanh qua Facebook page.`,
    path: '/',
  }),
  // Trang chủ dùng nguyên tiêu đề, không gắn thêm hậu tố tên site
  title: { absolute: `${SITE_NAME} — Trà túi lọc, trà rời, trà hòa tan` },
};

/** Trang chủ — thứ tự khối theo BA §7.2 (FR-10…15). */
export default function HomePage() {
  const tiles = listCategories().map((category) => ({
    category,
    productCount: listProductsByCategory(category.slug).length,
  }));

  return (
    <main>
      <JsonLd data={organizationJsonLd()} />
      <Hero
        eyebrow={`${SITE_NAME} · ${SITE_ADDRESS}`}
        title="Trà nền chuẩn vị Việt"
        subtitle="Trà túi lọc, trà rời và trà hòa tan đóng gói sẵn — chọn gói trà bạn thích, bỏ vào giỏ và đặt hàng qua Facebook."
        image="/images/categories/tra-roi.jpg"
        imageAlt={`Các gói trà nền ${SITE_NAME} đặt giữa đồi chè xanh`}
        actions={[
          { href: '/san-pham', label: 'Xem sản phẩm' },
          { href: '/bai-viet', label: 'Đọc bài viết' },
        ]}
      />

      <div className="mx-auto w-full max-w-6xl px-4">
        <CategoryTiles
          tiles={tiles}
          intro={`Ba dòng trà của ${SITE_NAME}: trà túi lọc tiện cho từng ly, trà rời cho ấm trà và pha chế, trà hòa tan cho lúc cần nhanh.`}
        />

        <section aria-labelledby="featured" className="border-t border-line py-14">
          <SectionHeading id="featured" title="Sản phẩm nổi bật" href="/san-pham" centered />
          <div className="mt-8">
            <ProductGrid products={listFeaturedProducts()} emptyMessage="" />
          </div>
        </section>
      </div>

      <BrandStory />

      <div className="mx-auto w-full max-w-6xl px-4">
        <section aria-labelledby="articles" className="py-14">
          <SectionHeading id="articles" title="Tin tức & bài viết" href="/bai-viet" centered />
          <div className="mt-8">
            <ArticleGrid articles={listArticles().slice(0, HOME_ARTICLE_LIMIT)} />
          </div>
        </section>
      </div>

      <FacebookCta facebookUrl={facebookPageUrl()} />
    </main>
  );
}
