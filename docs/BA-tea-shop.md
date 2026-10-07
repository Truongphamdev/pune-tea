# Tài liệu Phân tích Nghiệp vụ (BA) — Website Puni Tea Shop

| Thông tin   | Chi tiết                                                                 |
| ----------- | ------------------------------------------------------------------------ |
| Phiên bản   | 1.1                                                                      |
| Ngày lập    | 06/10/2026                                                               |
| Loại dự án  | **Đồ án** (không vận hành thật) — website giới thiệu & đặt mua trà gói   |
| Nguồn gốc   | Clone từ `ecommerce-web/apps/web` rồi sửa thành tea shop                 |
| Công nghệ   | **Chỉ Next.js** (App Router) + SQLite — không backend riêng              |
| Tiền tệ     | VND                                                                      |
| Trạng thái  | Draft — phần đánh dấu **[GĐ]** là giả định, chờ khách xác nhận (xem §13) |

**Ký hiệu nguồn thông tin:** **[KH]** khách nói trong tin nhắn · **[ẢNH]** đọc từ ảnh khách gửi ·
**[GĐ]** giả định của người viết BA, thay được mà không đổi kiến trúc.

---

## 1. Bối cảnh & mục tiêu

Khách cần một website **đơn giản** làm đồ án, nội dung về các gói trà có sẵn của thương hiệu
Puni Tea [KH]. Nguyên văn yêu cầu:

> "Em cần làm đơn giản thôi ạ. Kiểu tạo web về các gói trà có sẵn á. Thêm giỏ hàng, giá, bài
> chuẩn SEO. Mấy thông tin cơ bản ạ."
>
> Hỏi: "Trang có giỏ hàng, còn thanh toán là qua Zalo à em?" — Đáp: "Web liên kết thanh toán
> qua page được không anh" → chốt: **đặt hàng qua Facebook page**.

Mục tiêu:

1. Trưng bày đủ các gói trà khách gửi ảnh, có **giá** và quy cách rõ ràng.
2. Có **giỏ hàng** hoạt động (thêm, đổi số lượng, xóa, tính tổng).
3. **Không thanh toán trên web** — bấm đặt hàng thì chuyển sang Facebook page kèm nội dung đơn.
4. Có **bài viết chuẩn SEO** và SEO kỹ thuật đầy đủ (metadata, sitemap, dữ liệu có cấu trúc).
5. Giao diện theo **phong cách https://cozy.vn/** (tham khảo bố cục và không khí, không sao chép).

## 2. Phạm vi

### 2.1. Trong phạm vi

| Nhóm          | Hạng mục                                                                    |
| ------------- | --------------------------------------------------------------------------- |
| Trưng bày     | Trang chủ, danh sách sản phẩm, trang danh mục, chi tiết sản phẩm, tìm kiếm  |
| Mua hàng      | Giỏ hàng (localStorage), trang giỏ hàng, đặt hàng qua Facebook page         |
| Nội dung      | Danh sách bài viết, chi tiết bài viết, trang Giới thiệu, trang Liên hệ      |
| SEO           | Metadata từng trang, Open Graph, sitemap.xml, robots.txt, JSON-LD           |
| Nền tảng      | Responsive, truy cập được bằng bàn phím, test tự động, README chạy được     |

### 2.2. Ngoài phạm vi (cố ý KHÔNG làm)

- **Thanh toán** dưới mọi hình thức: cổng thanh toán, ví, QR ngân hàng, COD có ghi nhận đơn.
- **Backend riêng** — không NestJS, PostgreSQL, Redis, MinIO, hàng đợi (từ v1.1 có SQLite chạy ngay trong Next.js, xem §7.9).
- **Xác minh email, quên mật khẩu** (đổi mật khẩu khi đang đăng nhập thì có — FR-85), wishlist, đánh giá sản phẩm.
- **Trang quản trị (admin)** — dữ liệu sửa trực tiếp trong mã nguồn (`src/data/`).
- Mã giảm giá, tồn kho, phí vận chuyển, đa ngôn ngữ, chế độ tối (dark mode).
- Triển khai lên máy chủ thật, CI/CD.

> Lý do ghi rõ: bản gốc `ecommerce-web` có đủ các thứ trên. Mọi phần đó phải **bị gỡ sạch**
> khỏi bản clone, không được để lại mã chết hay đường dẫn hỏng.

## 3. Người dùng

| Vai trò               | Mô tả                                 | Làm được gì                                              |
| --------------------- | ------------------------------------- | -------------------------------------------------------- |
| **Khách truy cập**    | Bất kỳ ai mở web, không cần tài khoản | Xem trà, đọc bài; muốn bỏ giỏ và đặt hàng phải đăng nhập (v1.1) |
| **Chủ shop**          | Người vận hành Facebook page          | Nhận tin nhắn đơn hàng trên page (nằm ngoài website)     |
| **Người chấm đồ án**  | Giảng viên / hội đồng                 | Chạy web theo README, xem đủ luồng trong vài phút        |

## 4. Kiến trúc & nguyên tắc kỹ thuật

- **Một ứng dụng Next.js duy nhất** ở gốc repo (không monorepo). Giữ phiên bản của bản gốc:
  Next 15 (App Router), React 19, TypeScript strict, Tailwind CSS 4, Vitest + Testing Library.
