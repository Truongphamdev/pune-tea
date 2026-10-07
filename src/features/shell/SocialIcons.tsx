/**
 * Icon mạng xã hội vẽ bằng SVG nội tuyến — dùng chung cho chân trang và nút nổi.
 *
 * Không thêm yêu cầu mạng, và tô bằng `currentColor` nên tự khớp màu chữ của ngữ cảnh.
 */
interface IconProps {
  readonly className?: string;
}

function SocialSvg({ className = 'size-4', children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <SocialSvg {...(className ? { className } : {})}>
      <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07z" />
    </SocialSvg>
  );
}

export function MessengerIcon({ className }: IconProps) {
  return (
    <SocialSvg {...(className ? { className } : {})}>
      <path d="M12 0C5.24 0 0 4.95 0 11.64c0 3.5 1.43 6.52 3.77 8.61.2.17.31.43.32.7l.07 2.14a.96.96 0 0 0 1.35.85l2.39-1.05c.2-.09.43-.1.64-.05 1.1.3 2.26.46 3.46.46 6.76 0 12-4.95 12-11.66C24 4.95 18.76 0 12 0zm7.2 8.98-3.52 5.59a1.8 1.8 0 0 1-2.6.48l-2.8-2.1a.72.72 0 0 0-.87 0l-3.78 2.87c-.5.38-1.16-.22-.83-.75l3.52-5.59a1.8 1.8 0 0 1 2.6-.48l2.8 2.1c.26.2.62.2.87 0l3.78-2.87c.5-.38 1.16.22.83.75z" />
    </SocialSvg>
  );
}
