import { SiteChrome } from '@/features/shell/SiteChrome';

/** Khung chung của mặt tiền — nội dung khung nằm ở `SiteChrome`. */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
