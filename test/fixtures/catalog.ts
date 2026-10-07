import type { Category, Product } from '@/data/types';

/** Dữ liệu mẫu cho test giao diện — độc lập với `src/data` để test không vỡ khi đổi giá. */
export const CATEGORY: Category = {
  slug: 'tra-hoa-tan',
  name: 'Trà hòa tan',
  description: 'Trà pha nhanh, đóng gói từng gói nhỏ.',
  format: 'Túi Ivory',
  standardPacking: '180g (12 gói × 15g), 240g (16 gói × 15g)',
  image: '/images/categories/tra-hoa-tan.jpg',
};

export const SINGLE_VARIANT: Product = {
  slug: 'tra-gung',
  name: 'Trà Gừng',
  categorySlug: 'tra-tui-loc',
  shortDescription: 'Trà gừng túi lọc.',
  description: ['Trà gừng túi lọc.'],
  specs: [{ label: 'Quy cách', value: '40g (20 túi)' }],
  variants: [{ id: '40g', label: '40g (20 túi)', priceVnd: 39_000 }],
  images: ['/images/products/tra-gung.jpg'],
  imageBackground: 'dark',
};

export const MULTI_VARIANT: Product = {
  slug: 'tra-dao-hoa-tan',
  name: 'Trà Đào Hòa Tan',
  categorySlug: 'tra-hoa-tan',
  shortDescription: 'Trà đào hòa tan.',
  description: ['Trà đào hòa tan.'],
  specs: [],
  variants: [
    { id: '240g', label: '240g (16 gói × 15g)', priceVnd: 58_000 },
    { id: '180g', label: '180g (12 gói × 15g)', priceVnd: 45_000 },
  ],
  images: ['/images/products/tra-dao-hoa-tan.jpg'],
  featured: true,
};
