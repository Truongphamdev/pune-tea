import Link from 'next/link';
import type { ReactNode } from 'react';
import { SITE_NAME, SITE_TAGLINE, type NavLink } from '@/config/site';
import { BrandLockup } from './BrandMark';
import { FacebookIcon } from './SocialIcons';

/**
 * Chân trang (FR-03): wordmark + mô tả ngắn, liên kết nhanh, danh mục, liên hệ, link Facebook
 * page, dòng bản quyền.
 *
 * Nền xanh brand-700; chữ phụ `text-white/80` vẫn đạt ≥ 5.9:1.
 */
export function SiteFooter({
  links,
  categories,
  facebookUrl,
}: {
  links: readonly NavLink[];
  categories: readonly NavLink[];
  facebookUrl: string;
}) {
  return (
    <footer className="relative z-10 mt-16 bg-brand-700 text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div className="flex flex-col gap-3">
            <BrandLockup size="lg" />
            <p className="max-w-xs text-sm leading-relaxed text-white/80">{SITE_TAGLINE}</p>
          </div>
          <FooterColumn title="Liên kết nhanh" links={links} />
          <FooterColumn title="Danh mục" links={categories} />
          <FooterContact facebookUrl={facebookUrl} />
        </div>
        <p className="mt-12 border-t border-white/15 pt-6 text-xs text-white/80">
          © {new Date().getFullYear()} {SITE_NAME}. Bảo lưu mọi quyền.
        </p>
      </div>
    </footer>
  );
}

function FooterHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-sans text-xs font-semibold tracking-[0.12em] text-gold-400 uppercase">
      {children}
    </h2>
  );
}

function FooterColumn({ title, links }: { title: string; links: readonly NavLink[] }): ReactNode {
  if (links.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <FooterHeading>{title}</FooterHeading>
      <ul className="flex flex-col gap-2 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-white/80 transition-colors hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Không có địa chỉ, số điện thoại hay email: khách yêu cầu chỉ để tên thương hiệu và Facebook (FR-71). */
function FooterContact({ facebookUrl }: { facebookUrl: string }) {
  return (
    <div className="flex flex-col gap-3">
      <FooterHeading>Liên hệ</FooterHeading>
      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 self-start rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-gold-300"
      >
        <FacebookIcon className="size-4" />
        Facebook page {SITE_NAME}
      </a>
    </div>
  );
}
