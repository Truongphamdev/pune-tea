import { ImageResponse } from 'next/og';
import { SITE_NAME } from '@/config/site';

/** Khổ ảnh chia sẻ chuẩn của Facebook/Zalo/X. */
export const SHARE_IMAGE_SIZE = { width: 1200, height: 630 } as const;

export const SHARE_IMAGE_ALT = `${SITE_NAME} — trà túi lọc, trà rời, trà hòa tan`;

/**
 * Ảnh chia sẻ mặc định của site: wordmark Puni Tea + lá trên nền xanh brand-700.
 *
 * Dựng bằng `ImageResponse` lúc build (trang tĩnh) — không cần file ảnh thiết kế riêng. Trên
 * ảnh CHỈ có tên thương hiệu: font mặc định của `next/og` không đủ dấu tiếng Việt, mà chữ
 * hiển thị phải là tiếng Việt có dấu (BR-03) — nên không đặt câu mô tả nào lên ảnh. Mô tả đi
 * theo thẻ `og:description`.
 */
export function renderShareImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0c5e30',
          color: '#ffffff',
          gap: 24,
        }}
      >
        <svg width="140" height="140" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"
            fill="#febf2d"
            fillOpacity="0.25"
            stroke="#febf2d"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M5 19 14 10" stroke="#febf2d" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <div style={{ fontSize: 120, fontWeight: 700, letterSpacing: -2 }}>{SITE_NAME}</div>
      </div>
    ),
    SHARE_IMAGE_SIZE,
  );
}
