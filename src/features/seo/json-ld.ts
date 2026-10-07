import { facebookPageUrl, SITE_ADDRESS, SITE_NAME, siteUrl } from '@/config/site';
import type { Article, Product } from '@/data/types';

/**
 * Các hàm dựng dữ liệu có cấu trúc (SEO-05). Thuần, trả object — in ra bằng `JsonLd`.
 */

const CONTEXT = 'https://schema.org';

function absolute(path: string): string {
  return `${siteUrl()}${path}`;
}

export function organizationJsonLd(): Record<string, unknown> {
  return {
    '@context': CONTEXT,
    '@type': 'Organization',
    name: SITE_NAME,
    url: siteUrl(),
    logo: absolute('/icon.svg'),
    address: { '@type': 'PostalAddress', addressLocality: SITE_ADDRESS, addressCountry: 'VN' },
    sameAs: [facebookPageUrl()],
  };
}

export interface BreadcrumbItem {
  readonly name: string;
  readonly path: string;
}

export function breadcrumbJsonLd(items: readonly BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absolute(item.path),
    })),
  };
}

/** Mỗi biến thể một `Offer` giá VND — sản phẩm nhiều quy cách có nhiều mức giá thật. */
export function productJsonLd(product: Product, categoryName: string): Record<string, unknown> {
  const url = absolute(`/san-pham/${product.slug}`);

  return {
    '@context': CONTEXT,
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription,
    image: product.images.map(absolute),
    category: categoryName,
    brand: { '@type': 'Brand', name: SITE_NAME },
    url,
    offers: product.variants.map((variant) => ({
      '@type': 'Offer',
      name: variant.label,
      price: variant.priceVnd,
      priceCurrency: 'VND',
      availability: 'https://schema.org/InStock',
      url,
    })),
  };
}

export function articleJsonLd(article: Article): Record<string, unknown> {
  return {
    '@context': CONTEXT,
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: [absolute(article.cover)],
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: { '@type': 'Organization', name: article.author },
    publisher: { '@type': 'Organization', name: SITE_NAME },
    mainEntityOfPage: absolute(`/bai-viet/${article.slug}`),
  };
}
