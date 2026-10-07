import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';

/**
 * Vài khối giao diện dùng chung.
 *
 * Cố tình giữ tối thiểu (YAGNI): dựng cả hệ thống thiết kế trước khi biết giao diện thật cần
 * gì sẽ tạo ra một tầng trừu tượng phải sửa liên tục. Khi có đủ trang thật để thấy khuôn mẫu
 * lặp lại thì mới tách tiếp.
 */

export function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string | undefined;
  children: ReactNode;
}) {
  const describedBy = error ? `${htmlFor}-error` : '';

  /*
   * Gắn `aria-describedby` THẲNG vào ô nhập, bằng cách nhân bản phần tử con.
   *
   * Đây là sợi dây duy nhất nối ô nhập với lời báo lỗi của nó. Không có
   * nó, người dùng trình đọc màn hình nghe "Email, ô nhập" rồi hết — dòng "Email không hợp
   * lệ" nằm ngay bên dưới nhưng không thuộc về ô nào cả, và họ không có cách nào biết mình
   * vừa nhập sai cái gì.
   *
   * `aria-invalid` đi kèm luôn: nó là thứ báo TRẠNG THÁI sai, còn `aria-describedby` chỉ
   * báo NỘI DUNG mô tả. Thiếu cái đầu thì lời báo lỗi được đọc lên như một ghi chú bình
   * thường.
   */
  const describedChild =
    isValidElement(children) && (describedBy || error)
      ? cloneElement(
          children as ReactElement<{
            'aria-describedby'?: string;
            'aria-invalid'?: boolean;
          }>,
          {
            ...(describedBy ? { 'aria-describedby': describedBy } : {}),
            ...(error ? { 'aria-invalid': true } : {}),
          },
        )
      : children;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {describedChild}
      {/* role="alert" để trình đọc màn hình đọc lỗi ngay khi nó xuất hiện */}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 bg-surface"
    />
  );
}

/**
 * Ô nhiều dòng. Cùng style với `TextInput` — hai ô cạnh nhau trong một biểu mẫu mà lệch viền
 * hay lệch cỡ chữ là thứ ai cũng thấy nhưng không ai biết gọi tên.
 *
 * `field-sizing-content` cho ô tự cao theo nội dung ở trình duyệt hỗ trợ; `rows` là mức sàn
 * cho trình duyệt chưa hỗ trợ, nên không nơi nào rơi về một ô cao đúng một dòng.
 */
export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={4}
      {...props}
      className="min-h-24 rounded-md border border-line px-3 py-2 text-sm outline-none [field-sizing:content] focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 bg-surface"
    />
  );
}
