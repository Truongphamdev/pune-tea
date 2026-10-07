# Puni Tea Shop

Website **đồ án** giới thiệu và đặt mua các gói trà Puni Tea: trà túi lọc, trà rời, trà hòa tan.
Có giỏ hàng, giá, bài viết chuẩn SEO. **Không thanh toán trên web** — bấm đặt hàng thì nội dung
đơn được sao chép và khách gửi cho shop qua Facebook page.

> Giá trong dữ liệu mẫu là giá minh họa, sửa trong `src/data/products.ts`.

Yêu cầu đầy đủ nằm ở [`docs/BA-tea-shop.md`](docs/BA-tea-shop.md).

## Công nghệ

Chỉ một ứng dụng **Next.js 15** (App Router) + React 19 + TypeScript + Tailwind CSS 4, kèm
**SQLite** cho tài khoản và đơn hàng. Không có backend riêng.

- Sản phẩm và bài viết: dữ liệu tĩnh trong mã nguồn (`src/data/`).
- Giỏ hàng: `localStorage` của trình duyệt.
- Tài khoản, phiên đăng nhập, lịch sử đơn: SQLite qua `@libsql/client`. Chạy máy cá nhân là file
  `storage/puni-tea.db`, **tự tạo ở lần chạy đầu** — không cần cài hay bật database nào. Deploy
  thì trỏ sang Turso (xem mục Deploy).

## Cài đặt & chạy

Cần Node.js ≥ 20.11 và pnpm 9.

```bash
pnpm install
pnpm dev          # http://localhost:3010
```

Bản production:

```bash
pnpm build        # cần mạng ở lần build đầu để tải font
pnpm start        # http://localhost:3010
```

Các biến môi trường, đều **không bắt buộc** (xem `.env.example`):

| Biến                            | Ý nghĩa                                                      | Mặc định                   |
| ------------------------------- | ------------------------------------------------------------ | -------------------------- |
| `NEXT_PUBLIC_SITE_URL`          | URL gốc cho canonical, sitemap, thẻ chia sẻ                  | `http://localhost:3010`    |
| `NEXT_PUBLIC_FACEBOOK_PAGE_URL` | Link Facebook page nhận đơn (phải là `https`)                | page Puni Tea              |
| `DATABASE_URL`                  | Database: `file:…` (SQLite cục bộ) hoặc `libsql://…` (Turso) | `file:storage/puni-tea.db` |
| `DATABASE_AUTH_TOKEN`           | Token của database Turso (chỉ khi deploy)                    | —                          |

## Kiểm tra

```bash
pnpm typecheck    # TypeScript
pnpm lint         # ESLint
pnpm test         # Vitest — test logic và test hành vi giao diện
pnpm test:cov     # kèm cổng coverage ≥ 80% trên phần logic
pnpm test:e2e     # Playwright: luồng mua hàng trên trình duyệt thật (tự build và chạy ở cổng 3013)
```

Bộ `test:e2e` cần Chromium của Playwright; cài một lần bằng `pnpm exec playwright install chromium`.
Nó build vào thư mục riêng và dùng database riêng (`storage/e2e.db`), nên chạy được cả khi
`pnpm dev` đang bật.

## Tài khoản & database

- Đăng ký chỉ cần họ tên, email, mật khẩu — tạo xong là đăng nhập luôn.
- Xem sản phẩm và bài viết không cần đăng nhập; **thêm vào giỏ và đặt hàng thì phải đăng nhập**.
- Mọi đơn đặt đều được lưu vào lịch sử ở trang Tài khoản. Đăng xuất thì giỏ hàng bị xóa.
- Đổi mật khẩu ở trang Tài khoản (cần nhập mật khẩu hiện tại); đổi xong các thiết bị khác bị đăng xuất.
- Mật khẩu lưu dạng băm có muối (scrypt). Phiên đăng nhập là cookie `httpOnly` sống 30 ngày.
- Xem database cục bộ: `sqlite3 storage/puni-tea.db` rồi `.tables`, `SELECT * FROM orders;`.
- Xóa sạch dữ liệu thử: dừng web rồi xóa thư mục `storage/`.

## Deploy: Vercel + Turso (miễn phí)

Vercel chạy serverless nên không giữ được file SQLite; database khi deploy đặt ở **Turso**
(SQLite trên mạng, gói miễn phí). Mã không đổi gì — chỉ đổi biến môi trường.

1. **Tạo database Turso** (đăng nhập bằng GitHub tại turso.tech, hoặc dùng CLI):

   ```bash
   turso db create puni-tea
   turso db show puni-tea --url        # → libsql://puni-tea-<tài-khoản>.turso.io
   turso db tokens create puni-tea     # → token
   ```

   Không cần tạo bảng: ứng dụng tự chạy `CREATE TABLE IF NOT EXISTS` ở lần kết nối đầu.

2. **Đẩy repo lên GitHub** rồi vào vercel.com → Add New Project → chọn repo. Vercel tự nhận
   Next.js; để nguyên lệnh build.

