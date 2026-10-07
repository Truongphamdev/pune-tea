import { getCategoryBySlug, getProductBySlug } from '@/data/catalog';
import type { ArticleBlock } from '@/data/types';
import { countWords } from '@/lib/text';
import { parseMarkup } from './markup';

/** Ngưỡng chuẩn một bài viết — BA §8.2. Dùng chung cho form (chấm trực tiếp) và máy chủ (chặn đăng). */
export const SEO_LIMITS = {
  titleMax: 60,
  descriptionMin: 120,
  descriptionMax: 160,
  wordsMin: 600,
  h2Min: 3,
  internalLinksMin: 2,
  coverAltMin: 10,
} as const;

export interface SeoDraft {
  readonly title: string;
  readonly description: string;
  readonly coverAlt: string;
  readonly body: string;
}

export interface SeoCheck {
  readonly id: string;
  readonly label: string;
  readonly ok: boolean;
  /** Con số hiện tại, để người viết biết còn thiếu bao nhiêu. */
  readonly detail: string;
}

function blockText(block: ArticleBlock): string {
  if (block.type === 'heading') return block.text;
  if (block.type === 'list') return block.items.join(' ');
  if (block.type === 'paragraph') {
    return block.content.map((part) => (typeof part === 'string' ? part : part.text)).join('');
  }
  return '';
}

/** Liên kết trỏ tới một sản phẩm hoặc danh mục CÓ THẬT. */
function isCatalogLink(href: string): boolean {
  const [, section, slug = ''] = href.split(/[?#]/)[0]?.split('/') ?? [];
  if (section === 'san-pham') return getProductBySlug(slug) !== null;
  return section === 'danh-muc' && getCategoryBySlug(slug) !== null;
}

function countCatalogLinks(blocks: readonly ArticleBlock[]): number {
  return blocks
    .flatMap((block) => (block.type === 'paragraph' ? block.content : []))
    .filter((part) => typeof part !== 'string' && isCatalogLink(part.href)).length;
}

/** Thứ bậc tiêu đề không nhảy cấp: mọi H3 phải đứng sau ít nhất một H2. */
function headingOrderOk(blocks: readonly ArticleBlock[]): boolean {
  let seenH2 = false;
  for (const block of blocks) {
    if (block.type !== 'heading') continue;
    if (block.level === 2) seenH2 = true;
    else if (!seenH2) return false;
  }
  return true;
}

/** Các con số đo được từ một bản nháp. */
function measure(draft: SeoDraft) {
  const blocks = parseMarkup(draft.body);
  return {
    title: draft.title.trim().length,
    description: draft.description.trim().length,
    words: countWords(blocks.map(blockText).join(' ')),
    h2: blocks.filter((block) => block.type === 'heading' && block.level === 2).length,
    links: countCatalogLinks(blocks),
    alt: draft.coverAlt.trim().length,
    headingOrder: headingOrderOk(blocks),
  };
}

function check(id: string, label: string, ok: boolean, detail = ''): SeoCheck {
  return { id, label, ok, detail };
}

/** Chấm một bản nháp theo chuẩn bài viết SEO của site. */
export function checkSeo(draft: SeoDraft): SeoCheck[] {
  const L = SEO_LIMITS;
  const m = measure(draft);
  const descriptionOk = m.description >= L.descriptionMin && m.description <= L.descriptionMax;

  return [
    check(
      'title',
      `Tiêu đề 1–${L.titleMax} ký tự`,
      m.title > 0 && m.title <= L.titleMax,
      `${m.title} ký tự`,
    ),
    check(
      'description',
      `Mô tả ${L.descriptionMin}–${L.descriptionMax} ký tự`,
      descriptionOk,
      `${m.description} ký tự`,
    ),
    check('words', `Nội dung từ ${L.wordsMin} từ`, m.words >= L.wordsMin, `${m.words} từ`),
    check('h2', `Ít nhất ${L.h2Min} tiêu đề mục (##)`, m.h2 >= L.h2Min, `${m.h2} tiêu đề`),
    check('heading-order', 'Tiêu đề nhỏ (###) nằm sau tiêu đề mục', m.headingOrder),
    check(
      'links',
      `Ít nhất ${L.internalLinksMin} liên kết tới sản phẩm/danh mục`,
      m.links >= L.internalLinksMin,
      `${m.links} liên kết`,
    ),
    check(
      'cover-alt',
      `Mô tả ảnh bìa từ ${L.coverAltMin} ký tự`,
      m.alt >= L.coverAltMin,
      `${m.alt} ký tự`,
    ),
  ];
}

export function seoPassed(checks: readonly SeoCheck[]): boolean {
  return checks.every((check) => check.ok);
}
