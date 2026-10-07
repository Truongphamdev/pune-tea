'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/features/shell/BrandMark';

/**
 * Màn hình lỗi chung của cả ứng dụng.
 *
 * Không có nó, một lỗi khi dựng trang hiện ra dưới dạng "Application error: a client-side
 * exception has occurred" — chữ tiếng Anh, không nút bấm, không lối thoát.
 *
 * Trang này không sửa được lỗi, nhưng nó giữ khách lại: nói bằng tiếng Việt rằng cửa hàng
 * đang trục trặc, cho một nút thử lại, và một đường về trang chủ.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Ghi ra console của trình duyệt để còn lần theo `digest` trong log của Next
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-6 px-4 text-center">
      <BrandLogo className="h-16" />

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Cửa hàng đang gặp trục trặc</h1>
        <p className="text-sm leading-relaxed text-muted">
          Trang vừa gặp lỗi khi hiển thị. Bạn thử tải lại — giỏ hàng lưu trên trình duyệt của bạn
          không bị ảnh hưởng.
        </p>
        {error.digest ? (
          <p className="tabular text-xs text-muted">Mã sự cố: {error.digest}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
        >
          Thử lại
        </button>
        <Link
          href="/"
          className="rounded-full border border-brand-200 bg-brand-50 px-5 py-2.5 text-sm font-semibold text-brand-700 transition-colors duration-200 hover:bg-brand-100"
        >
          Về trang chủ
        </Link>
      </div>
    </main>
  );
}
