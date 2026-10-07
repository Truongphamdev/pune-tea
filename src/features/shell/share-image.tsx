import { ImageResponse } from 'next/og';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SITE_NAME } from '@/config/site';

/** Khổ ảnh chia sẻ chuẩn của Facebook/Zalo/X. */
export const SHARE_IMAGE_SIZE = { width: 1200, height: 630 } as const;

export const SHARE_IMAGE_ALT = `${SITE_NAME} — trà túi lọc, trà rời, trà hòa tan`;

/** Logo có viền trắng, nhúng thẳng vào ảnh dưới dạng data URL — `ImageResponse` không đọc được đường dẫn tương đối. */
function logoDataUrl(): string {
  const file = readFileSync(join(process.cwd(), 'public/brand/logo-outline.png'));
  return `data:image/png;base64,${file.toString('base64')}`;
}

/**
 * Ảnh chia sẻ mặc định của site: logo Puni Tea trên nền xanh brand-700.
 *
 * Dựng bằng `ImageResponse` lúc build (trang tĩnh). Trên ảnh CHỈ có logo: font mặc định của
 * `next/og` không đủ dấu tiếng Việt, nên không đặt câu mô tả nào lên ảnh — mô tả đi theo thẻ
 * `og:description`.
 */
export function renderShareImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0c5e30',
        }}
      >
        <img src={logoDataUrl()} width={620} height={427} alt="" />
      </div>
    ),
    SHARE_IMAGE_SIZE,
  );
}
