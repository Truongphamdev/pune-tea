import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  articleLinks,
  articleText,
  articleWordCount,
  getArticleBySlug,
  listArticleProducts,
  listArticles,
  listOtherArticles,
  readingMinutes,
} from '@/data/articles';
import { getCategoryBySlug, getProductBySlug } from '@/data/catalog';

const PUBLIC = join(__dirname, '../../public');
const articles = listArticles();

describe('Bài viết — dữ liệu (FR-62)', () => {
  it('có ít nhất 5 bài, slug không trùng, mới nhất đứng trước', () => {
    expect(articles.length).toBeGreaterThanOrEqual(5);
    expect(new Set(articles.map((article) => article.slug)).size).toBe(articles.length);
    const dates = articles.map((article) => article.publishedAt);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it('đọc theo slug, slug lạ trả null', () => {
    expect(getArticleBySlug('cold-brew-la-gi-cach-u-tra-lanh')?.title).toContain('Cold brew');
    expect(getArticleBySlug('khong-co')).toBeNull();
  });

  it('bài khác không gồm chính nó', () => {
    const others = listOtherArticles(articles[0]?.slug ?? '', 3);
    expect(others).toHaveLength(3);
    expect(others.some((article) => article.slug === articles[0]?.slug)).toBe(false);
  });
});

describe.each(articles)('Chuẩn SEO của bài "$slug" (BA §8.2)', (article) => {
  it('tiêu đề ≤ 60 ký tự, mô tả 120–160 ký tự', () => {
    expect(article.title.length).toBeLessThanOrEqual(60);
    expect(article.description.length).toBeGreaterThanOrEqual(120);
    expect(article.description.length).toBeLessThanOrEqual(160);
  });

  it('từ 600 từ trở lên và có ít nhất 3 tiêu đề H2', () => {
    expect(articleWordCount(article)).toBeGreaterThanOrEqual(600);
    const h2 = article.body.filter((block) => block.type === 'heading' && block.level === 2);
    expect(h2.length).toBeGreaterThanOrEqual(3);
  });

  it('thứ bậc tiêu đề không nhảy cấp: H3 luôn đứng sau một H2', () => {
    let seenH2 = false;
    for (const block of article.body) {
      if (block.type !== 'heading') continue;
      if (block.level === 2) seenH2 = true;
      else expect(seenH2).toBe(true);
    }
  });

  it('ảnh bìa tồn tại thật và có alt; có ngày đăng, tác giả, thời gian đọc', () => {
    expect(existsSync(join(PUBLIC, article.cover))).toBe(true);
    expect(article.coverAlt.trim().length).toBeGreaterThan(10);
    expect(article.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(article.author.trim()).not.toBe('');
    expect(readingMinutes(article)).toBeGreaterThanOrEqual(1);
  });

  it('ít nhất 2 liên kết nội bộ, mọi liên kết trỏ tới sản phẩm/danh mục có thật', () => {
    const links = articleLinks(article);
    expect(links.length).toBeGreaterThanOrEqual(2);

    for (const href of links) {
      const [, section, slug] = href.split('/');
      const target =
        section === 'san-pham' ? getProductBySlug(slug ?? '') : getCategoryBySlug(slug ?? '');
      expect(target, href).not.toBeNull();
    }
  });

  it('sản phẩm liên quan đều tồn tại', () => {
    expect(listArticleProducts(article)).toHaveLength(article.relatedProductSlugs.length);
    expect(article.relatedProductSlugs.length).toBeGreaterThan(0);
  });
});

describe('Nội dung khớp chữ in trên ảnh (BA §7.7)', () => {
  it('công thức Nhãn Vàng: 2g, 100–150ml, 95–98°C, 3–10 phút', () => {
    const text = articleText(getArticleBySlug('cong-thuc-pha-tra-nhan-vang-chuan-vi')!);
    for (const fact of ['2g', '100–150ml', '95–98°C', '3–10 phút']) expect(text).toContain(fact);
  });

  it('ô long dưa hấu sả tắc: 100ml trà, 40ml đường, 40ml dưa hấu, 1 cây sả, 1 trái tắc', () => {
    const text = articleText(getArticleBySlug('cach-lam-o-long-dua-hau-sa-tac')!);
    for (const fact of [
      'Trà ô long: 100ml',
      'Đường: 40ml',
      'Dưa hấu: 40ml',
      'Sả cây: 1 cây',
      'Tắc: 1 trái',
    ]) {
      expect(text).toContain(fact);
    }
  });

  it('bài cold brew dùng con số 20 phút của bao bì, không nói ủ nhiều giờ', () => {
    const text = articleText(getArticleBySlug('cold-brew-la-gi-cach-u-tra-lanh')!);
    expect(text).toContain('20 phút');
    expect(text).not.toMatch(/\d+\s*(giờ|tiếng)/);
  });

  it('không bài nào khẳng định chữa bệnh (BR-02)', () => {
    for (const article of articles) {
      expect(articleText(article)).not.toMatch(/chữa (khỏi|bệnh)|điều trị bệnh|giải độc|giảm cân/i);
    }
  });
});
