import Link from 'next/link';
import { CoverImage } from '@/features/catalog/CoverImage';

export interface HeroAction {
  readonly href: string;
  readonly label: string;
}

/**
 * Banner đầu trang chủ (FR-10): chữ bên trái trên nền xanh thương hiệu, ảnh bên phải trong
 * khung riêng.
 *
 * Ảnh khách gửi là ảnh quảng cáo VUÔNG có sẵn chữ và logo. Phủ nó kín một dải ngang rồi đặt
 * chữ lên trên thì ảnh bị phóng to chỉ còn thấy một mảng logo, và tiêu đề đè lên chữ in sẵn
 * trong ảnh. Tách hai cột: ảnh hiện trọn vẹn, chữ luôn nằm trên nền phẳng đủ tương phản.
 */
export function Hero({
  eyebrow,
  title,
  subtitle,
  image,
  imageAlt,
  actions = [],
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  actions?: readonly HeroAction[];
}) {
  return (
    <section className="relative isolate overflow-hidden bg-brand-800 text-white">
      {/* Quầng sáng trang trí — nền xanh phẳng trên cả một dải rộng trông nặng */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(60rem_30rem_at_85%_10%,rgb(35_131_79/0.55),transparent_70%)]"
      />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-16 lg:gap-16 lg:py-20">
        <div className="flex flex-col items-start gap-5">
          {eyebrow ? (
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.12em] text-gold-300 uppercase">
              {eyebrow}
            </span>
          ) : null}
          <h1 className="font-sans text-4xl leading-[1.1] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <span aria-hidden="true" className="h-1 w-16 rounded-full bg-gold-400" />
          <p className="max-w-[46ch] text-base leading-relaxed text-white/90 sm:text-lg">
            {subtitle}
          </p>
          {actions.length > 0 ? <HeroActions actions={actions} /> : null}
        </div>

        <HeroImage src={image} alt={imageAlt} />
      </div>
    </section>
  );
}

function HeroImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative mx-auto w-full max-w-md md:max-w-none">
      {/* Mảng vàng lệch phía sau cho ảnh có chiều sâu, không dùng đổ bóng đen trên nền xanh */}
      <span
        aria-hidden="true"
        className="absolute inset-0 translate-x-3 translate-y-3 rounded-frame bg-gold-400 sm:translate-x-4 sm:translate-y-4"
      />
      <div className="relative aspect-square overflow-hidden rounded-frame bg-brand-900 ring-1 ring-white/20">
        <CoverImage
          src={src}
          alt={alt}
          sizes="(max-width: 768px) 100vw, 560px"
          priority
          className="object-cover"
        />
      </div>
    </div>
  );
}

function HeroActions({ actions }: { actions: readonly HeroAction[] }) {
  return (
    <div className="mt-1 flex flex-wrap gap-3">
      {actions.map((action, index) => (
        <Link
          key={action.href}
          href={action.href}
          // Nút đầu là lời kêu gọi chính: nền vàng, chữ tối (chữ trắng trên vàng không đủ tương phản)
          className={`rounded-full px-6 py-3 text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5 ${
            index === 0
              ? 'bg-gold-400 text-ink'
              : 'border border-white/40 bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {action.label}
        </Link>
      ))}
    </div>
  );
}
