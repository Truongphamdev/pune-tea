/** Ba bước đặt hàng — dùng ở trang Giới thiệu và Liên hệ để hai nơi không nói lệch nhau. */
const STEPS: ReadonlyArray<readonly [title: string, detail: string]> = [
  ['Chọn trà', 'Xem sản phẩm, chọn loại và số lượng rồi bấm “Thêm vào giỏ hàng”.'],
  [
    'Điền thông tin nhận hàng',
    'Vào giỏ hàng, kiểm tra lại các món và điền họ tên, số điện thoại, địa chỉ.',
  ],
  [
    'Gửi đơn qua Facebook',
    'Bấm “Đặt hàng qua Facebook”, dán nội dung đơn vào tin nhắn gửi page. Shop sẽ xác nhận và hướng dẫn thanh toán.',
  ],
];

export function OrderSteps() {
  return (
    <ol className="grid gap-4 sm:grid-cols-3">
      {STEPS.map(([title, detail], index) => (
        <li
          key={title}
          className="flex flex-col gap-2 rounded-card border border-line bg-surface p-5"
        >
          <span
            aria-hidden="true"
            className="tabular grid size-9 place-items-center rounded-full bg-gold-400 font-display text-base font-bold text-ink"
          >
            {index + 1}
          </span>
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="text-sm leading-relaxed text-muted">{detail}</p>
        </li>
      ))}
    </ol>
  );
}
