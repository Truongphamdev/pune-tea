import { facebookPageUrl, NAV_LINKS, type NavLink } from '@/config/site';
import { listCategories } from '@/data/catalog';
import { CategoryProvider } from '@/features/catalog/category-context';
import { FloatingActions } from './FloatingActions';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';
import type { NavGroup } from './SiteNav';

/**
 * Khung chung của toàn site: thanh đầu trang, nội dung, chân trang, nút nổi.
 *
 * Danh mục lấy qua lớp đọc `src/data` — thêm danh mục là menu, chân trang và nhãn trên thẻ
 * sản phẩm tự có. Dùng cho cả trang 404 để khách lạc đường vẫn có menu.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const categories = listCategories();
  const categoryLinks: readonly NavLink[] = categories.map((category) => ({
    href: `/danh-muc/${category.slug}`,
    label: category.name,
  }));
  const productGroup: NavGroup = { parentHref: '/san-pham', items: categoryLinks };
  const facebookUrl = facebookPageUrl();

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main-content" className="skip-link">
        Tới nội dung chính
      </a>
      <SiteHeader links={NAV_LINKS} group={productGroup} />
      <CategoryProvider categories={categories}>
        {/*
         * `relative` mà KHÔNG có z-index: đủ để nội dung nằm trên lớp hạt của body, nhưng không
         * tạo ngữ cảnh xếp chồng riêng. Có z-index ở đây thì mọi hộp thoại `fixed` bên trong bị
         * nhốt dưới thanh đầu trang (z-50) và chân trang — nút đóng không bấm được.
         */}
        <div id="main-content" className="relative flex-1">
          {children}
        </div>
      </CategoryProvider>
      <SiteFooter links={NAV_LINKS} categories={categoryLinks} facebookUrl={facebookUrl} />
      <FloatingActions facebookUrl={facebookUrl} />
    </div>
  );
}
