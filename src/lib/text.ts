/**
 * Gập chữ tiếng Việt về dạng không dấu, chữ thường — để so khớp tìm kiếm (FR-21).
 *
 * `normalize('NFD')` tách dấu thành ký tự rời rồi xóa đi; riêng "đ" không phải chữ có dấu
 * tổ hợp nên phải đổi tay. Khoảng trắng thừa gộp lại để "trà  đào" khớp "trà đào".
 */
export function foldVietnamese(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Đếm từ theo khoảng trắng — tiếng Việt viết rời từng âm tiết nên cách này đủ dùng. */
export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
}

/** Đường dẫn không dấu từ một tiêu đề tiếng Việt: "Cách pha Trà Đào" → "cach-pha-tra-dao" (SEO-08). */
export function slugify(text: string): string {
  return foldVietnamese(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