- **Dữ liệu tĩnh** trong `src/data/` (TypeScript có kiểu). Truy cập qua một lớp hàm đọc
  (`listProducts`, `getProductBySlug`, `listArticles`…) — trang không import thẳng mảng dữ liệu.
- **Trang dựng tĩnh** (`generateStaticParams`) cho sản phẩm, danh mục, bài viết — tốt cho SEO.
- **Giỏ hàng ở trình duyệt** (`localStorage`), không gọi mạng.
- **Không gọi API ngoài** lúc chạy. Không có secret nào trong dự án.
- Gói workspace của bản gốc (`@dam/contracts`, `@dam/config`) phải được **nhập thẳng vào repo**
  (kiểu dữ liệu cần dùng thì chép vào `src/`, cấu hình ESLint/TS/Prettier thì chép vào gốc).
- Cấu hình chung đặt ở `src/config/site.ts` (tên shop, link Facebook, địa chỉ, URL site).
- Bản gốc `ecommerce-web` là **tham chiếu chỉ đọc** — không sửa, không commit, không push vào đó.

### 4.1. Giữ lại / gỡ bỏ từ bản clone

| Giữ & chỉnh lại                                                         | Gỡ bỏ hoàn toàn                                                            |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `components/` (ui, toast, EmptyState, ConfirmDialog)                    | `app/admin/**`, `app/(auth)/**`, `app/(account)/**`                         |
| `features/shell/` (header, footer, nút nổi, icon mạng xã hội)           | `features/admin`, `auth`, `import`, `wallet`, `wishlist`, `review`, `orders` |
| `features/catalog/` (thẻ sản phẩm, lưới, gallery, lightbox, breadcrumb) | `lib/api-client.ts`, `server-api.ts`, `safe-redirect.ts`, `youtube.ts`      |
| `features/home/` (hero, tiêu đề khối, ô danh mục)                       | `middleware.ts` (APP_MODE), mọi thứ về ví / SePay / Zalo handoff            |
| `lib/format.ts`, `app/sitemap.ts`, `app/robots.ts`, `globals.css`       | Khái niệm "file nguồn", "origin Việt/Trung", "đã sở hữu", "miễn phí"       |
| `test/architecture/orphans.test.ts` (bắt file mồ côi)                   | Test của các tính năng đã gỡ                                               |

## 5. Dữ liệu

### 5.1. Mô hình

```ts
type Category = {
  slug: string;            // 'tra-tui-loc'
  name: string;            // 'Trà túi lọc'
  description: string;     // đoạn giới thiệu, dùng cho cả meta description
  format: string;          // 'Túi Ivory'
  image: string;           // ảnh bìa danh mục
};

type ProductVariant = {
  id: string;              // '180g'
  label: string;           // '180g (12 gói × 15g)'
  priceVnd: number;        // số nguyên VND, > 0
};

type Product = {
  slug: string;            // duy nhất, không dấu
  name: string;
  categorySlug: string;
  shortDescription: string;
  description: string[];   // các đoạn mô tả
  specs: { label: string; value: string }[];  // Định dạng, Quy cách, …
  variants: ProductVariant[];                 // ÍT NHẤT 1 phần tử
  images: string[];        // ảnh đầu là ảnh bìa
  imageBackground?: 'dark';// ảnh nền đen → khung ảnh nền tối
  featured?: boolean;      // lên khối "Sản phẩm nổi bật"
};

type Article = {
  slug: string;
  title: string;           // ≤ 60 ký tự
  description: string;     // 120–160 ký tự
  cover: string;
  coverAlt: string;
  publishedAt: string;     // ISO date
  author: string;
  body: ArticleBlock[];    // heading | paragraph | list | image — KHÔNG dùng HTML thô
  relatedProductSlugs: string[];
};
```

Giá hiển thị trên thẻ sản phẩm: một biến thể → giá đó; nhiều biến thể → "Từ {giá thấp nhất}".

### 5.2. Danh mục (3) [KH]

| slug          | Tên         | Định dạng [KH] | Quy cách chuẩn [KH]                      | Ảnh bìa                           |
| ------------- | ----------- | -------------- | ---------------------------------------- | --------------------------------- |
| `tra-tui-loc` | Trà túi lọc | Túi Ivory      | 40g                                      | `/images/categories/tra-tui-loc.jpg` |
| `tra-roi`     | Trà rời     | Túi            | 200g                                     | `/images/categories/tra-roi.jpg`     |
| `tra-hoa-tan` | Trà hòa tan | Túi Ivory      | 180g (12 gói × 15g), 240g (16 gói × 15g) | `/images/categories/tra-hoa-tan.jpg` |

Khách dặn: tấm đầu của mỗi nhóm ảnh là **bìa ngoài** → dùng làm ảnh bìa danh mục [KH].

### 5.3. Sản phẩm (15)

Ảnh đã được chép sẵn vào `public/images/` với tên dưới đây. Quy cách lấy từ chữ in trên bao bì
trong ảnh [ẢNH]. **Toàn bộ giá là [GĐ]** — khách chưa gửi bảng giá.

**Trà túi lọc**

