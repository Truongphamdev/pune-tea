---
name: tea-shop-build
description: "Cách hiện thực một mốc của website Puni Tea Shop (Next.js) theo docs/BA-tea-shop.md: trình tự làm, cách tái dùng bản clone ecommerce-web, quy ước dữ liệu tĩnh, giỏ hàng, SEO, giao diện và lệnh kiểm. Dùng mỗi khi viết, sửa hoặc gỡ mã nguồn trong repo tea-shop — kể cả sửa lỗi reviewer báo. Không dùng để review hay nghiệm thu (đó là tea-shop-review)."
---

# Xây Puni Tea Shop theo BA

Repo này là bản clone của `ecommerce-web/apps/web` — một cửa hàng asset số có ví, đăng nhập,
admin, gọi API NestJS. Đích đến là một website trà **chỉ Next.js, dữ liệu tĩnh**. Phần khó không
phải viết mới mà là **gỡ đúng và tái dùng đúng**.

## 1. Trình tự cho mỗi mốc

1. Đọc mục mốc đó trong `docs/BA-tea-shop.md` §11 và mọi FR/BR/SEO/NFR nó dẫn tới.
2. Lượt sửa lỗi thì đọc báo cáo review trước, lập danh sách việc từ các mã phát hiện.
3. Khảo sát phần bản clone liên quan trước khi viết — xem §3.
4. Viết test trước cho phần **logic** (dữ liệu, giỏ hàng, soạn đơn, tìm kiếm, SEO), chạy cho đỏ,
   rồi mới hiện thực. Giao diện thuần trình bày không cần test trước.
5. Chạy đủ bốn lệnh ở §2, sửa đến khi sạch.
6. Viết báo cáo vào `_workspace/` theo mẫu trong định nghĩa agent.

## 2. Lệnh kiểm (bắt buộc trước khi báo xong)

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

- Cả bốn phải thoát mã 0. Từ M3 trở đi chạy thêm `pnpm test:cov` để xem ngưỡng NFR-02.
- `pnpm build` cần mạng (tải font Google). Lỗi mạng thì ghi nguyên văn lỗi vào báo cáo.
- Muốn nhìn trang thật: `pnpm build && pnpm start --port 3010 &` rồi `curl -s localhost:3010/…`.
  Nhớ tắt tiến trình sau khi xong (`kill %1`). Không cài thêm công cụ chụp màn hình.

## 3. Tái dùng bản clone

Bảng giữ/gỡ nằm ở BA §4.1. Khi xử lý một file của bản gốc, chọn một trong ba:

| Tình huống | Làm gì |
| ---------- | ------ |
| File chỉ phục vụ tính năng đã bỏ (ví, auth, admin, import…) | **Xóa** cả file lẫn test của nó |
| File trình bày tốt nhưng lấy dữ liệu từ API (`serverFetch`, `api-client`) | **Giữ khung, thay nguồn** bằng lớp đọc `src/data` |
| File mang khái niệm asset số (file nguồn, origin, "đã sở hữu", miễn phí) | **Viết lại** phần đó; đừng đổi tên rồi để logic cũ nằm im |

Vì sao phải gỡ sạch: mã chết của ví/đăng nhập trong một đồ án bán trà là thứ người chấm hỏi đầu
tiên, và `test/architecture/orphans.test.ts` cũng sẽ đỏ. Sau khi gỡ, tìm lại:

```bash
grep -rnE "@dam/|HIÊN nhà Thỏ|wallet|SePay|serverFetch|api-client" src test || echo "sạch"
```

Kiểu dữ liệu của `@dam/contracts` **không chép nguyên** — mô hình mới ở BA §5.1 nhỏ hơn nhiều.
Cấu hình `@dam/config` (ESLint, tsconfig base, Prettier) thì chép từ
`../ecommerce-web/packages/config/` vào gốc repo và giữ nguyên các rule.

## 4. Quy ước mã

- **Dữ liệu** ở `src/data/` (`categories.ts`, `products.ts`, `articles/…`), kiểu ở `src/data/types.ts`.
  Trang chỉ gọi lớp đọc (`src/data/catalog.ts`, `src/data/articles.ts`), không import thẳng mảng —
  để sau này đổi nguồn dữ liệu chỉ sửa một chỗ.
