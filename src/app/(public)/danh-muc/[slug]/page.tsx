import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { SITE_NAME } from '@/config/site';
import { getCategoryBySlug, listCategories, listProductsByCategory } from '@/data/catalog';
import type { Category } from '@/data/types';
import { Breadcrumbs } from '@/features/catalog/Breadcrumbs';
import { ProductGrid } from '@/features/catalog/ProductGrid';
import { JsonLd } from '@/features/seo/JsonLd';
import { breadcrumbJsonLd } from '@/features/seo/json-ld';
import { pageMetadata } from '@/features/seo/metadata';

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return listCategories().map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const category = getCategoryBySlug((await params).slug);
  if (!category) return {};

  return pageMetadata({
    title: category.name,
    description: category.description,
    path: `/danh-muc/${category.slug}`,
    image: category.image,
  });
}

/** Trang danh mục (FR-23): ảnh bìa, mô tả, định dạng, lưới sản phẩm. */
export default async function CategoryPage({ params }: { params: Params }) {
  const category = getCategoryBySlug((await params).slug);
  if (!category) notFound();

  const products = listProductsByCategory(category.slug);
  const path = `/danh-muc/${category.slug}`;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Trang chủ', path: '/' },
          { name: 'Sản phẩm', path: '/san-pham' },
          { name: category.name, path },
        ])}
      />

      <div className="grid items-center gap-8 md:grid-cols-2">
        <PageHeader title={category.name} lead={category.description}>
          <Breadcrumbs
            items={[
              { href: '/', label: 'Trang chủ' },
              { href: '/san-pham', label: 'Sản phẩm' },
              { label: category.name },
            ]}
          />
        </PageHeader>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-frame bg-white shadow-lift">
          <Image
            src={category.image}
            alt={`Ảnh bìa dòng ${category.name} ${SITE_NAME}`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>

      <CategoryFacts category={category} productCount={products.length} />

      <section aria-labelledby="category-products" className="flex flex-col gap-6">
        <h2 id="category-products" className="text-2xl font-bold">
          Sản phẩm {category.name.toLowerCase()}
        </h2>
        <ProductGrid products={products} emptyMessage="Danh mục này chưa có sản phẩm." />
      </section>
    </main>
  );
}

function CategoryFacts({ category, productCount }: { category: Category; productCount: number }) {
  return (
    <dl className="flex flex-wrap gap-x-10 gap-y-3 rounded-card border border-line bg-raised/60 p-4 text-sm">
      <div>
        <dt className="text-xs font-semibold tracking-wide text-muted uppercase">Định dạng</dt>
        <dd className="font-medium">{category.format}</dd>
      </div>
      <div>
        <dt className="text-xs font-semibold tracking-wide text-muted uppercase">Quy cách chuẩn</dt>
        <dd className="font-medium">{category.standardPacking}</dd>
      </div>
      <div>
        <dt className="text-xs font-semibold tracking-wide text-muted uppercase">Số sản phẩm</dt>
        <dd className="font-medium">{productCount}</dd>
      </div>
    </dl>
  );
}