| # | slug                            | Tên                              | Quy cách [ẢNH]               | Giá [GĐ]  | Ảnh (`/images/products/…`)            |
| - | ------------------------------- | -------------------------------- | ---------------------------- | --------- | ------------------------------------- |
| 1 | `tra-nhan-vang-gold-label`      | Trà Nhãn Vàng Gold Label         | 200g (100 túi × 2g)          | 89.000    | `tra-nhan-vang-gold-label.jpg`        |
| 2 | `tra-huong-mang-cau`            | Trà Hương Mãng Cầu               | 50g (25 túi lọc)             | 39.000    | `tra-huong-mang-cau.jpg`              |
| 3 | `tra-hoa-dau-biec`              | Trà Hoa Đậu Biếc                 | 40g (20 túi)                 | 45.000    | `tra-hoa-dau-biec.jpg` (nền đen)      |
| 4 | `tra-gung`                      | Trà Gừng                         | 40g (20 túi)                 | 39.000    | `tra-gung.jpg` (nền đen)              |
| 5 | `tra-shan-tuyet-cold-brew`      | Trà Shan Tuyết Cold Brew         | 42g (12 gói × 3,5g)          | 65.000    | `tra-shan-tuyet-cold-brew.jpg`        |
| 6 | `tra-matcha-gao-rang-cold-brew` | Trà Matcha Gạo Rang Cold Brew    | 42g (12 gói × 3,5g)          | 59.000    | `tra-matcha-gao-rang-cold-brew.jpg` (nền đen) |
| 7 | `tra-trai-cay-hop-thiec`        | Trà Trái Cây Hộp Thiếc Cao Cấp   | Hộp thiếc, túi lọc pyramid   | 185.000   | `tra-trai-cay-hop-thiec.jpg`          |

**Trà rời**

| #  | slug                     | Tên                                 | Quy cách [ẢNH] | Giá [GĐ] | Ảnh                           |
| -- | ------------------------ | ----------------------------------- | -------------- | -------- | ----------------------------- |
| 8  | `tra-den-barista`        | Trà Đen Barista                     | Túi 200g       | 69.000   | `tra-den-barista.jpg`         |
| 9  | `tra-lai-barista`        | Trà Lài Barista (trà xanh ướp lài)  | Túi 500g       | 149.000  | `tra-lai-barista.jpg`         |
| 10 | `tra-o-long-lai-barista` | Trà Ô Long Lài Barista              | Túi 500g       | 169.000  | `tra-o-long-lai-barista.jpg`  |
| 11 | `tra-gao-rang-matcha`    | Trà Gạo Rang Matcha (Genmaicha)     | Túi 200g       | 99.000   | `tra-gao-rang-matcha.jpg`     |
| 12 | `bot-matcha-barista`     | Bột Matcha Barista                  | Gói 200g       | 189.000  | `bot-matcha-barista.jpg`      |

**Trà hòa tan**

| #  | slug                     | Tên                          | Biến thể                                                                 | Giá [GĐ]          | Ảnh                              |
| -- | ------------------------ | ---------------------------- | ------------------------------------------------------------------------ | ----------------- | -------------------------------- |
| 13 | `tra-dao-hoa-tan`        | Trà Đào Hòa Tan              | 180g (12 gói × 15g) · 240g (16 gói × 15g)                                | 45.000 · 58.000   | `tra-dao-hoa-tan.jpg`            |
| 14 | `tra-sam-bi-dao-hoa-tan` | Trà Sâm Bí Đao Hòa Tan       | 180g (12 gói × 15g) · 240g (16 gói × 15g)                                | 45.000 · 58.000   | `tra-sam-bi-dao-hoa-tan.jpg`     |
| 15 | `tra-hoa-tan-vi-hoa-qua` | Trà Hòa Tan Vị Hoa Quả       | Hộp 240g, chọn vị: Vải · Dâu · Chanh · Chanh dây · Ổi hồng · Chanh hương nhài | 58.000 mỗi vị     | `/images/categories/tra-hoa-tan.jpg` |

Sản phẩm nổi bật [GĐ]: #1, #5, #7, #9, #12, #13.

Ảnh còn lại: `/images/articles/o-long-dua-hau-sa-tac.jpg` (công thức — dùng cho bài viết).

### 5.4. Quy tắc nội dung

- **BR-01** Chỉ viết những gì nhìn thấy trên bao bì hoặc khách cung cấp. **Không bịa** chứng
  nhận, giải thưởng, nguồn gốc vùng trồng, công dụng chữa bệnh.
- **BR-02** Nội dung nói về sức khỏe chỉ ở mức thông tin chung ("thường được dùng để…"), không
  khẳng định điều trị.
- **BR-03** Mọi chữ hiển thị là **tiếng Việt có dấu**; slug và tên file không dấu, chữ thường, gạch nối.
- **BR-04** Mỗi sản phẩm phải có ít nhất 1 ảnh tồn tại thật trong `public/`, 1 biến thể giá > 0,
  và thuộc đúng một danh mục có thật — kiểm bằng test dữ liệu.
- **BR-05** Không dùng logo, ảnh hay nội dung của Cozy. Logo Puni Tea khách chưa gửi file →
  dùng **wordmark chữ** tự dựng (chữ "Puni Tea" + hình lá đơn giản), không vẽ lại logo trong ảnh.

