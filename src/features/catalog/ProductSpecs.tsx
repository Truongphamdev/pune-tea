import type { ProductSpec } from '@/data/types';

/**
 * Bảng thông số gói trà (Danh mục, Định dạng, Quy cách…) — thứ khách cần biết TRƯỚC khi đặt.
 * Không có dòng nào thì không vẽ khung rỗng.
 */
export function ProductSpecs({ specs }: { specs: readonly ProductSpec[] }) {
  if (specs.length === 0) return null;

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-card border border-line bg-raised/60 p-4 sm:grid-cols-3">
      {specs.map((row) => (
        <div key={row.label} className="flex flex-col gap-0.5">
          <dt className="text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">
            {row.label}
          </dt>
          <dd className="text-sm font-medium">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
