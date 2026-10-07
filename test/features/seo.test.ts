import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';
import { listArticles } from '@/data/articles';
import { getProductBySlug, listCategories, listProducts } from '@/data/catalog';
import { productsHref } from '@/data/product-query';
import { serializeJsonLd } from '@/features/seo/JsonLd';
import {
  articleJsonLd,
  breadcrumbJsonLd,
  organizationJsonLd,
  productJsonLd,
} from '@/features/seo/json-ld';
import { pageMetadata } from '@/features/seo/metadata';

const BASE = 'http://localhost:3010';

describe('sitemap (SEO-03)', () => {
  const urls = sitemap().map((entry) => entry.url);

  it('sinh từ dữ liệu: đủ trang tĩnh, danh mục, sản phẩm và bài viết', () => {
    const expected = 5 + listCategories().length + listProducts().length + listArticles().length;
    expect(urls).toHaveLength(expected);
    expect(new Set(urls).size).toBe(expected);
    expect(urls).toContain(BASE);
    expect(urls).toContain(`${BASE}/san-pham/tra-gung`);
    expect(urls).toContain(`${BASE}/danh-muc/tra-roi`);
    expect(urls).toContain(`${BASE}/bai-viet/cold-brew-la-gi-cach-u-tra-lanh`);
  });

  it('không có trang giỏ hàng', () => {
    expect(urls.some((url) => url.includes('gio-hang'))).toBe(false);
  });
});

describe('JSON-LD (SEO-05)', () => {
  it('Organization có tên, URL và link Facebook', () => {
    const data = organizationJsonLd();
    expect(data['@type']).toBe('Organization');
    expect(data.url).toBe(BASE);
    expect(data.sameAs).toEqual([expect.stringMatching(/^https:\/\/www\.facebook\.com\//)]);
  });

  it('Product: mỗi biến thể một Offer giá VND', () => {
    const product = getProductBySlug('tra-dao-hoa-tan');
    if (!product) throw new Error('thiếu dữ liệu');
    const data = productJsonLd(product, 'Trà hòa tan');

    expect(data['@type']).toBe('Product');
    expect(data.image).toEqual([`${BASE}/images/products/tra-dao-hoa-tan.jpg`]);
    expect(data.offers).toEqual([
      expect.objectContaining({ '@type': 'Offer', price: 45_000, priceCurrency: 'VND' }),
      expect.objectContaining({ '@type': 'Offer', price: 58_000, priceCurrency: 'VND' }),
    ]);
  });

  it('Article và BreadcrumbList dùng URL tuyệt đối', () => {
    const [article] = listArticles();
    if (!article) throw new Error('thiếu bài viết');
    expect(articleJsonLd(article)).toMatchObject({
      '@type': 'Article',
      headline: article.title,
      datePublished: article.publishedAt,
      mainEntityOfPage: `${BASE}/bai-viet/${article.slug}`,
    });

    const crumbs = breadcrumbJsonLd([
      { name: 'Trang chủ', path: '/' },
      { name: 'Sản phẩm', path: '/san-pham' },
    ]);
    expect(crumbs.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: 'Sản phẩm', item: `${BASE}/san-pham` },
    ]);
  });

  it('thoát ký tự < để không đóng sớm thẻ script (NFR-05)', () => {
    const out = serializeJsonLd({ name: '</script><script>alert(1)</script>' });
    expect(out).not.toContain('<');
    expect(JSON.parse(out)).toEqual({ name: '</script><script>alert(1)</script>' });
  });
});

describe('pageMetadata (SEO-01, SEO-02)', () => {
  it('có canonical, Open Graph và Twitter; ảnh riêng khi được đưa vào', () => {
    const meta = pageMetadata({
      title: 'Trà Gừng',
      description: 'Mô tả',
      path: '/san-pham/tra-gung',
      image: '/images/products/tra-gung.jpg',
    });

    expect(meta.alternates?.canonical).toBe('/san-pham/tra-gung');
    expect(meta.openGraph).toMatchObject({ title: 'Trà Gừng', url: '/san-pham/tra-gung' });
    expect(meta.twitter).toMatchObject({ images: ['/images/products/tra-gung.jpg'] });
    expect(meta.robots).toBeUndefined();
  });

  it('trang không có ảnh riêng vẫn có ảnh chia sẻ mặc định (R-F-02)', () => {
    const meta = pageMetadata({ title: 'Liên hệ', description: 'x', path: '/lien-he' });

    expect(meta.openGraph).toMatchObject({ images: [{ url: '/opengraph-image' }] });
    expect(meta.twitter).toMatchObject({ images: ['/twitter-image'] });
  });

  it('noindex cho trang giỏ hàng', () => {
    const meta = pageMetadata({
      title: 'Giỏ hàng',
      description: 'x',
      path: '/gio-hang',
      noindex: true,
    });
    expect(meta.robots).toEqual({ index: false, follow: true });
  });
});

describe('productsHref (FR-21)', () => {
  it('bỏ tham số rỗng và giá trị mặc định', () => {
    expect(productsHref({})).toBe('/san-pham');
    expect(productsHref({ q: '  ', sort: 'mac-dinh' })).toBe('/san-pham');
    expect(productsHref({ q: 'trà đào', categorySlug: 'tra-hoa-tan', sort: 'gia-tang' })).toBe(
      '/san-pham?q=tr%C3%A0+%C4%91%C3%A0o&danh-muc=tra-hoa-tan&sort=gia-tang',
    );
  });
});
