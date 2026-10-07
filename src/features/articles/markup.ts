import { isSiteImage } from '@/data/images';
import type { ArticleBlock, ArticleInline } from '@/data/types';

/**
 * Cú pháp soạn bài — một tập con rất nhỏ của Markdown, đủ cho bài viết về trà:
 *
 *   ## Tiêu đề mục            ### Tiêu đề nhỏ
 *   - gạch đầu dòng           1. danh sách có số
 *   [chữ liên kết](/san-pham/tra-gung)
 *   ![mô tả ảnh](/images/products/tra-gung-v2.jpg)
 *   (dòng trống ngăn cách các đoạn)
 *
 * Kết quả là mảng khối CÓ KIỂU, không phải HTML: nội dung người viết gõ vào không có đường nào
 * thành thẻ HTML hay script trên trang (NFR-05).
 */

const HEADING = /^(#{2,3})\s+(.+)$/;
const BULLET = /^[-*]\s+(.+)$/;
const NUMBERED = /^\d+[.)]\s+(.+)$/;
const IMAGE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;
const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Chỉ liên kết NỘI BỘ mới thành liên kết; còn lại giữ nguyên dạng chữ. */
export function isInternalHref(href: string): boolean {
  return /^\/(?![/\\])[^\s]*$/.test(href);
}

function parseInline(text: string): ArticleInline[] {
  const parts: ArticleInline[] = [];
  let cursor = 0;

  for (const match of text.matchAll(LINK)) {
    const [whole, label = '', href = ''] = match;
    const start = match.index ?? 0;
    if (!isInternalHref(href)) continue;
    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push({ text: label, href });
    cursor = start + whole.length;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

type ListKind = 'bullet' | 'numbered';

function listItem(line: string): { kind: ListKind; text: string } | null {
  const bullet = BULLET.exec(line);
  if (bullet?.[1]) return { kind: 'bullet', text: bullet[1] };
  const numbered = NUMBERED.exec(line);
  return numbered?.[1] ? { kind: 'numbered', text: numbered[1] } : null;
}

/** Một dòng đứng riêng thành một khối (tiêu đề, ảnh), hoặc `null` nếu là chữ thường. */
function standaloneBlock(line: string): ArticleBlock | null {
  const heading = HEADING.exec(line);
  if (heading?.[1] && heading[2]) {
    return { type: 'heading', level: heading[1].length === 2 ? 2 : 3, text: heading[2].trim() };
  }
  const image = IMAGE.exec(line);
  if (image?.[2] && isSiteImage(image[2])) {
    return { type: 'image', src: image[2], alt: (image[1] ?? '').trim() };
  }
  return null;
}

/** Gom các dòng liền nhau cùng loại (đoạn văn, danh sách) thành một khối. */
function collect(lines: readonly string[], from: number): { block: ArticleBlock; next: number } {
  const first = listItem(lines[from] ?? '');
  let index = from;

  if (first) {
    const items: string[] = [];
    while (index < lines.length) {
      const item = listItem(lines[index] ?? '');
      if (!item || item.kind !== first.kind) break;
      items.push(item.text.trim());
      index += 1;
    }
    return { block: { type: 'list', ordered: first.kind === 'numbered', items }, next: index };
  }

  const text: string[] = [];
  while (index < lines.length) {
    const line = lines[index] ?? '';
    if (line === '' || standaloneBlock(line) || listItem(line)) break;
    text.push(line);
    index += 1;
  }
  return { block: { type: 'paragraph', content: parseInline(text.join(' ')) }, next: index };
}

export function parseMarkup(markup: string): ArticleBlock[] {
  const lines = markup
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trim());
  const blocks: ArticleBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? '';
    const standalone = line === '' ? null : standaloneBlock(line);
    if (line === '') {
      index += 1;
    } else if (standalone) {
      blocks.push(standalone);
      index += 1;
    } else {
      const { block, next } = collect(lines, index);
      blocks.push(block);
      index = next;
    }
  }
  return blocks;
}
