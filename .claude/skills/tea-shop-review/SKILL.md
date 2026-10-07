---
name: tea-shop-review
description: "Cách nghiệm thu một mốc của website Puni Tea Shop so với docs/BA-tea-shop.md: trình tự kiểm, lệnh chạy, cách soi các chỗ nối (dữ liệu–trang–liên kết–giỏ hàng), mức độ lỗi và mẫu báo cáo PASS/FAIL. Dùng khi review, nghiệm thu, kiểm tra lại, chấm một mốc hoặc toàn bộ tea-shop. Không dùng để viết hay sửa mã (đó là tea-shop-build)."
---

# Nghiệm thu Puni Tea Shop theo BA

Mục tiêu là một phán quyết **có bằng chứng**, không phải một bản góp ý. Người viết mã đã tự kiểm
theo cách họ nghĩ; giá trị của review nằm ở chỗ kiểm theo cách khác — chạy lại lệnh, lần theo
đường đi của dữ liệu, và thử các ca người viết không nghĩ tới.

## 1. Trình tự

1. Đọc mục của mốc trong `docs/BA-tea-shop.md` §11, lập danh sách tiêu chí (mã FR/BR/SEO/NFR).
2. Đọc báo cáo worker để biết họ nói đã làm gì — coi đó là **lời khai**, chưa phải bằng chứng.
3. Chạy lệnh kiểm (§2). Thất bại ở đây là `CRITICAL`, nhưng vẫn làm tiếp các bước sau để báo cáo
   đủ một lượt — worker sửa một lần cho nhiều lỗi rẻ hơn nhiều lượt mỗi lượt một lỗi.
4. Kiểm từng tiêu chí bằng cách đọc mã và/hoặc gọi trang thật (§3).
5. Soi các chỗ nối (§4) và các ca biên (§5).
6. Viết báo cáo (§7).

Lượt review từ thứ hai: kiểm lại **từng mã phát hiện cũ** trước, rồi mới chạy lại các bước trên.

## 2. Lệnh kiểm

```bash
pnpm typecheck; echo "typecheck=$?"
pnpm lint;      echo "lint=$?"
pnpm test;      echo "test=$?"
pnpm build;     echo "build=$?"
```

Ghi mã thoát và dòng tóm tắt của từng lệnh vào báo cáo. Từ M3: thêm `pnpm test:cov` và đối chiếu
NFR-02. Soi luôn xem ngưỡng coverage, rule ESLint có bị hạ/tắt, có `it.skip`, `@ts-ignore`,
`eslint-disable` mới không — cho lệnh xanh bằng cách đó là `HIGH`.

Đầu ra của `pnpm build` liệt kê các route: đếm số trang tĩnh và so với BA §6.

## 3. Kiểm trang thật

Mã đọc đúng chưa chắc trang chạy đúng. Dựng bản production rồi gọi thử:

```bash
(pnpm start --port 3011 > _workspace/review-server.log 2>&1 &) ; sleep 4
curl -s -o /dev/null -w "%{http_code}\n" localhost:3011/san-pham
curl -s localhost:3011/san-pham/tra-dao-hoa-tan | grep -oE "<title>[^<]*|<h1[^>]*>[^<]*|application/ld\+json"
curl -s localhost:3011/sitemap.xml | grep -c "<loc>"
pkill -f "next start --port 3011"
```

Dùng cổng 3011 để không đụng dev server của worker (3010). **Luôn tắt tiến trình khi xong.**
Nên kiểm: mã HTTP của mọi route trong BA §6, một slug sai phải ra 404, route cũ của bản gốc
(`/admin`, `/login`, `/wallet`, `/products/x`) phải ra 404, `<title>`/`description`/`canonical`
khác nhau giữa các trang, đúng một `<h1>` mỗi trang, JSON-LD phân tích được bằng `JSON.parse`.

Không có trình duyệt nên không kiểm được bằng mắt: phần responsive và tương tác kiểm qua mã
(lớp Tailwind theo breakpoint, thuộc tính aria, xử lý bàn phím) và qua test hành vi; cái gì
không kiểm được thì ghi vào "Chưa kiểm được", đừng suy ra PASS.

## 4. Soi các chỗ nối

Lỗi thật thường nằm giữa hai phần đều "đúng" khi đọc riêng. Đọc **cả hai đầu** của mỗi mối nối:

