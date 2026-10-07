import type { Product, ProductSpec, ProductVariant } from './types';

/**
 * 15 sản phẩm của Puni Tea (BA §5.3).
 *
 * - Quy cách lấy từ chữ in trên bao bì [ẢNH]. **Toàn bộ giá là giả định** [GĐ] — khách chưa
 *   gửi bảng giá (BA §13); sửa giá chỉ cần sửa ở file này.
 * - Mô tả chỉ nói điều in trên ảnh bao bì hoặc khách cung cấp (BR-01), trích nguyên văn trong
 *   ngoặc kép khi có thể. KHÔNG chép các câu công dụng in trên ảnh quảng cáo ("thanh nhiệt",
 *   "giải độc", "có lợi cho sức khỏe"…) và tem "thương hiệu quốc gia" (BR-01, BR-02); không tự
 *   viết hướng dẫn pha khi bao bì không in.
 */

const IMG = '/images/products';

/** Bảng thông số chung của mọi sản phẩm: danh mục, định dạng đóng gói, quy cách. */
function specs(category: string, format: string, packing: string): readonly ProductSpec[] {
  return [
    { label: 'Danh mục', value: category },
    { label: 'Định dạng', value: format },
    { label: 'Quy cách', value: packing },
  ];
}

/** Sản phẩm chỉ có một quy cách: biến thể duy nhất mang đúng nhãn quy cách. */
function single(id: string, label: string, priceVnd: number): readonly ProductVariant[] {
  return [{ id, label, priceVnd }];
}

/** Trà hòa tan bán hai quy cách túi 180g / 240g, gói 15g. */
function instantSizes(price180: number, price240: number): readonly ProductVariant[] {
  return [
    { id: '180g', label: '180g (12 gói × 15g)', priceVnd: price180 },
    { id: '240g', label: '240g (16 gói × 15g)', priceVnd: price240 },
  ];
}

const FRUIT_FLAVORS: ReadonlyArray<readonly [id: string, name: string]> = [
  ['vai', 'Vải'],
  ['dau', 'Dâu'],
  ['chanh', 'Chanh'],
  ['chanh-day', 'Chanh dây'],
  ['oi-hong', 'Ổi hồng'],
  ['chanh-huong-nhai', 'Chanh hương nhài'],
];

const FRUIT_PRICE_VND = 58_000;

