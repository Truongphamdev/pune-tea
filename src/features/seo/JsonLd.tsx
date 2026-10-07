/** Thoát `<` để chuỗi dữ liệu không thể đóng sớm thẻ `<script>` (NFR-05). */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/**
 * In dữ liệu có cấu trúc JSON-LD (SEO-05).
 *
 * Đây là chỗ DUY NHẤT trong dự án dùng `dangerouslySetInnerHTML`, và chỉ với chuỗi đã qua
 * `serializeJsonLd`.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