3. **Biến môi trường trên Vercel** (Settings → Environment Variables):

   | Biến                            | Giá trị                                                                                                                                      |
   | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
   | `DATABASE_URL`                  | URL `libsql://…` ở bước 1                                                                                                                    |
   | `DATABASE_AUTH_TOKEN`           | token ở bước 1                                                                                                                               |
   | `NEXT_PUBLIC_SITE_URL`          | `https://<tên-dự-án>.vercel.app` (hoặc tên miền riêng) — bắt buộc đúng, vì canonical, sitemap và cờ `Secure` của cookie đăng nhập lấy từ đây |
   | `NEXT_PUBLIC_FACEBOOK_PAGE_URL` | để trống nếu dùng page mặc định                                                                                                              |

4. **Deploy**. Sau khi lên, thử đăng ký một tài khoản rồi xem bảng `users` trong Turso để chắc
   database đã nối đúng.

Lưu ý: giới hạn tần suất (đăng nhập sai, đăng ký, đặt đơn) đếm trong bộ nhớ của từng tiến trình;
trên serverless mỗi phiên bản hàm có bộ đếm riêng nên giới hạn lỏng hơn khi chạy một máy chủ.

## Các trang

| Đường dẫn          | Nội dung                                                    |
| ------------------ | ----------------------------------------------------------- |
| `/`                | Trang chủ: banner, danh mục, sản phẩm nổi bật, bài viết mới |
| `/san-pham`        | Tất cả sản phẩm — lọc danh mục, sắp xếp giá, tìm theo tên   |
| `/danh-muc/[slug]` | Trang danh mục                                              |
| `/san-pham/[slug]` | Chi tiết sản phẩm — chọn loại, số lượng, thêm vào giỏ       |
| `/gio-hang`        | Giỏ hàng, thông tin nhận hàng, đặt hàng qua Facebook        |
| `/dang-ky`         | Đăng ký (không xác minh email)                              |
| `/dang-nhap`       | Đăng nhập                                                   |
| `/tai-khoan`       | Thông tin tài khoản, lịch sử đơn, đổi mật khẩu, đăng xuất   |
| `/bai-viet`        | Danh sách và chi tiết bài viết                              |
| `/gioi-thieu`      | Giới thiệu                                                  |
| `/lien-he`         | Liên hệ và hướng dẫn đặt hàng                               |

## Cấu trúc thư mục

```
src/
  app/            Trang (App Router), sitemap, robots, ảnh chia sẻ
  config/site.ts  Tên shop, địa chỉ, link Facebook, menu
  data/           Dữ liệu: danh mục, sản phẩm, bài viết + các hàm đọc
  features/
    auth/         Đăng nhập, đăng ký, lịch sử đơn
    cart/         Giỏ hàng, form đặt hàng, soạn nội dung đơn
    catalog/      Thẻ sản phẩm, lưới, bộ ảnh, bộ lọc
    articles/     Thẻ và thân bài viết
    home/         Các khối của trang chủ
    seo/          Metadata và dữ liệu có cấu trúc JSON-LD
    shell/        Header, footer, nút nổi
  components/     Thành phần dùng chung (ô nhập, hộp thoại, thông báo)
  lib/            Hàm tiện ích (định dạng tiền, bỏ dấu tiếng Việt)
  server/         Chỉ chạy ở máy chủ: database, mật khẩu, phiên, đơn hàng
public/images/    Ảnh sản phẩm, danh mục, bài viết
test/             Test logic và test hành vi giao diện (Vitest)
e2e/              Kịch bản trên trình duyệt thật (Playwright)
```

## Thêm / sửa nội dung

**Sửa giá hoặc thêm sản phẩm** — mở `src/data/products.ts`, sửa `priceVnd` hoặc thêm một mục mới
vào đúng nhóm. Ảnh đặt trong `public/images/products/`. Sản phẩm mới tự xuất hiện ở trang danh
sách, trang danh mục và sitemap.

**Thêm bài viết** — tạo file trong `src/data/articles/` theo mẫu các bài có sẵn, rồi thêm vào
mảng trong `src/data/articles/index.ts`. `pnpm test` sẽ kiểm bài theo chuẩn SEO: tiêu đề ≤ 60 ký
tự, mô tả 120–160 ký tự, từ 600 từ, ít nhất 3 tiêu đề H2 và 2 liên kết nội bộ.

**Đổi link Facebook, tên shop, địa chỉ** — `src/config/site.ts`.

## Phạm vi đồ án

Có: trưng bày sản phẩm, giỏ hàng, đặt hàng qua Facebook, đăng ký/đăng nhập, lịch sử đơn, bài viết, SEO kỹ thuật (metadata,
sitemap, robots, JSON-LD), giao diện responsive.

Không có (cố ý): thanh toán trực tuyến, xác minh email, quên mật khẩu, trang quản trị, tồn kho, phí vận
chuyển, mã giảm giá.
