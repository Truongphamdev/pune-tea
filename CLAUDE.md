# Puni Tea Shop — quy ước làm việc

Website đồ án bán trà gói (Puni Tea), **chỉ Next.js** + SQLite, không backend riêng, không thanh
toán — đặt hàng qua Facebook page. Mọi yêu cầu nằm ở [`docs/BA-tea-shop.md`](docs/BA-tea-shop.md).

- Clone từ `../ecommerce-web/apps/web` — repo đó **chỉ đọc để tham khảo**, không sửa, không push.
- Lệnh kiểm: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`. Dev chạy cổng **3010**.
- Kiểm trên trình duyệt thật bằng `pnpm test:e2e` (Playwright, tự build vào `.next-e2e`, cổng 3013, database riêng `storage/e2e.db`).
- Tài khoản và đơn hàng lưu ở SQLite qua `@libsql/client`: máy cá nhân dùng file `storage/puni-tea.db` (tự tạo), deploy Vercel dùng Turso (`DATABASE_URL`, `DATABASE_AUTH_TOKEN`). Sản phẩm và bài viết vẫn là dữ liệu tĩnh trong `src/data/`.

## Harness: Puni Tea Shop

**Mục tiêu:** xây website theo BA, từng mốc M0–M5, mỗi mốc phải qua nghiệm thu độc lập.

**Điều kiện gọi:** khi được yêu cầu triển khai, làm tiếp, làm lại hoặc sửa một phần của tea-shop
theo BA thì dùng skill `tea-shop-orchestrator`. Câu hỏi đơn giản hay sửa một dòng thì làm trực tiếp.

**Lịch sử thay đổi:**

| Ngày       | Thay đổi                                                              | Đối tượng                | Lý do                               |
| ---------- | --------------------------------------------------------------------- | ------------------------ | ----------------------------------- |
| 2026-10-06 | Dựng harness v2 lần đầu (1 worker + 1 reviewer)                       | Toàn bộ                  | -                                   |
| 2026-10-06 | Người dùng dừng harness sau M1; M2–M5 làm trực tiếp trong phiên chính | Vòng lặp worker/reviewer | Người dùng muốn làm thẳng cho nhanh |
