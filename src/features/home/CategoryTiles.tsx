import Link from 'next/link';
import { SITE_NAME } from '@/config/site';
import type { Category } from '@/data/types';
import { CoverImage } from '@/features/catalog/CoverImage';
import { SectionHeading } from './SectionHeading';

export interface CategoryTile {
  readonly category: Category;
  readonly productCount: number;
}

/**
 * Khối danh mục trang chủ: mỗi danh mục một ô có ảnh bìa, tên và số sản phẩm.
 * Không có danh mục nào thì không vẽ khối rỗng.
 */
export function CategoryTiles({
  tiles,
  title = 'Sản phẩm',
  intro,
}: {
  tiles: readonly CategoryTile[];
  title?: string;
  intro?: string;
}) {
  if (tiles.length === 0) return null;

  return (
    <section aria-labelledby="categories" className="py-14">
      <SectionHeading id="categories" title={title} centered />
      {intro ? (
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-muted sm:text-base">
          {intro}
        </p>
      ) : null}

      <ul className="mt-8 grid gap-4 sm:grid-cols-3">
        {tiles.map((tile) => (
          <li key={tile.category.slug}>
            <CategoryTileLink tile={tile} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function CategoryTileLink({ tile }: { tile: CategoryTile }) {
  const { category, productCount } = tile;

  return (
    <Link
      href={`/danh-muc/${category.slug}`}
      className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-card border border-line bg-brand-900 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift-lg"
    >
      <CoverImage
        src={category.image}
        alt={`Các sản phẩm ${category.name.toLowerCase()} ${SITE_NAME}`}
        sizes="(max-width: 640px) 100vw, 33vw"
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />
      {/* Ảnh sáng tối không lường trước được, nên chữ phải có nền tối riêng */}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
      />
      <span className="relative font-display text-lg font-semibold text-white">
        {category.name}
      </span>
      <span className="relative mt-0.5 text-xs text-white/85">{productCount} sản phẩm</span>
    </Link>
  );
}
