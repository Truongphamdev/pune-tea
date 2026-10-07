/**
 * Icon nét mảnh dùng trên thanh đầu trang và nút nổi — SVG nội tuyến, tô `currentColor`.
 * Luôn `aria-hidden`: nhãn đọc được nằm ở nút/link chứa icon.
 */
interface IconProps {
  readonly className?: string;
}

function LineSvg({ className = 'size-5', children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

function withClass(className: string | undefined): IconProps {
  return className ? { className } : {};
}

export function SearchIcon({ className }: IconProps) {
  return (
    <LineSvg {...withClass(className)}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </LineSvg>
  );
}

export function CartIcon({ className }: IconProps) {
  return (
    <LineSvg {...withClass(className)}>
      <path d="M3 4h2.2l2.1 10.2a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.1L20.5 8H6" />
      <circle cx="9.5" cy="19.5" r="1.2" />
      <circle cx="17" cy="19.5" r="1.2" />
    </LineSvg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <LineSvg {...withClass(className)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </LineSvg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <LineSvg {...withClass(className)}>
      <path d="M6 6l12 12M18 6 6 18" />
    </LineSvg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <LineSvg {...withClass(className)}>
      <path d="m6 9 6 6 6-6" />
    </LineSvg>
  );
}

export function ArrowUpIcon({ className }: IconProps) {
  return (
    <LineSvg {...withClass(className)}>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </LineSvg>
  );
}

export function UserIcon({ className }: IconProps) {
  return (
    <LineSvg {...withClass(className)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6" />
    </LineSvg>
  );
}
