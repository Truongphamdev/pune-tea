import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { listCategories, listProducts } from '@/data/catalog';

/**
 * Kiểm dữ liệu tĩnh theo BA §5 và BR-03, BR-04 — đọc qua lớp đọc như mọi trang.
 */
const PUBLIC_DIR = join(__dirname, '../../public');
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const categories = listCategories();
const products = listProducts();

describe('danh mục (BA §5.2)', () => {
  it('đủ 3 danh mục đúng thứ tự, slug, tên, định dạng', () => {
    expect(categories.map((c) => [c.slug, c.name, c.format])).toEqual([
      ['tra-tui-loc', 'Trà túi lọc', 'Túi Ivory'],
      ['tra-roi', 'Trà rời', 'Túi'],
      ['tra-hoa-tan', 'Trà hòa tan', 'Túi Ivory'],
    ]);
  });

  it('ảnh bìa là ảnh bìa ngoài của nhóm, tồn tại thật', () => {
    for (const category of categories) {
      expect(category.image).toBe(`/images/categories/${category.slug}.jpg`);
      expect(existsSync(join(PUBLIC_DIR, category.image))).toBe(true);
      expect(category.description.length).toBeGreaterThan(0);
    }
  });
});

describe('sản phẩm (BA §5.3, BR-04)', () => {
  it('đủ 15 sản phẩm, slug duy nhất, không dấu, chữ thường, gạch nối (BR-03)', () => {
    const slugs = products.map((p) => p.slug);
    expect(slugs).toHaveLength(15);
    expect(new Set(slugs).size).toBe(15);
    for (const slug of slugs) expect(slug).toMatch(SLUG);
  });

  it('mỗi sản phẩm thuộc đúng một danh mục có thật', () => {
    const known = new Set(categories.map((c) => c.slug));
    for (const product of products) expect(known.has(product.categorySlug)).toBe(true);
  });

  it('mỗi sản phẩm có ít nhất 1 ảnh và mọi ảnh tồn tại thật trong public/', () => {
    for (const product of products) {
      expect(product.images.length).toBeGreaterThan(0);
      for (const image of product.images) {
        expect(existsSync(join(PUBLIC_DIR, image)), `${product.slug}: ${image}`).toBe(true);
      }
    }
  });

  it('ít nhất 1 biến thể; giá là số nguyên VND > 0; id biến thể duy nhất trong sản phẩm', () => {
    for (const product of products) {
      expect(product.variants.length).toBeGreaterThan(0);
      expect(new Set(product.variants.map((v) => v.id)).size).toBe(product.variants.length);
      for (const variant of product.variants) {
        expect(Number.isInteger(variant.priceVnd), product.slug).toBe(true);
        expect(variant.priceVnd).toBeGreaterThan(0);
        expect(variant.label.length).toBeGreaterThan(0);
      }
    }
  });

  it('có đủ chữ hiển thị: tên, mô tả ngắn, mô tả, thông số', () => {
    for (const product of products) {
      expect(product.name.length).toBeGreaterThan(0);
      expect(product.shortDescription.length).toBeGreaterThan(0);
      expect(product.description.length).toBeGreaterThan(0);
      expect(product.specs.length).toBeGreaterThan(0);
    }
  });

  it('số sản phẩm mỗi danh mục: 7 túi lọc, 5 trà rời, 3 hòa tan', () => {
    const count = (slug: string): number => products.filter((p) => p.categorySlug === slug).length;
    expect([count('tra-tui-loc'), count('tra-roi'), count('tra-hoa-tan')]).toEqual([7, 5, 3]);
  });

  it('sản phẩm nổi bật đúng #1, #5, #7, #9, #12, #13', () => {
    expect(products.filter((p) => p.featured).map((p) => p.slug)).toEqual([
      'tra-nhan-vang-gold-label',
      'tra-shan-tuyet-cold-brew',
      'tra-trai-cay-hop-thiec',
      'tra-lai-barista',
      'bot-matcha-barista',
      'tra-dao-hoa-tan',
    ]);
  });

  it('không còn sản phẩm nào dùng ảnh nền đen (khách đã gửi ảnh thay ngày 07/10/2026)', () => {
    expect(products.filter((p) => p.imageBackground === 'dark')).toEqual([]);
  });
});