| Mối nối | Đầu sinh | Đầu dùng | Soi gì |
| ------- | -------- | -------- | ------ |
| Dữ liệu → ảnh | `images`, `cover` trong `src/data` | file trong `public/` | mọi đường dẫn có file thật, đúng hoa thường |
| Dữ liệu → trang | `slug` trong `src/data` | `generateStaticParams`, sitemap | đủ số lượng, không thiếu không thừa |
| Liên kết → route | `href`, `router.push` trong `src/` | cây thư mục `src/app` | không còn `/products`, `/categories`, `/cart`, `/login`… |
| Giỏ hàng → sản phẩm | dòng giỏ `{productSlug, variantId}` | lớp đọc dữ liệu | sản phẩm/biến thể không tồn tại thì bỏ dòng, không sập |
| Giỏ hàng → đơn | tổng trên trang giỏ | nội dung đơn soạn ra | hai con số phải bằng nhau, cùng một hàm tính |
| Bài viết → sản phẩm | `relatedProductSlugs`, link trong thân bài | danh sách sản phẩm | slug nào cũng tồn tại |
| Cấu hình → giao diện | `src/config/site.ts` | header, footer, nút nổi, đặt hàng | không chỗ nào chép cứng link Facebook hay tên shop |

Lệnh gợi ý để liệt kê liên kết: `grep -rnoE "href=\{?[\"'\`][^\"'\`]+" src | sort -u`.

## 5. Ca biên đáng thử (viết thành lệnh hoặc đọc test)

- Thêm cùng sản phẩm + biến thể hai lần → một dòng, số lượng cộng dồn; vượt 99 thì chặn ở 99.
- `localStorage` chứa JSON hỏng, số lượng âm/thập phân/chuỗi, slug lạ → trang vẫn dựng được.
- Sửa tay giá trong `localStorage` → tổng tiền không đổi (BR-10).
- Tìm "tra dao", "TRÀ ĐÀO", "trà  đào" → cùng kết quả; từ khóa không khớp → trạng thái rỗng.
- Form đặt hàng: bỏ trống, số điện thoại 9 số / có chữ → không mở Facebook, có báo lỗi từng ô.
- Clipboard bị từ chối → vẫn thấy nội dung đơn để tự chép (FR-52).
- Sản phẩm một biến thể không hiện bộ chọn; nhiều biến thể thì thẻ hiện "Từ …".

Nếu ca nào chưa có test mà thuộc logic tiền/giỏ hàng → `MEDIUM` (thiếu test nhánh quan trọng),
hoặc `HIGH` nếu đọc mã thấy xử lý sai.

## 6. Kiểm nội dung & phạm vi

- Số liệu sản phẩm khớp bảng BA §5.3 (tên, quy cách, giá, danh mục, ảnh).
- Không có chứng nhận, giải thưởng, công dụng chữa bệnh bịa ra (BR-01, BR-02).
- Công thức trong bài viết khớp số in trên ảnh (BA §7.7).
- Còn sót thứ ngoài phạm vi (BA §2.2) hoặc nhận diện cũ → `HIGH`:

```bash
grep -rnE "@dam/|HIÊN nhà Thỏ|wallet|SePay|Zalo|serverFetch|api-client|asset" src test
```

## 7. Mẫu báo cáo

Ghi vào `_workspace/{mốc}_reviewer_r{lượt}.md`:

```markdown
# {Mốc} — review lượt {N}

**PHÁN QUYẾT: PASS | FAIL**
CRITICAL: x · HIGH: x · MEDIUM: x · LOW: x

## Lệnh kiểm
| Lệnh | Mã thoát | Tóm tắt |

## Tiêu chí nghiệm thu
| Mã | Đạt? | Bằng chứng |
(mỗi FR/BR/SEO/NFR của mốc một dòng: ✅ / ❌ / ⚠️ chưa kiểm được)

## Phát hiện
### R-{Mốc}-01 · HIGH · {tiêu đề ngắn}
- Ở đâu: `src/...:dòng`
- Hiện tượng: (đầu ra lệnh / đoạn mã)
- Vi phạm: FR-xx
- Cách sửa gợi ý:

## Kiểm lại phát hiện cũ   (từ lượt 2)
| Mã | Trạng thái | Ghi chú |

## Chưa kiểm được
```

Dòng `PHÁN QUYẾT:` phải nằm ngay đầu báo cáo và đầu tin nhắn gửi leader — leader đọc dòng đó để
quyết định vòng lặp.