- **Tiền** là số nguyên VND kiểu `number` (giá trà không bao giờ vượt 2^53). Định dạng bằng
  `formatVnd` trong `src/lib/format.ts`. Không dùng số thực, không cộng chuỗi.
- **Bất biến**: không `push`/gán vào mảng, object có sẵn — trả bản mới. Kho giỏ hàng là các hàm
  thuần `(cart, action) => cart`, phần đọc/ghi `localStorage` tách riêng ở một lớp mỏng.
- **Server component mặc định.** Chỉ thêm `'use client'` cho thứ thật sự cần trình duyệt (giỏ
  hàng, bộ chọn biến thể, menu di động, lightbox).
- **Giỏ hàng và hydrate**: máy chủ không biết `localStorage`. Đọc giỏ trong `useSyncExternalStore`
  (ảnh chụp phía máy chủ là giỏ rỗng) hoặc sau khi mount — không đọc thẳng lúc render.
- **Dữ liệu từ `localStorage` là dữ liệu ngoài**: kiểm kiểu từng dòng, bỏ dòng hỏng (BR-11).
- **Giới hạn** của ESLint là thật: hàm < 50 dòng, file < 800 dòng, lồng ≤ 4 cấp, không `any`,
  không `console.log`. Trang dài thì tách khối thành component trong `src/features/…`.
- **Hằng số có tên** cho mọi ngưỡng (số lượng tối đa, số dòng giỏ, số bài ở trang chủ…).
- **Chú thích bằng tiếng Việt**, giải thích *vì sao* như bản gốc đang làm; xóa chú thích nói về
  ví/asset không còn đúng.
- Không thêm thư viện mới khi mã vài chục dòng làm được (bỏ dấu tiếng Việt dùng
  `normalize('NFD')`, thân bài viết là mảng khối có kiểu chứ không cần trình đọc Markdown).

## 5. Giao diện

Đọc BA §9 trước khi đụng tới `globals.css`. Điểm dễ sai:

- Thang `brand` của bản gốc là cam đất — thay bằng thang xanh lá quanh `#0C5E30`, thêm thang vàng
  quanh `#FEBF2D`. Giữ cách khai token trong `@theme`, gỡ khối `prefers-color-scheme: dark`.
- Chữ trên nền vàng phải là chữ tối. Tính tương phản, đừng ước bằng mắt.
- Ảnh sản phẩm là ảnh quảng cáo nhiều tỉ lệ: khung tỉ lệ cố định + `object-contain`; ba ảnh nền
  đen dùng khung nền tối (`imageBackground: 'dark'`).
- Mọi `next/image` có `alt` có nghĩa và `sizes` khớp bề rộng thật của lưới.
- Tham chiếu cozy.vn về **bố cục và không khí**; không chép ảnh, chữ hay logo của họ.

## 6. SEO

- Metadata khai bằng `export const metadata` / `generateMetadata`, lấy tên site và URL từ
  `src/config/site.ts`. Mỗi trang một `canonical`.
- JSON-LD dựng bằng hàm thuần trả object (dễ test), in ra bằng một component dùng chung có thoát
  ký tự `<` — đó là chỗ **duy nhất** được dùng `dangerouslySetInnerHTML`.
- `sitemap.ts` sinh từ lớp đọc dữ liệu, không liệt kê tay.
- Trang động khai `generateStaticParams` và `dynamicParams = false` để slug lạ ra 404.

## 7. Nội dung

Viết tiếng Việt có dấu, giọng ấm và thật thà. Chỉ nêu điều thấy trên bao bì hoặc khách đã nói
(BA BR-01, BR-02). Bài viết phải tự đạt các ngưỡng ở BA §8.2 — có test đo, đừng đếm bằng mắt.

## 8. Ranh giới

- Không `git commit`/`push`. Không sửa gì ngoài repo này.
- Không tự thêm tính năng ngoài phạm vi BA §2.2, kể cả khi bản gốc có sẵn mã.
- Không hạ ngưỡng, tắt rule hay bỏ qua test để lệnh kiểm xanh.