## 6. Bản đồ trang

| Đường dẫn             | Trang               | Ghi chú                                                   |
| --------------------- | ------------------- | --------------------------------------------------------- |
| `/`                   | Trang chủ           |                                                           |
| `/san-pham`           | Tất cả sản phẩm     | Lọc danh mục, sắp xếp, tìm theo tên (`?q=`, `?sort=`)     |
| `/danh-muc/[slug]`    | Danh mục            | 3 trang tĩnh                                              |
| `/san-pham/[slug]`    | Chi tiết sản phẩm   | 15 trang tĩnh                                             |
| `/gio-hang`           | Giỏ hàng & đặt hàng | `noindex`                                                 |
| `/dang-nhap`, `/dang-ky` | Đăng nhập, đăng ký | `noindex` (v1.1)                                         |
| `/tai-khoan`          | Tài khoản & lịch sử đơn | `noindex`, bắt buộc đăng nhập (v1.1)                  |
| `/bai-viet`           | Danh sách bài viết  |                                                           |
| `/bai-viet/[slug]`    | Chi tiết bài viết   | trang tĩnh                                                |
| `/gioi-thieu`         | Giới thiệu          |                                                           |
| `/lien-he`            | Liên hệ             | Thông tin + nút mở Facebook page; không có form gửi mail  |
| `/sitemap.xml`, `/robots.txt` | SEO         |                                                           |
| (không khớp)          | 404                 | Có lối về trang chủ và trang sản phẩm                     |

Không còn đường dẫn nào của bản gốc (`/admin`, `/login`, `/wallet`, `/orders`, `/products/…`).

## 7. Yêu cầu chức năng

### 7.1. Khung trang (header, footer)

- **FR-01** Header: wordmark bên trái; menu ngang **Trang chủ · Sản phẩm · Bài viết · Giới thiệu ·
  Liên hệ**; "Sản phẩm" xổ ra 3 danh mục; ô/biểu tượng tìm kiếm; biểu tượng giỏ hàng kèm **số
  lượng món** cập nhật tức thì.
