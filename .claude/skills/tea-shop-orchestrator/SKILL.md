---
name: tea-shop-orchestrator
description: "Điều phối cặp tea-worker + tea-reviewer để xây website Puni Tea Shop theo docs/BA-tea-shop.md, từng mốc M0–M5 với vòng lặp làm → review → sửa. Dùng khi người dùng yêu cầu triển khai, làm tiếp, chạy harness, làm theo BA, làm mốc Mx, và cả các yêu cầu tiếp theo: chạy lại, làm lại mốc nào đó, sửa theo góp ý, cập nhật sau khi BA đổi, bổ sung, cải thiện kết quả trước. Câu hỏi đơn giản hoặc sửa một dòng thì trả lời/làm trực tiếp, không cần harness."
---

# Điều phối Puni Tea Shop

## Chế độ thực thi: cộng tác agent bền (persistent)

Mẫu **người làm – người kiểm**. Hai agent có tên, chạy suốt phiên và **giữ ngữ cảnh** giữa các
lượt: worker nhớ mã mình vừa viết khi nhận yêu cầu sửa, reviewer nhớ các phát hiện cũ khi kiểm
lại. Leader (phiên chính) chuyển tiếp mọi thông điệp — hai agent không nhắn trực tiếp cho nhau.

Không dùng Workflow: số vòng sửa phụ thuộc phán quyết của reviewer và cần agent nhớ lượt trước.

## Thành phần

| Tên (`name`) | `subagent_type` | Model | Vai trò | Skill | Đầu ra |
| ------------ | --------------- | ----- | ------- | ----- | ------ |
| `worker` | `tea-worker` | opus | Viết/sửa mã theo mốc | `tea-shop-build` | mã nguồn + `_workspace/{mốc}_worker_report.md` |
| `reviewer` | `tea-reviewer` | opus | Nghiệm thu độc lập | `tea-shop-review` | `_workspace/{mốc}_reviewer_r{N}.md` |

Nếu `subagent_type` tùy biến chưa được nạp trong phiên (agent vừa tạo), dùng `general-purpose`
và mở đầu prompt bằng: "Đọc và tuân thủ tuyệt đối `.claude/agents/tea-worker.md` (hoặc
`tea-reviewer.md`) cùng skill nó chỉ tới (đọc bằng Read)." Khi đó truyền `model: "opus"` trong lời gọi.

Cả hai agent **chỉ chạy Opus** (quyết định của người dùng, 06/10/2026) — không đổi sang model khác.
Môi trường không nhận tham số `name` thì gọi tiếp agent bằng ID trả về lúc khởi chạy; ghi ID đó
vào `_workspace/progress.md` để các lượt sau trong phiên dùng lại.

## Quy trình

### Bước 0 — Xem đã có gì

Đọc `_workspace/progress.md` (nếu có) và liệt kê `_workspace/`.

| Tình trạng | Làm gì |
| ---------- | ------ |
| Chưa có `_workspace/` hoặc trống | Chạy từ M0 |
| Có `progress.md`, còn mốc chưa PASS | Làm tiếp từ mốc dang dở |
| Người dùng yêu cầu làm lại / sửa một mốc | Chỉ chạy vòng lặp cho mốc đó, đưa góp ý của người dùng vào prompt |
| BA thay đổi lớn | Đổi tên `_workspace/` thành `_workspace_{YYYYMMDD-HHMM}/`, rồi rà lại từ mốc đầu tiên bị ảnh hưởng |

Agent của phiên trước không còn: khởi chạy lại cùng `name`, đưa đường dẫn các báo cáo cũ vào prompt.

### Bước 1 — Vòng lặp cho từng mốc (M0 → M5, tuần tự)

Thứ tự mốc và tiêu chí nằm ở BA §11. Với mỗi mốc:

1. **Giao việc cho worker.**
   - Lần đầu trong phiên: `Agent(name: "worker", subagent_type: "tea-worker", prompt: …)`.
   - Các lần sau: `SendMessage({to: "worker", message: …})`.
   - Prompt gồm: tên mốc, nhắc đọc BA §11 + skill `tea-shop-build`, đường dẫn báo cáo phải ghi.
2. **Chờ thông báo hoàn thành**, đọc `_workspace/{mốc}_worker_report.md`. Báo cáo ghi lệnh kiểm
   chưa xanh thì gửi lại worker ngay, chưa cần tốn một lượt review.
3. **Giao review**: `Agent(name: "reviewer", subagent_type: "tea-reviewer", …)` lần đầu, sau đó
   `SendMessage({to: "reviewer"})`. Prompt gồm: tên mốc, số lượt, đường dẫn báo cáo worker.
4. **Đọc dòng `PHÁN QUYẾT:`** trong báo cáo review.
   - `PASS` → ghi `progress.md`, sang mốc kế.
   - `FAIL` → `SendMessage` cho worker kèm đường dẫn báo cáo review; worker ghi
     `_workspace/{mốc}_worker_fix{N}.md`; quay lại bước 3 với lượt review N+1.
