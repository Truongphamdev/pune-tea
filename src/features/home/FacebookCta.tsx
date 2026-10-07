/** Dải kêu gọi đặt hàng qua Facebook (FR-15) — nền xanh, nút vàng chữ tối. */
export function FacebookCta({ facebookUrl }: { facebookUrl: string }) {
  return (
    <section aria-labelledby="facebook-cta" className="bg-brand-700 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 py-14 text-center">
        <h2 id="facebook-cta" className="font-display text-2xl font-bold sm:text-3xl">
          Đặt hàng nhanh qua Facebook
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
          Chọn trà, bỏ vào giỏ rồi gửi đơn cho shop qua tin nhắn Facebook. Website không thu tiền —
          shop sẽ xác nhận đơn và hướng dẫn thanh toán.
        </p>
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold-300"
        >
          Nhắn Facebook page
        </a>
      </div>
    </section>
  );
}