- **FR-02** Màn hình hẹp: menu thu vào nút hamburger, mở được bằng chạm và bàn phím, đóng khi chọn mục.
- **FR-03** Footer: wordmark + mô tả ngắn, liên kết nhanh, 3 danh mục, thông tin liên hệ, link
  Facebook page, dòng bản quyền. (06/10/2026: khách yêu cầu bỏ mọi dòng ghi chú "website đồ án /
  giá minh họa" khỏi giao diện — giá minh họa vẫn ghi ở §5.3 và §13 của tài liệu này.)
- **FR-04** Nút nổi góc phải dưới: **nhắn Facebook** và **lên đầu trang**.

### 7.2. Trang chủ (bố cục theo cozy.vn)

Thứ tự khối:

1. **FR-10 Hero** — banner lớn với ảnh `categories/tra-roi.jpg` ("Trà nền chuẩn vị Việt"), tiêu đề,
   mô tả ngắn, 2 nút: "Xem sản phẩm", "Đọc bài viết".
2. **FR-11 Danh mục** — tiêu đề "Sản phẩm" + đoạn giới thiệu; 3 ô danh mục (ảnh bìa, tên, số sản phẩm).
3. **FR-12 Sản phẩm nổi bật** — lưới các sản phẩm `featured`, có nút "Xem tất cả".
4. **FR-13 Câu chuyện thương hiệu** — khối chữ + ảnh, dẫn sang `/gioi-thieu`.
5. **FR-14 Bài viết mới** — tiêu đề "Tin tức & bài viết", 3 bài mới nhất.
6. **FR-15 Kêu gọi đặt hàng** — dải màu "Đặt hàng nhanh qua Facebook" + nút mở page.

### 7.3. Danh sách & danh mục

- **FR-20** Thẻ sản phẩm: ảnh bìa, tên danh mục, tên sản phẩm, quy cách ngắn, giá (hoặc "Từ …"),
  nút **Thêm vào giỏ**. Sản phẩm nhiều biến thể: nút dẫn sang trang chi tiết để chọn ("Chọn loại").
- **FR-21** `/san-pham`: lọc theo danh mục, sắp xếp (Mặc định · Giá tăng dần · Giá giảm dần),
  tìm theo tên **không phân biệt dấu và hoa thường** ("tra dao" khớp "Trà Đào"). Trạng thái lọc
  nằm trên URL để chia sẻ được.
- **FR-22** Không có kết quả → trạng thái rỗng có nút xóa bộ lọc.
- **FR-23** Trang danh mục: ảnh bìa, mô tả, định dạng & quy cách chuẩn, lưới sản phẩm, breadcrumb.

### 7.4. Chi tiết sản phẩm

- **FR-30** Ảnh lớn (bấm phóng to), breadcrumb, tên (H1), giá, mô tả ngắn.
- **FR-31** Chọn **biến thể** khi có từ 2 trở lên — giá đổi theo lựa chọn; mặc định chọn biến thể đầu.
- **FR-32** Chọn **số lượng** (1–99) và nút **Thêm vào giỏ hàng**; thêm xong có thông báo (toast)
  kèm lối sang giỏ hàng.
- **FR-33** Bảng thông số (Danh mục, Định dạng, Quy cách…), mô tả đầy đủ.
- **FR-34** Khối "Sản phẩm cùng danh mục" (tối đa 4, không gồm chính nó).
- **FR-35** Slug không tồn tại → trang 404.

### 7.5. Giỏ hàng

- **FR-40** Giỏ lưu ở `localStorage`, khóa `puni-tea:cart:v1`; mỗi dòng = `{ productSlug,
  variantId, quantity }`. Còn nguyên sau khi tải lại trang.
- **FR-41** Thêm trùng (cùng sản phẩm + biến thể) thì **cộng dồn số lượng**, không tạo dòng mới.
- **FR-42** Trang giỏ: ảnh, tên, biến thể, đơn giá, bộ tăng/giảm số lượng, thành tiền từng dòng,
  nút xóa dòng, nút xóa cả giỏ (có hỏi lại), **tổng tiền**.
- **FR-43** Giỏ trống → trạng thái rỗng có nút về trang sản phẩm.
- **BR-10** **Giá luôn lấy từ dữ liệu sản phẩm lúc hiển thị**, không lưu giá trong `localStorage` —
  sửa tay `localStorage` không đổi được giá.
- **BR-11** Số lượng là số nguyên 1–99; giỏ tối đa 50 dòng. Dữ liệu `localStorage` hỏng hoặc
  trỏ tới sản phẩm/biến thể không còn tồn tại → **bỏ qua dòng đó**, không làm sập trang.
- **BR-12** Không lỗi hydrate: máy chủ không biết giỏ hàng, số trên header chỉ hiện sau khi
  trình duyệt đọc xong `localStorage`.

### 7.6. Đặt hàng qua Facebook page (thay cho thanh toán)

- **FR-50** Trên trang giỏ có form **thông tin nhận hàng**: Họ tên (bắt buộc), Số điện thoại (bắt
  buộc, 10 số bắt đầu bằng 0), Địa chỉ (bắt buộc), Ghi chú (tùy chọn). Thông tin **không gửi đi
  đâu và không lưu lại** — chỉ dùng để soạn nội dung đơn.
- **FR-51** Nút **"Đặt hàng qua Facebook"**: hợp lệ thì (1) soạn nội dung đơn, (2) sao chép vào
  clipboard, (3) mở Facebook page ở tab mới (`rel="noopener noreferrer"`), (4) hiện hộp thoại
  hướng dẫn "Dán nội dung vừa sao chép vào tin nhắn gửi page" kèm nội dung đơn và nút **Sao chép lại**.
- **FR-52** Trình duyệt chặn clipboard → vẫn hiện nội dung trong ô văn bản để khách tự bôi chép.
- **FR-53** Sau khi đặt, hỏi khách có muốn **xóa giỏ hàng** không — không tự xóa.
- **FR-54** Nội dung đơn (văn bản thuần) gồm: mã tham chiếu `PT-YYMMDD-XXXX`, từng dòng "tên —
  biến thể × số lượng = thành tiền", tổng tiền, thông tin nhận hàng, ghi chú.
- **BR-13** Ghi rõ ngay cạnh nút: "Website không thu tiền. Shop xác nhận đơn và hướng dẫn thanh
  toán qua tin nhắn Facebook."
- Link page [KH — đã xác nhận đúng ngày 06/10/2026]:
  `https://www.facebook.com/share/19fniaMu8F/?mibextid=wwXIfr` — đặt trong `src/config/site.ts`,
  ghi đè được bằng biến `NEXT_PUBLIC_FACEBOOK_PAGE_URL`.

### 7.7. Bài viết chuẩn SEO

- **FR-60** `/bai-viet`: lưới bài (ảnh bìa, tiêu đề, mô tả, ngày đăng, thời gian đọc), mới nhất trước.
- **FR-61** Chi tiết bài: H1, ngày đăng, tác giả, thời gian đọc, ảnh bìa, nội dung, khối **sản
  phẩm liên quan**, khối **bài viết khác**, breadcrumb.
- **FR-62** Tối thiểu **5 bài**, mỗi bài đạt chuẩn ở §8.2:

| # | slug                                   | Chủ đề                                                        | Ảnh bìa                                   |
| - | -------------------------------------- | ------------------------------------------------------------- | ----------------------------------------- |
| 1 | `cong-thuc-pha-tra-nhan-vang-chuan-vi` | Công thức ủ trà Nhãn Vàng chuẩn vị (2g/100–150ml, 95–98°C, 3–10 phút) [ẢNH] | `products/tra-nhan-vang-gold-label.jpg` |
| 2 | `cach-lam-o-long-dua-hau-sa-tac`       | Ô long dưa hấu sả tắc — nguyên liệu và cách làm [ẢNH]         | `articles/o-long-dua-hau-sa-tac.jpg`      |
| 3 | `tra-sam-bi-dao-thanh-nhiet`           | Trà sâm bí đao — thức uống thanh nhiệt ngày nóng              | `products/tra-sam-bi-dao-hoa-tan.jpg`     |
| 4 | `cold-brew-la-gi-cach-u-tra-lanh`      | Cold brew là gì? Cách ủ trà lạnh tại nhà                      | `products/tra-shan-tuyet-cold-brew.jpg`   |
| 5 | `phan-biet-tra-tui-loc-tra-roi-tra-hoa-tan` | Phân biệt trà túi lọc, trà rời và trà hòa tan            | `categories/tra-tui-loc.jpg`              |

Công thức trong bài 1 và 2 phải **khớp số liệu in trên ảnh** (bài 2: trà ô long 100ml, đường
40ml, dưa hấu 40ml, sả 1 cây, tắc 1 trái).

### 7.9. Tài khoản & lịch sử đơn (bổ sung v1.1 — 06/10/2026, theo yêu cầu khách)

Khách yêu cầu thêm đăng nhập/đăng ký, **không xác minh email**, có dùng database. Chốt: SQLite,
lưu tài khoản và đơn hàng; sản phẩm và bài viết vẫn là dữ liệu tĩnh.

- **FR-80** `/dang-ky`: họ tên, email, mật khẩu (≥ 8 ký tự). Tạo xong là đăng nhập luôn, không có
  bước xác minh email. Email đã dùng thì báo lỗi ở ô email.
- **FR-81** `/dang-nhap`: email + mật khẩu. Sai thì báo lỗi chung "Email hoặc mật khẩu không
  đúng" (không cho biết email có tồn tại hay không). Sai 5 lần liên tiếp thì tạm khóa email đó 15 phút.
- **FR-82** Đăng xuất hủy phiên ở máy chủ. Biểu tượng tài khoản trên header: chưa đăng nhập dẫn
  tới `/dang-nhap`, đã đăng nhập dẫn tới `/tai-khoan`.
- **FR-83** `/tai-khoan` (bắt buộc đăng nhập): tên, email, nút đăng xuất và **lịch sử đơn hàng**
  (mã, thời gian, từng dòng hàng, tổng tiền, thông tin nhận hàng), mới nhất trước.
- **FR-84** (đổi ngày 06/10/2026 theo yêu cầu khách) **Phải đăng nhập mới thêm được vào giỏ và
  đặt hàng.** Chưa đăng nhập mà bấm "Thêm vào giỏ" thì được đưa sang `/dang-nhap`, đăng nhập xong
  quay lại đúng trang đang xem. `/gio-hang` bắt buộc đăng nhập. Mọi đơn đều được lưu vào lịch sử
  khi bấm "Đặt hàng qua Facebook"; ô họ tên điền sẵn từ tài khoản. Đăng xuất thì xóa giỏ hàng
  trong trình duyệt. Xem sản phẩm, danh mục, bài viết thì vẫn không cần đăng nhập.
- **BR-25** Máy chủ áp lại luật giỏ hàng khi chốt đơn: gộp dòng trùng, tối đa 99 món một dòng. Không
  gọi được máy chủ thì báo lỗi để khách thử lại — không có đơn nào "đã đặt" mà không được lưu.
- **BR-26** Giỏ hàng trong trình duyệt gắn với một tài khoản: người khác đăng nhập trên cùng máy,
  hoặc phiên mất mà không bấm Đăng xuất, thì giỏ của người trước bị xóa.
- **BR-27** Giới hạn tần suất (07/10/2026): sai mật khẩu tối đa 5 lần/15 phút mỗi email (đăng nhập
  và đổi mật khẩu đếm chung, tính từ lần sai gần nhất) và 20 lần/15 phút mỗi IP; đăng ký tối đa
  5 lượt/giờ mỗi IP và 60 lượt/giờ cả site; đặt đơn tối đa 10 đơn/10 phút mỗi tài khoản. Địa chỉ IP
  đọc từ `x-forwarded-for` nên chỉ là lớp cản thêm; các giới hạn theo email, tài khoản và trần cả
  site không phụ thuộc IP.
- **BR-24** Rào đăng nhập được cưỡng chế **ở máy chủ** (trang giỏ hàng và việc chốt đơn kiểm
  phiên); rào trên nút "Thêm vào giỏ" chỉ là trải nghiệm, vì giỏ nằm trong `localStorage`.
- **FR-85** Đổi mật khẩu ở `/tai-khoan`: phải nhập đúng mật khẩu hiện tại; mật khẩu mới ≥ 8 ký tự
  và khác mật khẩu cũ. Đổi xong thì mọi phiên khác của tài khoản bị hủy, thiết bị đang dùng vẫn
  đăng nhập. Nhập sai mật khẩu hiện tại tính chung vào giới hạn 5 lần của FR-81.
- **BR-20** Mật khẩu chỉ lưu dạng băm có muối (scrypt). Phiên là token ngẫu nhiên trong cookie
  `httpOnly`, database chỉ giữ bản băm của token.
- **BR-21** Máy chủ **tính lại** tên, giá và tổng tiền của đơn từ dữ liệu sản phẩm; không tin
  con số tiền nào trình duyệt gửi lên. Đơn chép tên và giá tại thời điểm đặt.
- **BR-22** Người dùng chỉ xem được đơn của chính mình.
- **BR-23** Tham số quay lại sau đăng nhập (`?tiep=`) chỉ nhận đường dẫn nội bộ.
- **NFR-09** (đổi 07/10/2026 để deploy Vercel) Database truy cập qua `@libsql/client`: chạy máy cá
  nhân là file SQLite `storage/puni-tea.db`; deploy là Turso (SQLite trên mạng) qua `DATABASE_URL`
  + `DATABASE_AUTH_TOKEN`. Bảng tự
  tạo bảng ở lần chạy đầu — không có bước cài đặt riêng. File database không đưa vào git.
- Các trang `/dang-nhap`, `/dang-ky`, `/tai-khoan` là `noindex` và không có trong sitemap.

Vẫn **không** có thanh toán: đơn lưu lại chỉ để khách xem lịch sử.

### 7.8. Trang tĩnh

- **FR-70** Giới thiệu: Puni Tea là ai, 3 dòng sản phẩm, cam kết — tuân BR-01.
- **FR-71** Liên hệ: link Facebook page và hướng dẫn đặt hàng 3 bước. Không hiển thị địa chỉ, số
  điện thoại hay email (07/10/2026: khách yêu cầu xóa "Biên Hòa, Đồng Nai" ở mọi nơi, chỉ để "Puni Tea").

## 8. Yêu cầu SEO

### 8.1. SEO kỹ thuật

- **SEO-01** Mỗi trang có `<title>` riêng (mẫu `%s | Puni Tea`), `meta description` riêng, `canonical`.
- **SEO-02** Open Graph + Twitter card cho mọi trang; sản phẩm và bài viết dùng ảnh bìa của chính nó.
- **SEO-03** `sitemap.xml` liệt kê đủ: trang tĩnh, 3 danh mục, 15 sản phẩm, mọi bài viết — **sinh
  từ dữ liệu**, thêm sản phẩm là sitemap tự có. Không có `/gio-hang`.
- **SEO-04** `robots.txt` cho phép toàn site, chặn `/gio-hang`, trỏ tới sitemap.
- **SEO-05** JSON-LD: `Organization` (trang chủ), `Product` + `Offer` (VND, một `Offer` mỗi biến
  thể hoặc `AggregateOffer`), `Article`, `BreadcrumbList`.
- **SEO-06** Mỗi trang đúng **một H1**; thứ bậc tiêu đề không nhảy cấp; `<html lang="vi">`.
- **SEO-07** Mọi ảnh nội dung có `alt` mô tả; dùng `next/image` với `sizes` phù hợp.
- **SEO-08** URL tiếng Việt không dấu, có nghĩa. `NEXT_PUBLIC_SITE_URL` quyết định URL tuyệt đối.

### 8.2. Chuẩn một bài viết

Tiêu đề ≤ 60 ký tự · mô tả 120–160 ký tự · từ 600 từ trở lên · 1 H1 và ít nhất 3 H2 · ảnh bìa có
`alt` · ít nhất 2 liên kết nội bộ tới sản phẩm/danh mục · có ngày đăng, tác giả, thời gian đọc.
Các ngưỡng đo được phải có **test tự động** kiểm trên toàn bộ bài.

## 9. Giao diện (tham chiếu cozy.vn)

- **Bảng màu** (lấy từ CSS của cozy.vn): xanh lá đậm `#0C5E30` (chủ đạo: header/footer/tiêu đề),
  vàng `#FEBF2D` (điểm nhấn, nút kêu gọi), chữ `#2B2B2B`, nền trắng và kem rất nhạt.
  Chữ trắng trên nền xanh; **chữ tối trên nền vàng** (chữ trắng trên vàng không đủ tương phản).
- **Không khí**: sạch, nhiều khoảng trắng, ảnh thiên nhiên/đồi chè làm chủ đạo, bo góc mềm,
  khối nội dung rộng rãi. Tiêu đề khối canh giữa kèm gạch/hoa văn nhỏ màu vàng.
- **Chữ**: giữ `Be Vietnam Pro` cho nội dung; font tiêu đề phải có **đủ dấu tiếng Việt**.
- **Chỉ giao diện sáng** — gỡ phần dark mode của bản gốc.
- **Ảnh nền đen** (3 sản phẩm, `imageBackground: 'dark'`): đặt trong khung nền tối để trông có chủ ý.
- **Responsive**: kiểm ở 360px, 768px, 1280px — không tràn ngang; lưới sản phẩm 2 / 3 / 4 cột.
- **Truy cập**: mọi thao tác làm được bằng bàn phím, thấy rõ focus, nút có nhãn, tương phản đạt AA.
- Thay toàn bộ nhận diện cũ ("HIÊN nhà Thỏ", màu cam đất, icon, `og-image`) bằng nhận diện Puni Tea.

## 10. Yêu cầu phi chức năng

- **NFR-01** `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` đều **thoát mã 0**.
- **NFR-02** Coverage ≥ **80%** trên phần logic (`src/lib`, `src/data`, `src/config`, và các file
  `.ts` trong `src/features`); thành phần giao diện then chốt (thẻ sản phẩm, giỏ hàng, form đặt
  hàng) có test hành vi.
- **NFR-03** Quy ước mã của bản gốc vẫn áp dụng: hàm < 50 dòng, file < 800 dòng, lồng ≤ 4 cấp,
  không `any`, không `console.log`, không biến đổi dữ liệu tại chỗ (ESLint đã cưỡng chế phần lớn).
- **NFR-04** Không còn tham chiếu tới gói `@dam/*`, API, hay biến môi trường của bản gốc.
  Tìm các chuỗi `HIÊN nhà Thỏ`, `@dam/`, `wallet`, `SePay`, `asset` trong `src/` phải ra rỗng.
- **NFR-05** Không dùng `dangerouslySetInnerHTML` cho nội dung, trừ thẻ `<script type="application/ld+json">`
  với dữ liệu đã `JSON.stringify` và thoát ký tự `<`.
- **NFR-06** Dev chạy ở cổng **3010** (`pnpm dev`); Node ≥ 20.11; pnpm 9.
- **NFR-07** README tiếng Việt: giới thiệu, cách cài & chạy, cấu trúc thư mục, cách thêm sản
  phẩm/bài viết, phạm vi đồ án.
- **NFR-08** (Nên có) Một kịch bản Playwright khói: trang chủ → sản phẩm → thêm giỏ → giỏ hàng →
  điền form → thấy hộp thoại đặt hàng.

## 11. Mốc thực hiện & tiêu chí nghiệm thu

Làm **tuần tự**; mỗi mốc phải qua review mới sang mốc sau. Mọi mốc đều ngầm yêu cầu NFR-01.

| Mốc | Nội dung | Tiêu chí nghiệm thu chính |
| --- | -------- | ------------------------- |
| **M0** Dọn nền | Tách thành app Next.js độc lập, gỡ mọi thứ ở cột "Gỡ bỏ" §4.1, nhập cấu hình `@dam/*` vào repo, cài được gói | `pnpm install` chạy được; NFR-01 qua với một trang chủ tạm; NFR-04 qua; không còn route cũ; test mồ côi (orphans) qua |
| **M1** Dữ liệu & khung trang | `src/data` + lớp đọc, `src/config/site.ts`, bảng màu/chữ mới, header, footer, nút nổi, 404 | Đủ 3 danh mục, 15 sản phẩm đúng §5; test dữ liệu BR-04 qua; FR-01…04; hết nhận diện cũ |
| **M2** Trưng bày | Trang chủ, `/san-pham`, `/danh-muc/[slug]`, `/san-pham/[slug]` | FR-10…15, FR-20…23, FR-30…35 (nút thêm giỏ có thể nối ở M3); 18 trang tĩnh được dựng khi build |
| **M3** Giỏ hàng & đặt hàng | Kho giỏ hàng, trang `/gio-hang`, form, đặt qua Facebook | FR-40…43, FR-50…54, BR-10…13; test cho cộng dồn, giới hạn, dữ liệu hỏng, soạn nội dung đơn |
| **M4** Bài viết & SEO | 5 bài, trang bài viết, metadata, sitemap, robots, JSON-LD | FR-60…62, SEO-01…08, test chuẩn bài viết §8.2 qua |
| **M5** Hoàn thiện | Giới thiệu, Liên hệ, rà responsive/truy cập, README, (nên) Playwright khói | FR-70…71, §9 responsive & truy cập, NFR-02, NFR-07; rà lại toàn bộ FR |

## 12. Rủi ro

| Rủi ro | Xử lý |
| ------ | ----- |
| Giá và một số quy cách là giả định | Gom ở `src/data`, sửa một chỗ; ghi rõ ở §13 để hỏi khách |
| Link Facebook dạng `share/…` không điền sẵn được tin nhắn | Sao chép nội dung đơn vào clipboard + hướng dẫn dán (FR-51) |
| Ảnh quảng cáo có chữ, tỉ lệ khác nhau | Khung ảnh tỉ lệ cố định, `object-contain`, nền phù hợp |
| Gỡ backend làm sót import/route chết | Test mồ côi + tìm chuỗi theo NFR-04 + build phải sạch |
| `next/font/google` cần mạng khi build | Giữ như bản gốc; build ở máy có mạng |

## 13. Câu hỏi chờ khách xác nhận

1. **Bảng giá thật** của 15 sản phẩm (hiện là giá minh họa).
2. ~~Link Facebook page chính xác~~ — **đã xác nhận đúng** (06/10/2026).
3. Quy cách "Trà Trái Cây Hộp Thiếc" (số túi, khối lượng) — ảnh ghi không nhất quán.
4. Gói xanh nhạt in "Trà Lài" nhưng chú thích "100% trà ô long" — đang đặt tên "Trà Ô Long Lài Barista".
5. Trà hòa tan: mỗi vị có bán cả 2 quy cách 180g và 240g không; đủ 8 vị như ảnh nhóm chứ?
6. Có file logo Puni Tea và số điện thoại/Zalo để đưa lên web không?
7. Có cần triển khai lên mạng (Vercel…) để nộp đồ án, hay chỉ chạy máy cá nhân?
8. Khách ghi trà túi lọc "Định dạng: Túi Ivory", nhưng ảnh các sản phẩm #2–#6 là **hộp giấy** — web đang ghi theo lời khách; cần xác nhận lại.
9. Ảnh `tra-sam-bi-dao-hoa-tan.jpg` khách gửi tự in "thanh nhiệt, giải độc, đẹp da, giữ dáng". Chữ trên web đã tránh các câu này (BR-02) nhưng ảnh vẫn hiển thị — có dùng ảnh khác không?