const TEABAG_PRODUCTS: readonly Product[] = [
  {
    slug: 'tra-nhan-vang-gold-label',
    name: 'Trà Nhãn Vàng Gold Label',
    categorySlug: 'tra-tui-loc',
    shortDescription:
      'Trà Nhãn Vàng Gold Label (Premium Tea Blend), hộp 100 túi × 2g, kèm công thức ủ chuẩn vị.',
    description: [
      'Trà Nhãn Vàng Gold Label — Premium Tea Blend — đóng hộp, khối lượng tịnh 200g, gồm 100 túi lọc × 2g.',
      'Công thức ủ của Puni Tea: 1 tép trà (2g) với 100–150ml nước 95–98°C, ủ 3–10 phút, rồi lọc bỏ bã trà để thu dịch cốt trà màu đỏ nâu.',
    ],
    specs: specs('Trà túi lọc', 'Hộp túi lọc', '200g (100 túi × 2g)'),
    variants: single('200g', '200g (100 túi × 2g)', 89_000),
    images: [`${IMG}/tra-nhan-vang-gold-label.jpg`],
    featured: true,
  },
  {
    slug: 'tra-huong-mang-cau',
    name: 'Trà Hương Mãng Cầu',
    categorySlug: 'tra-tui-loc',
    shortDescription: 'Trà túi lọc hương mãng cầu, gói 50g gồm 25 túi lọc.',
    description: [
      'Trà túi lọc hương mãng cầu của Puni Tea, gói 50g gồm 25 túi lọc.',
      'Bao bì in tên tiếng Anh “Soursop Flavored Tea” cùng dòng chữ “Thư giãn & hài hòa”.',
    ],
    specs: specs('Trà túi lọc', 'Túi Ivory', '50g (25 túi lọc)'),
    variants: single('50g', '50g (25 túi lọc)', 39_000),
    images: [`${IMG}/tra-huong-mang-cau.jpg`],
  },
  {
    slug: 'tra-hoa-dau-biec',
    name: 'Trà Hoa Đậu Biếc',
    categorySlug: 'tra-tui-loc',
    shortDescription: 'Trà hoa đậu biếc túi lọc, gói 40g gồm 20 túi.',
    description: [
      'Trà hoa đậu biếc dạng túi lọc của Puni Tea, gói 40g gồm 20 túi.',
      'Bao bì in tên tiếng Anh “Butterfly Pea Flower Tea”. Nước trà hoa đậu biếc có màu xanh tím đặc trưng.',
    ],
    specs: specs('Trà túi lọc', 'Túi Ivory', '40g (20 túi)'),
    variants: single('40g', '40g (20 túi)', 45_000),
    images: [`${IMG}/tra-hoa-dau-biec-v2.jpg`],
  },
  {
    slug: 'tra-gung',
    name: 'Trà Gừng',
    categorySlug: 'tra-tui-loc',
    shortDescription: 'Trà gừng túi lọc, gói 40g gồm 20 túi.',
    description: [
      'Trà gừng dạng túi lọc của Puni Tea, gói 40g gồm 20 túi.',
      'Bao bì in tên tiếng Anh “Ginger Tea”, khối lượng tịnh 40g.',
    ],
    specs: specs('Trà túi lọc', 'Túi Ivory', '40g (20 túi)'),
    variants: single('40g', '40g (20 túi)', 39_000),
    images: [`${IMG}/tra-gung-v2.jpg`],
  },
  {
    slug: 'tra-shan-tuyet-cold-brew',
    name: 'Trà Shan Tuyết Cold Brew',
    categorySlug: 'tra-tui-loc',
    shortDescription: 'Trà Shan Tuyết dòng cold brew, gói 42g gồm 12 gói nhỏ × 3,5g.',
    description: [
      'Trà Shan Tuyết dòng cold brew của Puni Tea, gói 42g chia thành 12 gói nhỏ, mỗi gói 3,5g.',
      'Bao bì ghi “Công nghệ ủ lạnh nhanh — chỉ mất 20 phút”, “Ngon và đậm hơn khi ủ lâu”, cùng “Lá trà nguyên chất” và “Không chất tạo ngọt, bảo quản”.',
    ],
    specs: specs('Trà túi lọc', 'Túi Ivory', '42g (12 gói × 3,5g)'),
    variants: single('42g', '42g (12 gói × 3,5g)', 65_000),
    images: [`${IMG}/tra-shan-tuyet-cold-brew.jpg`],
    featured: true,
  },
  {
    slug: 'tra-matcha-gao-rang-cold-brew',
    name: 'Trà Matcha Gạo Rang Cold Brew',
    categorySlug: 'tra-tui-loc',
    shortDescription: 'Trà matcha gạo rang dòng cold brew, gói 42g gồm 12 gói nhỏ × 3,5g.',
    description: [
      'Trà matcha gạo rang dòng cold brew của Puni Tea, gói 42g chia thành 12 gói nhỏ, mỗi gói 3,5g.',
      'Bao bì ghi “Công nghệ ủ lạnh nhanh” với tem “Cold 20 phút”, và “Ngon và đậm hơn khi ủ lâu”.',
    ],
    specs: specs('Trà túi lọc', 'Túi Ivory', '42g (12 gói × 3,5g)'),
    variants: single('42g', '42g (12 gói × 3,5g)', 59_000),
    images: [`${IMG}/tra-matcha-gao-rang-cold-brew-v2.jpg`],
  },
  {
    slug: 'tra-trai-cay-hop-thiec',
    name: 'Trà Trái Cây Hộp Thiếc Cao Cấp',
    categorySlug: 'tra-tui-loc',
    shortDescription:
      'Trà đen với miếng hoa quả nguyên sấy khô, túi lọc pyramid, đựng trong hộp thiếc.',
    description: [
      'Trà trái cây Premium Tea của Puni Tea dạng túi lọc pyramid (túi hình tháp), đựng trong hộp thiếc.',
      'Bao bì ghi: trà đen cao cấp với miếng hoa quả nguyên sấy khô.',
    ],
    specs: specs('Trà túi lọc', 'Hộp thiếc', 'Hộp thiếc, túi lọc pyramid'),
    variants: single('hop-thiec', 'Hộp thiếc, túi lọc pyramid', 185_000),
    images: [`${IMG}/tra-trai-cay-hop-thiec.jpg`],
    featured: true,
  },
];