describe('giá và biến thể khớp bảng §5.3', () => {
  const priceOf = (slug: string): number[] =>
    (products.find((p) => p.slug === slug)?.variants ?? []).map((v) => v.priceVnd);

  it.each([
    ['tra-nhan-vang-gold-label', [89_000]],
    ['tra-huong-mang-cau', [39_000]],
    ['tra-hoa-dau-biec', [45_000]],
    ['tra-gung', [39_000]],
    ['tra-shan-tuyet-cold-brew', [65_000]],
    ['tra-matcha-gao-rang-cold-brew', [59_000]],
    ['tra-trai-cay-hop-thiec', [185_000]],
    ['tra-den-barista', [69_000]],
    ['tra-lai-barista', [149_000]],
    ['tra-o-long-lai-barista', [169_000]],
    ['tra-gao-rang-matcha', [99_000]],
    ['bot-matcha-barista', [189_000]],
    ['tra-dao-hoa-tan', [45_000, 58_000]],
    ['tra-sam-bi-dao-hoa-tan', [45_000, 58_000]],
    ['tra-hoa-tan-vi-hoa-qua', [58_000, 58_000, 58_000, 58_000, 58_000, 58_000]],
  ])('%s', (slug, prices) => {
    expect(priceOf(slug)).toEqual(prices);
  });

  it('trà hòa tan hai quy cách 180g / 240g', () => {
    const dao = products.find((p) => p.slug === 'tra-dao-hoa-tan');
    expect(dao?.variants.map((v) => v.label)).toEqual([
      '180g (12 gói × 15g)',
      '240g (16 gói × 15g)',
    ]);
  });

  it('trà hòa tan vị hoa quả: 6 vị, ảnh nhóm trà hòa tan', () => {
    const fruit = products.find((p) => p.slug === 'tra-hoa-tan-vi-hoa-qua');
    expect(fruit?.variants.map((v) => v.label)).toEqual([
      'Vị Vải',
      'Vị Dâu',
      'Vị Chanh',
      'Vị Chanh dây',
      'Vị Ổi hồng',
      'Vị Chanh hương nhài',
    ]);
    expect(fruit?.images[0]).toBe('/images/categories/tra-hoa-tan.jpg');
  });
});

describe('tên và nhãn quy cách khớp bảng §5.3 (R-M1-05)', () => {
  it.each([
    ['tra-nhan-vang-gold-label', 'Trà Nhãn Vàng Gold Label', ['200g (100 túi × 2g)']],
    ['tra-huong-mang-cau', 'Trà Hương Mãng Cầu', ['50g (25 túi lọc)']],
    ['tra-hoa-dau-biec', 'Trà Hoa Đậu Biếc', ['40g (20 túi)']],
    ['tra-gung', 'Trà Gừng', ['40g (20 túi)']],
    ['tra-shan-tuyet-cold-brew', 'Trà Shan Tuyết Cold Brew', ['42g (12 gói × 3,5g)']],
    ['tra-matcha-gao-rang-cold-brew', 'Trà Matcha Gạo Rang Cold Brew', ['42g (12 gói × 3,5g)']],
    ['tra-trai-cay-hop-thiec', 'Trà Trái Cây Hộp Thiếc Cao Cấp', ['Hộp thiếc, túi lọc pyramid']],
    ['tra-den-barista', 'Trà Đen Barista', ['Túi 200g']],
    ['tra-lai-barista', 'Trà Lài Barista', ['Túi 500g']],
    ['tra-o-long-lai-barista', 'Trà Ô Long Lài Barista', ['Túi 500g']],
    ['tra-gao-rang-matcha', 'Trà Gạo Rang Matcha (Genmaicha)', ['Túi 200g']],
    ['bot-matcha-barista', 'Bột Matcha Barista', ['Gói 200g']],
    ['tra-dao-hoa-tan', 'Trà Đào Hòa Tan', ['180g (12 gói × 15g)', '240g (16 gói × 15g)']],
    [
      'tra-sam-bi-dao-hoa-tan',
      'Trà Sâm Bí Đao Hòa Tan',
      ['180g (12 gói × 15g)', '240g (16 gói × 15g)'],
    ],
  ])('%s', (slug, name, labels) => {
    const product = products.find((p) => p.slug === slug);
    expect(product?.name).toBe(name);
    expect(product?.variants.map((v) => v.label)).toEqual(labels);
  });

  it('tên #15 đúng bảng', () => {
    expect(products.find((p) => p.slug === 'tra-hoa-tan-vi-hoa-qua')?.name).toBe(
      'Trà Hòa Tan Vị Hoa Quả',
    );
  });
});

describe('nội dung mô tả theo BR-01 / BR-02', () => {
  const textOf = (slug: string): string => {
    const product = products.find((p) => p.slug === slug);
    return [product?.shortDescription, ...(product?.description ?? [])].join(' ');
  };

  it('hai sản phẩm cold brew ghi đúng "20 phút" như bao bì, không nói ủ nhiều giờ (R-M1-01)', () => {
    for (const slug of ['tra-shan-tuyet-cold-brew', 'tra-matcha-gao-rang-cold-brew']) {
      expect(textOf(slug)).toMatch(/20 phút/);
      expect(textOf(slug)).not.toMatch(/giờ/);
    }
  });

  it('không chép câu công dụng sức khỏe hay danh hiệu từ ảnh quảng cáo', () => {
    const all = [
      ...products.map((p) => textOf(p.slug)),
      ...categories.map((c) => c.description),
    ].join(' ');
    expect(all).not.toMatch(
      /thanh nhiệt|giải độc|đẹp da|giữ dáng|chữa|có lợi cho sức khỏe|ít calo|thương hiệu quốc gia/i,
    );
  });
});
