#!/usr/bin/env node
/**
 * Làm nóng bộ đệm ảnh sau mỗi lần deploy.
 *
 * Vercel chỉ nén một cỡ ảnh khi có người xem lần đầu, và lần đó mất hơn một giây. Chạy script
 * này ngay sau khi deploy để chính mình là "người đầu tiên": gọi trước mọi ảnh ở mọi cỡ, khách
 * thật vào là có ngay bản đã nén.
 *
 *   node scripts/warm-images.mjs https://pune-tea.vercel.app
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const base = process.argv[2]?.replace(/\/+$/, '');
if (!base) {
  console.error('Cách dùng: node scripts/warm-images.mjs https://ten-mien');
  process.exit(1);
}

/** Phải khớp `deviceSizes` + `imageSizes` trong next.config.ts. */
const WIDTHS = [72, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1536];
const ROOT = 'public/images';
const CONCURRENCY = 6;

const images = readdirSync(ROOT, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .flatMap((dir) =>
    readdirSync(join(ROOT, dir.name))
      .filter((file) => /\.(jpe?g|png|webp)$/i.test(file))
      .map((file) => `/images/${dir.name}/${file}`),
  );

const jobs = images.flatMap((image) => WIDTHS.map((width) => ({ image, width })));
let done = 0;
let hits = 0;
let failed = 0;

async function warm({ image, width }) {
  const url = `${base}/_next/image?url=${encodeURIComponent(image)}&w=${width}&q=75`;
  try {
    const response = await fetch(url, { headers: { Accept: 'image/webp,*/*' } });
    if (!response.ok) failed += 1;
    else if (response.headers.get('x-vercel-cache') === 'HIT') hits += 1;
    await response.arrayBuffer();
  } catch {
    failed += 1;
  }
  done += 1;
  if (done % 25 === 0 || done === jobs.length) {
    console.log(`${done}/${jobs.length} · đã có sẵn: ${hits} · lỗi: ${failed}`);
  }
}

const queue = [...jobs];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    for (let job = queue.shift(); job; job = queue.shift()) await warm(job);
  }),
);
console.log(failed === 0 ? 'Xong — mọi cỡ ảnh đã được nén sẵn.' : `Xong, ${failed} ảnh lỗi.`);
process.exit(failed === 0 ? 0 : 1);