const LOOSE_PRODUCTS: readonly Product[] = [
  {
    slug: 'tra-den-barista',
    name: 'Trà Đen Barista',
    categorySlug: 'tra-roi',
    shortDescription: 'Trà đen dạng lá rời dòng Barista, túi 200g.',
    description: [
      'Trà đen dạng lá rời thuộc dòng Barista của Puni Tea, đóng túi 200g.',
      'Bao bì màu đỏ in chữ “Trà Đen” cùng số hiệu 11, khối lượng tịnh 200g.',
    ],
    specs: specs('Trà rời', 'Túi', 'Túi 200g'),
    variants: single('200g', 'Túi 200g', 69_000),
    images: [`${IMG}/tra-den-barista.jpg`],
  },
  {
    slug: 'tra-lai-barista',
    name: 'Trà Lài Barista',
    categorySlug: 'tra-roi',
    shortDescription: 'Trà xanh ướp hương lài dạng lá rời dòng Barista, túi 500g.',
    description: [
      'Trà Lài Barista của Puni Tea là trà xanh ướp hương lài, dạng lá rời, đóng túi 500g.',
      'Bao bì ghi: trà xanh, lài/nhài — quy cách đóng gói túi 500gr.',
    ],
    specs: specs('Trà rời', 'Túi', 'Túi 500g'),
    variants: single('500g', 'Túi 500g', 149_000),
    images: [`${IMG}/tra-lai-barista.jpg`],
    featured: true,
  },
  {
    slug: 'tra-o-long-lai-barista',
    name: 'Trà Ô Long Lài Barista',
    categorySlug: 'tra-roi',
    shortDescription: 'Trà lài từ 100% trà ô long, dạng rời dòng Barista, túi 500g.',
    description: [
      'Trà Ô Long Lài dòng Barista của Puni Tea, dạng rời, đóng túi 500g.',
      'Bao bì in chữ “Trà Lài”, kèm ghi chú “100% trà ô long” — quy cách đóng gói túi 500gr.',
    ],
    specs: specs('Trà rời', 'Túi', 'Túi 500g'),
    variants: single('500g', 'Túi 500g', 169_000),
    images: [`${IMG}/tra-o-long-lai-barista.jpg`],
  },
  {
    slug: 'tra-gao-rang-matcha',
    name: 'Trà Gạo Rang Matcha (Genmaicha)',
    categorySlug: 'tra-roi',
    shortDescription: 'Trà gạo rang matcha (genmaicha) dạng rời, túi 200g.',
    description: [
      'Trà gạo rang matcha — còn gọi là genmaicha — dạng rời của Puni Tea, đóng túi 200g.',
      'Genmaicha là trà xanh trộn cùng gạo rang; bao bì dòng Premium ghi “Matcha Genmaicha”, khối lượng tịnh 200g.',
    ],
    specs: specs('Trà rời', 'Túi', 'Túi 200g'),
    variants: single('200g', 'Túi 200g', 99_000),
    images: [`${IMG}/tra-gao-rang-matcha.jpg`],
  },
  {
    slug: 'bot-matcha-barista',
    name: 'Bột Matcha Barista',
    categorySlug: 'tra-roi',
    shortDescription: 'Bột matcha trà xanh dòng Barista, gói 200g.',
    description: [
      'Bột matcha trà xanh dòng Barista của Puni Tea, đóng gói 200g.',
      'Bao bì ghi: matcha Việt, chuẩn vị Việt, sản xuất theo công nghệ nghiền không sinh nhiệt Nhật Bản.',
    ],
    specs: specs('Trà rời', 'Gói', 'Gói 200g'),
    variants: single('200g', 'Gói 200g', 189_000),
    images: [`${IMG}/bot-matcha-barista.jpg`],
    featured: true,
  },
];

