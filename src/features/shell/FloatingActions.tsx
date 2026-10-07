import { SITE_NAME } from '@/config/site';
import { BackToTop } from './BackToTop';
import { MessengerIcon } from './SocialIcons';

/**
 * Nút nổi góc phải dưới (FR-04): nhắn Facebook page — kênh đặt hàng duy nhất (BA §7.6) — và
 * lên đầu trang.
 *
 * `z-40` nằm DƯỚI thanh đầu trang (`z-50`), để menu xổ xuống luôn đè lên nút. Nền nút nhắn
 * lấy màu nhận diện của Messenger để khách nhận ra trong một cái liếc; hai đầu gradient đều
 * đạt tương phản ≥ 4.5:1 với chữ trắng.
 */
export function FloatingActions({ facebookUrl }: { facebookUrl: string }) {
  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-2.5">
      <BackToTop />
      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Nhắn Facebook page ${SITE_NAME} (mở tab mới)`}
        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0064d1] to-[#8b2fd6] py-1.5 ps-1.5 pe-4 text-white shadow-lift-lg transition-transform duration-200 hover:-translate-y-0.5"
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/20">
          <MessengerIcon className="size-5" />
        </span>
        <span className="text-sm font-bold">Nhắn Facebook</span>
      </a>
    </div>
  );
}
