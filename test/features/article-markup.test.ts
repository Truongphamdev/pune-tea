import { describe, expect, it } from 'vitest';
import { isInternalHref, parseMarkup } from '@/features/articles/markup';
import { checkSeo, SEO_LIMITS, seoPassed } from '@/features/articles/seo-check';
import { slugify } from '@/lib/text';

describe('slugify', () => {
  it('bỏ dấu, hạ chữ thường, nối bằng gạch', () => {
    expect(slugify('Cách pha Trà Đào — ngon & nhanh!')).toBe('cach-pha-tra-dao-ngon-nhanh');
    expect(slugify('   ')).toBe('');
  });
});

describe('parseMarkup', () => {
  it('tách tiêu đề, đoạn văn, danh sách và liên kết nội bộ', () => {
    const blocks = parseMarkup(
      [
        '## Mục lớn',
        '',
        'Dòng một',
        'dòng hai có [trà gừng](/san-pham/tra-gung) ở giữa.',
        '',
        '### Mục nhỏ',
        '- ý một',
        '- ý hai',
        '1. bước một',
        '2) bước hai',
      ].join('\n'),
    );

    expect(blocks).toEqual([
      { type: 'heading', level: 2, text: 'Mục lớn' },
      {
        type: 'paragraph',
        content: [
          'Dòng một dòng hai có ',
          { text: 'trà gừng', href: '/san-pham/tra-gung' },
          ' ở giữa.',
        ],
      },
      { type: 'heading', level: 3, text: 'Mục nhỏ' },
      { type: 'list', ordered: false, items: ['ý một', 'ý hai'] },
      { type: 'list', ordered: true, items: ['bước một', 'bước hai'] },
    ]);
  });

  it('liên kết ra ngoài site và giao thức lạ giữ nguyên dạng chữ, không thành liên kết', () => {
    const [block] = parseMarkup(
      'Xem [a](https://evil.example) [b](javascript:alert(1)) [c](//evil.example) [d](/bai-viet)',
    );
    const links =
      block?.type === 'paragraph' ? block.content.filter((part) => typeof part !== 'string') : [];

    expect(links).toEqual([{ text: 'd', href: '/bai-viet' }]);
  });

  it('thẻ HTML gõ vào chỉ là chữ — không có khối nào mang HTML', () => {
    const blocks = parseMarkup('<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>');
    expect(blocks.every((block) => block.type === 'paragraph')).toBe(true);
    expect(JSON.stringify(blocks)).toContain('<script>alert(1)</script>');
  });

  it('ảnh chỉ nhận đường dẫn có trong kho ảnh của site', () => {
    const blocks = parseMarkup(
      '![Hộp trà gừng](/images/products/tra-gung-v2.jpg)\n\n![x](https://evil.example/a.png)',
    );
    expect(blocks[0]).toEqual({
      type: 'image',
      src: '/images/products/tra-gung-v2.jpg',
      alt: 'Hộp trà gừng',
    });
    expect(blocks[1]?.type).toBe('paragraph');
  });

  it('chuỗi rỗng và xuống dòng kiểu Windows', () => {
    expect(parseMarkup('')).toEqual([]);
    expect(parseMarkup('## A\r\n\r\nb')).toHaveLength(2);
  });

  it.each(['/san-pham/tra-gung', '/bai-viet?x=1'])('%s là liên kết nội bộ', (href) => {
    expect(isInternalHref(href)).toBe(true);
  });

  it.each(['//evil.example', '/\\evil', 'https://a.b', 'san-pham', 'javascript:alert(1)'])(
    '%s không phải liên kết nội bộ',
    (href) => {
      expect(isInternalHref(href)).toBe(false);
    },
  );
});

/** Một bài đạt đủ chuẩn, để từng ca test chỉ làm hỏng đúng một tiêu chí. */
export function goodDraft() {
  const paragraph = Array.from({ length: 210 }, (_, index) => `từ${index}`).join(' ');
  return {
    title: 'Cách pha trà gừng ấm bụng ngày mưa',
    description:
      'Hướng dẫn pha trà gừng túi lọc Puni Tea đúng cách: lượng nước, nhiệt độ và thời gian ủ để có ly trà gừng thơm, ấm và vừa vị.',
    coverAlt: 'Hai hộp trà gừng Puni Tea đặt trên bàn',
    body: [
      '## Trà gừng là gì',
      `${paragraph} [trà gừng](/san-pham/tra-gung).`,
      '## Cách pha',
      `${paragraph} xem thêm [trà túi lọc](/danh-muc/tra-tui-loc).`,
      '### Mẹo nhỏ',
      '- Tráng ly bằng nước nóng',
      '## Bảo quản',
      paragraph,
    ].join('\n\n'),
  };
}

describe('checkSeo', () => {
  const failing = (draft: ReturnType<typeof goodDraft>): string[] =>
    checkSeo(draft)
      .filter((check) => !check.ok)
      .map((check) => check.id);

  it('bài mẫu đạt đủ mọi tiêu chí', () => {
    const checks = checkSeo(goodDraft());
    expect(failing(goodDraft())).toEqual([]);
    expect(seoPassed(checks)).toBe(true);
    expect(checks).toHaveLength(7);
  });

  it('bản nháp trống trượt các tiêu chí cần có nội dung', () => {
    expect(failing({ title: '', description: '', coverAlt: '', body: '' })).toEqual([
      'title',
      'description',
      'words',
      'h2',
      'links',
      'cover-alt',
    ]);
  });

  it('tiêu đề quá dài', () => {
    expect(failing({ ...goodDraft(), title: 'a'.repeat(SEO_LIMITS.titleMax + 1) })).toEqual([
      'title',
    ]);
  });

  it('mô tả quá ngắn hoặc quá dài', () => {
    expect(failing({ ...goodDraft(), description: 'ngắn' })).toEqual(['description']);
    expect(
      failing({ ...goodDraft(), description: 'a'.repeat(SEO_LIMITS.descriptionMax + 1) }),
    ).toEqual(['description']);
  });

  it('thiếu từ, thiếu tiêu đề mục', () => {
    expect(failing({ ...goodDraft(), body: '## A\n\n## B\n\n## C\n\nngắn' })).toEqual([
      'words',
      'links',
    ]);
    expect(
      failing({ ...goodDraft(), body: goodDraft().body.replace('## Bảo quản', 'Bảo quản') }),
    ).toEqual(['h2']);
  });

  it('tiêu đề nhỏ đứng trước mọi tiêu đề mục là nhảy cấp', () => {
    expect(failing({ ...goodDraft(), body: `### Mở đầu\n\n${goodDraft().body}` })).toEqual([
      'heading-order',
    ]);
  });

  it('liên kết tới sản phẩm KHÔNG tồn tại hoặc trang khác không được tính', () => {
    const body = goodDraft()
      .body.replace('/san-pham/tra-gung', '/san-pham/khong-co')
      .replace('/danh-muc/tra-tui-loc', '/gioi-thieu');
    expect(failing({ ...goodDraft(), body })).toEqual(['links']);
  });

  it('mô tả ảnh bìa quá ngắn', () => {
    expect(failing({ ...goodDraft(), coverAlt: 'ảnh' })).toEqual(['cover-alt']);
  });
});
