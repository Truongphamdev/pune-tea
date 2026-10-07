import { SITE_NAME } from '@/config/site';
import { slugify } from '@/lib/text';
import type { SeoCheck } from './seo-check';

/** Bảng chấm điểm SEO trực tiếp: mỗi tiêu chí một dòng, kèm con số hiện tại. */
export function SeoChecklist({ checks }: { checks: readonly SeoCheck[] }) {
  const passed = checks.filter((check) => check.ok).length;
  const allPassed = passed === checks.length;

  return (
    <section aria-labelledby="seo-checklist" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="seo-checklist" className="font-sans text-base font-bold">
          Chuẩn SEO
        </h2>
        <p
          data-testid="seo-score"
          className={`tabular rounded-full px-3 py-1 text-xs font-bold ${
            allPassed ? 'bg-brand-700 text-white' : 'bg-gold-100 text-ink'
          }`}
        >
          {passed}/{checks.length} đạt
        </p>
      </div>
      <ul className="flex flex-col gap-2 text-sm">
        {checks.map((check) => (
          <li key={check.id} data-ok={check.ok} className="flex items-start gap-2">
            <span
              aria-hidden="true"
              className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-xs font-bold ${
                check.ok ? 'bg-brand-700 text-white' : 'bg-line text-muted'
              }`}
            >
              {check.ok ? '✓' : '·'}
            </span>
            <span className="flex-1">
              <span className="sr-only">{check.ok ? 'Đạt: ' : 'Chưa đạt: '}</span>
              {check.label}
              {check.detail ? <span className="tabular text-muted"> — {check.detail}</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Xem trước cách bài hiện trên trang kết quả tìm kiếm của Google. */
export function SearchPreview({
  title,
  description,
  host,
}: {
  title: string;
  description: string;
  host: string;
}) {
  const slug = slugify(title) || 'duong-dan-bai-viet';

  return (
    <section aria-labelledby="search-preview" className="flex flex-col gap-3">
      <h2 id="search-preview" className="font-sans text-base font-bold">
        Xem trước trên Google
      </h2>
      <div className="flex flex-col gap-1 rounded-lg border border-line bg-white p-4 font-sans">
        <p className="truncate text-xs text-muted">
          {host} › bai-viet › {slug}
        </p>
        <p className="line-clamp-1 text-lg leading-snug text-[#1a0dab]">
          {title.trim() || 'Tiêu đề bài viết'} | {SITE_NAME}
        </p>
        <p className="line-clamp-2 text-sm leading-snug text-[#4d5156]">
          {description.trim() || 'Mô tả ngắn của bài viết sẽ hiện ở đây.'}
        </p>
      </div>
    </section>
  );
}
