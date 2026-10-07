import { SearchIcon } from './UiIcons';

/**
 * Ô tìm kiếm trên thanh đầu trang: form GET thuần tới `/san-pham?q=…` (FR-21) — chạy được cả
 * khi JavaScript chưa tải xong, và kết quả có URL chia sẻ được.
 *
 * `id` riêng cho từng chỗ đặt (header rộng và menu di động) để nhãn không trỏ nhầm ô.
 */
export function HeaderSearch({ id, className = '' }: { id: string; className?: string }) {
  return (
    <form action="/san-pham" method="get" role="search" className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">
        Tìm sản phẩm
      </label>
      <input
        id={id}
        name="q"
        type="search"
        placeholder="Tìm trà…"
        className="w-full rounded-full border border-transparent bg-white py-2 ps-4 pe-10 text-sm text-ink placeholder:text-muted focus:border-gold-400 focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Tìm"
        className="absolute end-1 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-brand-700 hover:bg-brand-50"
      >
        <SearchIcon className="size-4" />
      </button>
    </form>
  );
}