const INSTANT_PRODUCTS: readonly Product[] = [
  {
    slug: 'tra-dao-hoa-tan',
    name: 'Trà Đào Hòa Tan',
    categorySlug: 'tra-hoa-tan',
    shortDescription: 'Trà đào hòa tan, gói 15g chia sẵn — túi 180g hoặc 240g.',
    description: [
      'Trà đào hòa tan của Puni Tea chia sẵn từng gói 15g, đóng túi Ivory 180g (12 gói) hoặc 240g (16 gói).',
      'Thuộc dòng Ice Tea của Puni Tea, bao bì in chữ “Trà Đào”.',
    ],
    specs: specs('Trà hòa tan', 'Túi Ivory', '180g (12 gói × 15g) · 240g (16 gói × 15g)'),
    variants: instantSizes(45_000, 58_000),
    images: [`${IMG}/tra-dao-hoa-tan.jpg`],
    featured: true,
  },
  {
    slug: 'tra-sam-bi-dao-hoa-tan',
    name: 'Trà Sâm Bí Đao Hòa Tan',
    categorySlug: 'tra-hoa-tan',
    shortDescription: 'Trà sâm bí đao hòa tan, gói 15g chia sẵn — túi 180g hoặc 240g.',
    description: [
      'Trà sâm bí đao hòa tan của Puni Tea chia sẵn từng gói 15g, đóng túi Ivory 180g (12 gói) hoặc 240g (16 gói).',
      'Thuộc dòng Ice Tea của Puni Tea. Trà bí đao là thức uống mát quen thuộc ngày nóng.',
    ],
    specs: specs('Trà hòa tan', 'Túi Ivory', '180g (12 gói × 15g) · 240g (16 gói × 15g)'),
    variants: instantSizes(45_000, 58_000),
    images: [`${IMG}/tra-sam-bi-dao-hoa-tan.jpg`],
  },
  {
    slug: 'tra-hoa-tan-vi-hoa-qua',
    name: 'Trà Hòa Tan Vị Hoa Quả',
    categorySlug: 'tra-hoa-tan',
    shortDescription: 'Trà hòa tan hộp 240g, chọn một trong sáu vị hoa quả.',
    description: [
      'Trà hòa tan vị hoa quả của Puni Tea, hộp 240g. Chọn một trong sáu vị: Vải, Dâu, Chanh, Chanh dây, Ổi hồng, Chanh hương nhài.',
      'Thuộc dòng Ice Tea, hộp 16 gói × 15g. Bao bì ghi “Thơm đậm vị trà — từ lá trà tươi và bột hoa quả tự nhiên”.',
    ],
    specs: specs('Trà hòa tan', 'Hộp', 'Hộp 240g'),
    variants: FRUIT_FLAVORS.map(([id, name]) => ({
      id,
      label: `Vị ${name}`,
      priceVnd: FRUIT_PRICE_VND,
    })),
    images: ['/images/categories/tra-hoa-tan.jpg'],
  },
];

export const PRODUCTS: readonly Product[] = [
  ...TEABAG_PRODUCTS,
  ...LOOSE_PRODUCTS,
  ...INSTANT_PRODUCTS,
];