5. **Tối đa 3 lượt review mỗi mốc.** Lượt 3 vẫn `FAIL` → dừng vòng lặp, tổng hợp các mục còn mở
   và hỏi người dùng (sửa tiếp, chấp nhận, hay đổi BA). Không tự hạ chuẩn để đi tiếp.

Worker và reviewer **không chạy song song** trên cùng mốc: reviewer phải chấm mã đã đứng yên.

### Bước 2 — Sổ tiến độ

Sau mỗi phán quyết, cập nhật `_workspace/progress.md`:

```markdown
| Mốc | Trạng thái | Số lượt review | Báo cáo cuối | Mục còn mở |
| M0  | PASS       | 2              | M0_reviewer_r2.md | MEDIUM: R-M0-04 |
```

Mục `MEDIUM`/`LOW` chưa sửa được mang sang cột "Mục còn mở" để rà ở M5.

### Bước 3 — Kết thúc

1. Sau M5 `PASS`: yêu cầu reviewer một lượt **rà toàn bộ** (mọi FR của BA, không chỉ M5) →
   `_workspace/final_reviewer.md`.
2. Leader tự chạy lại `pnpm typecheck && pnpm lint && pnpm test && pnpm build` một lần để báo
   cáo bằng kết quả tự mắt thấy.
3. Báo người dùng: mốc nào đạt, số lượt review, mục còn mở, các câu hỏi ở BA §13, cách chạy web.
4. Giữ nguyên `_workspace/` để truy vết. Không commit — việc đó do người dùng quyết.

## Truyền dữ liệu

| Từ → đến | Cách | Nội dung |
| -------- | ---- | -------- |
| Leader → agent | prompt / `SendMessage` | tên mốc, đường dẫn file cần đọc và cần ghi |
| Agent → leader | tin nhắn hoàn thành | tóm tắt ngắn + dòng `PHÁN QUYẾT:` (reviewer) |
| Worker ↔ reviewer | file trong `_workspace/` | báo cáo đầy đủ; leader chỉ chuyển **đường dẫn**, không chép lại nội dung |

Quy ước tên file: `{mốc}_{agent}_{loại}.md` — `M2_worker_report.md`, `M2_reviewer_r1.md`,
`M2_worker_fix1.md`. `_workspace/` nằm trong `.gitignore`.

## Xử lý lỗi

| Tình huống | Cách xử lý |
| ---------- | ---------- |
| Agent không phản hồi / dừng giữa chừng | `SendMessage` hỏi trạng thái và giao lại. Vẫn hỏng → chạy agent mới cùng loại với tên khác (`worker-b`), đưa đường dẫn các báo cáo cũ vào prompt |
| Dừng vì hết hạn mức, hết phiên đăng nhập, bị từ chối quyền | **Không thử lại** (kết quả sẽ y hệt). Mở mã và báo cáo dở để xem thực tế làm tới đâu, ghi vào `progress.md`, báo người dùng |
| Worker báo xong nhưng lệnh kiểm đỏ | Trả lại worker ngay, không tính là một lượt review |
| Reviewer không chạy được lệnh vì môi trường (mạng, cổng) | Ghi nhận phần "chưa kiểm được"; leader tự chạy lệnh đó; không coi là PASS |
| Worker và reviewer bất đồng về một phát hiện | Leader đối chiếu với BA và quyết; BA không nói rõ thì hỏi người dùng |
| 3 lượt vẫn FAIL | Dừng, trình người dùng danh sách mục còn mở |

Leader lấp chỗ trống cho agent bị dừng thì chỉ ghi **điều tự mình kiểm chứng**, không đoán thay
phán quyết của reviewer.

## Kịch bản kiểm thử harness

### Luồng bình thường

1. Người dùng: "chạy harness làm M2".
2. Leader giao M2 cho `worker` → nhận `M2_worker_report.md` với bốn lệnh kiểm xanh.
3. `reviewer` trả `PHÁN QUYẾT: FAIL` (1 HIGH: thẻ sản phẩm nhiều biến thể không hiện "Từ …").
4. Leader chuyển đường dẫn `M2_reviewer_r1.md` cho worker → `M2_worker_fix1.md`.
5. `reviewer` lượt 2 → `PASS`. `progress.md` ghi `M2 | PASS | 2`. Leader sang M3.

### Luồng lỗi

1. Ở M4, `pnpm build` của reviewer hỏng vì không tải được font (mất mạng).
2. Reviewer ghi "Chưa kiểm được: build" và vẫn chấm các tiêu chí còn lại.
3. Leader tự chạy `pnpm build`: vẫn lỗi mạng → không ghi PASS, ghi `M4 | CHỜ` kèm lý do vào
   `progress.md`, báo người dùng rằng mốc này cần chạy lại khi có mạng.
