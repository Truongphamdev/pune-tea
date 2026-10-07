import type { Category } from './types';

/**
 * Ba danh mục của Puni Tea (BA §5.2). Ảnh bìa là tấm bìa ngoài của mỗi nhóm ảnh khách gửi.
 *
 * Trang KHÔNG import thẳng mảng này — đi qua `catalog.ts` để sau này đổi nguồn chỉ sửa một chỗ.
 */
export const CATEGORIES: readonly Category[] = [
  {
    slug: 'tra-tui-loc',
    name: 'Trà túi lọc',
    description:
      'Trà túi lọc Puni Tea, quy cách chuẩn túi Ivory 40g: trà Nhãn Vàng, trà hương mãng cầu, trà hoa đậu biếc, trà gừng, dòng cold brew ủ lạnh nhanh và trà trái cây hộp thiếc.',
    format: 'Túi Ivory',
    standardPacking: '40g',
    image: '/images/categories/tra-tui-loc.jpg',
  },
  {
    slug: 'tra-roi',
    name: 'Trà rời',
    description:
      'Trà rời Puni Tea, quy cách chuẩn túi 200g: trà đen và trà lài dòng Barista, trà ô long lài, trà gạo rang matcha và bột matcha.',
    format: 'Túi',
    standardPacking: '200g',
    image: '/images/categories/tra-roi.jpg',
  },
  {
    slug: 'tra-hoa-tan',
    name: 'Trà hòa tan',
    description:
      'Trà hòa tan Puni Tea dòng Ice Tea chia sẵn từng gói 15g, đóng túi Ivory 180g (12 gói × 15g) hoặc 240g (16 gói × 15g): trà đào, trà sâm bí đao và các vị hoa quả.',
    format: 'Túi Ivory',
    standardPacking: '180g (12 gói × 15g), 240g (16 gói × 15g)',
    image: '/images/categories/tra-hoa-tan.jpg',
  },
];
