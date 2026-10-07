import Link from 'next/link';
import { SiteChrome } from '@/features/shell/SiteChrome';

/**
 * Trang 404 (BA §6): nằm TRONG khung site để khách lạc đường vẫn có menu, và đưa ra hai lối
 * rõ ràng — về trang chủ hoặc sang trang sản phẩm — thay vì chỉ báo "không tồn tại".
 */
export default function NotFound() {
  return (
    <SiteChrome>
      <main className="mx-auto flex w-full max-w-md flex-col items-center gap-6 px-4 py-24 text-center">
        <div className="flex flex-col gap-2">
          <p className="tabular font-display text-6xl font-bold text-brand-700/30">404</p>
          <h1 className="text-2xl font-bold text-brand-700">Không tìm thấy trang này</h1>
          <p className="text-sm leading-relaxed text-muted">
            Địa chỉ có thể đã đổi, hoặc sản phẩm đã được gỡ khỏi cửa hàng.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
          >
            Về trang chủ
          </Link>
          <Link
            href="/san-pham"
            className="rounded-full bg-gold-400 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-gold-300"
          >
            Xem sản phẩm
          </Link>
        </div>
      </main>
    </SiteChrome>
  );
}
