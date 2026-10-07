import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getProductBySlug, listProducts } from '@/data/catalog';
import { listRelatedProducts } from '@/data/product-query';
import type { Product } from '@/data/types';
import { PurchasePanel } from '@/features/cart/PurchasePanel';
import { Breadcrumbs } from '@/features/catalog/Breadcrumbs';
import { ProductGallery } from '@/features/catalog/ProductGallery';
import { ProductGrid } from '@/features/catalog/ProductGrid';
import { ProductSpecs } from '@/features/catalog/ProductSpecs';
import { SectionHeading } from '@/features/home/SectionHeading';
import { JsonLd } from '@/features/seo/JsonLd';
import { breadcrumbJsonLd, productJsonLd } from '@/features/seo/json-ld';
import { pageMetadata } from '@/features/seo/metadata';

type Params = Promise<{ slug: string }>;

/** Slug ngoài danh sách dựng sẵn ra 404 thay vì dựng trang lúc chạy (FR-35). */
export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return listProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = getProductBySlug((await params).slug);
  if (!product) return {};

  const image = product.images[0];
  return pageMetadata({
    title: product.name,
    description: product.shortDescription,
    path: `/san-pham/${product.slug}`,
    ...(image ? { image } : {}),
  });
}

/** Trang chi tiết sản phẩm (FR-30…35). */
export default async function ProductPage({ params }: { params: Params }) {
  const product = getProductBySlug((await params).slug);
  if (!product) notFound();

  const category = getCategoryBySlug(product.categorySlug);
  const categoryName = category?.name ?? 'Sản phẩm';
  const categoryPath = category ? `/danh-muc/${category.slug}` : '/san-pham';
  const related = listRelatedProducts(product);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-10">
      <JsonLd data={productJsonLd(product, categoryName)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Trang chủ', path: '/' },
          { name: categoryName, path: categoryPath },
          { name: product.name, path: `/san-pham/${product.slug}` },
        ])}
      />

      <Breadcrumbs
        items={[
          { href: '/', label: 'Trang chủ' },
          { href: categoryPath, label: categoryName },
          { label: product.name },
        ]}
      />

      <ProductSummary product={product} />

      {related.length > 0 ? (
        <section aria-labelledby="related" className="border-t border-line pt-10">
          <SectionHeading id="related" title="Sản phẩm cùng danh mục" href={categoryPath} />
          <div className="mt-8">
            <ProductGrid products={related} emptyMessage="" />
          </div>
        </section>
      ) : null}
    </main>
  );
}

function ProductSummary({ product }: { product: Product }) {
  const images = product.images.map((url) => ({ id: url, url }));

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
      <ProductGallery
        images={images}
        title={product.name}
        dark={product.imageBackground === 'dark'}
      />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-3xl leading-tight font-bold text-brand-700 sm:text-4xl">
            {product.name}
          </h1>
          <p className="leading-relaxed text-muted">{product.shortDescription}</p>
        </div>

        <PurchasePanel product={product} />

        <ProductSpecs specs={product.specs} />

        <section aria-labelledby="description" className="flex flex-col gap-3">
          <h2 id="description" className="text-xl font-bold">
            Mô tả sản phẩm
          </h2>
          {product.description.map((paragraph) => (
            <p key={paragraph} className="leading-relaxed">
              {paragraph}
            </p>
          ))}
        </section>
      </div>
    </div>
  );
}
