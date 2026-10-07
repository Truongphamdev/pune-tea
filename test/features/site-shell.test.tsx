import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import NotFound from '@/app/not-found';
import { DEFAULT_FACEBOOK_PAGE_URL } from '@/config/site';
import { BackToTop } from '@/features/shell/BackToTop';
import { CartLink } from '@/features/shell/CartLink';
import { MobileMenu } from '@/features/shell/MobileMenu';
import { SiteChrome } from '@/features/shell/SiteChrome';

const GROUP = {
  parentHref: '/san-pham',
  items: [
    { href: '/danh-muc/tra-tui-loc', label: 'Trà túi lọc' },
    { href: '/danh-muc/tra-roi', label: 'Trà rời' },
  ],
};
const LINKS = [
  { href: '/', label: 'Trang chủ' },
  { href: '/san-pham', label: 'Sản phẩm' },
];

function renderChrome() {
  return render(
    <SiteChrome>
      <p>Nội dung trang</p>
    </SiteChrome>,
  );
}

describe('SiteChrome — header (FR-01)', () => {
  it('wordmark về trang chủ và menu đúng 5 mục theo thứ tự', () => {
    renderChrome();

    expect(screen.getByRole('link', { name: 'Puni Tea — Trang chủ' })).toHaveAttribute('href', '/');
    const nav = screen.getByRole('navigation', { name: 'Điều hướng chính' });
    const topLevel = within(nav)
      .getAllByRole('link')
      .filter((link) => !link.getAttribute('href')?.startsWith('/danh-muc/'));
    expect(topLevel.map((link) => [link.textContent, link.getAttribute('href')])).toEqual([
      ['Trang chủ', '/'],
      ['Sản phẩm', '/san-pham'],
      ['Bài viết', '/bai-viet'],
      ['Giới thiệu', '/gioi-thieu'],
      ['Liên hệ', '/lien-he'],
    ]);
  });

  it('"Sản phẩm" xổ ra đủ 3 danh mục lấy từ dữ liệu', () => {
    renderChrome();

    const nav = screen.getByRole('navigation', { name: 'Điều hướng chính' });
    expect(
      within(nav)
        .getAllByRole('link')
        .map((link) => link.getAttribute('href'))
        .filter((href) => href?.startsWith('/danh-muc/')),
    ).toEqual(['/danh-muc/tra-tui-loc', '/danh-muc/tra-roi', '/danh-muc/tra-hoa-tan']);
  });

  it('ô tìm kiếm gửi GET tới /san-pham?q=', () => {
    renderChrome();

    const input = screen.getByRole('searchbox', { name: 'Tìm sản phẩm' });
    expect(input).toHaveAttribute('name', 'q');
    expect(input.closest('form')).toHaveAttribute('action', '/san-pham');
  });

  it('giỏ hàng dẫn tới /gio-hang; máy chủ chưa biết số món nên không vẽ ô đếm (BR-12)', () => {
    renderChrome();

    expect(screen.getByRole('link', { name: 'Giỏ hàng' })).toHaveAttribute('href', '/gio-hang');
    expect(screen.queryByTestId('header-cart-count')).toBeNull();
  });
});

describe('SiteChrome — footer (FR-03) và nút nổi (FR-04)', () => {
  it('footer có liên kết nhanh, 3 danh mục, Facebook page và dòng bản quyền', () => {
    renderChrome();

    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByRole('link', { name: 'Giới thiệu' })).toHaveAttribute(
      'href',
      '/gioi-thieu',
    );
    expect(within(footer).getByRole('link', { name: 'Trà hòa tan' })).toHaveAttribute(
      'href',
      '/danh-muc/tra-hoa-tan',
    );
    // Khách yêu cầu không hiện địa chỉ ở bất kỳ đâu
    expect(footer).not.toHaveTextContent(/Biên Hòa|Đồng Nai/);
    const facebook = within(footer).getByRole('link', { name: /Facebook page Puni Tea/ });
    expect(facebook).toHaveAttribute('href', DEFAULT_FACEBOOK_PAGE_URL);
    expect(facebook).toHaveAttribute('rel', 'noopener noreferrer');
    expect(footer).toHaveTextContent(`© ${new Date().getFullYear()} Puni Tea`);
    expect(footer).not.toHaveTextContent(/đồ án|minh họa/);
  });

  it('nút nổi nhắn Facebook mở page ở tab mới an toàn', () => {
    renderChrome();

    const chat = screen.getByRole('link', { name: /Nhắn Facebook/ });
    expect(chat).toHaveAttribute('href', DEFAULT_FACEBOOK_PAGE_URL);
    expect(chat).toHaveAttribute('target', '_blank');
    expect(chat).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('không còn dấu vết nhận diện / tính năng cũ', () => {
    renderChrome();

    expect(document.body.textContent).not.toMatch(/HIÊN nhà Thỏ|Đăng nhập|Ví của tôi|Zalo/);
  });
});

describe('MobileMenu (FR-02)', () => {
  it('đóng sẵn; bấm hamburger thì mở, có cả danh mục con', async () => {
    const user = userEvent.setup();
    render(<MobileMenu links={LINKS} group={GROUP} />);

    const toggle = screen.getByRole('button', { name: 'Mở menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('navigation', { name: 'Menu di động' })).toBeNull();

    await user.click(toggle);

    expect(screen.getByRole('button', { name: 'Đóng menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    const panel = screen.getByRole('navigation', { name: 'Menu di động' });
    expect(within(panel).getByRole('link', { name: 'Trà rời' })).toHaveAttribute(
      'href',
      '/danh-muc/tra-roi',
    );
  });

  it('chọn một mục thì đóng menu', async () => {
    const user = userEvent.setup();
    render(<MobileMenu links={LINKS} group={GROUP} />);

    await user.click(screen.getByRole('button', { name: 'Mở menu' }));
    await user.click(screen.getByRole('link', { name: 'Trang chủ' }));

    expect(screen.queryByRole('navigation', { name: 'Menu di động' })).toBeNull();
  });

  it('mở bằng bàn phím; Esc đóng và trả tiêu điểm về nút', async () => {
    const user = userEvent.setup();
    render(<MobileMenu links={LINKS} group={GROUP} />);

    await user.tab();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('navigation', { name: 'Menu di động' })).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('navigation', { name: 'Menu di động' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Mở menu' })).toHaveFocus();
  });
});

describe('BackToTop (FR-04)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
  });

  it('ẩn ở đầu trang, hiện sau khi cuộn xuống, bấm thì lên đầu', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    render(<BackToTop />);
    expect(screen.queryByRole('button', { name: 'Lên đầu trang' })).toBeNull();

    Object.defineProperty(window, 'scrollY', { value: 800, configurable: true });
    fireEvent.scroll(window);
    await userEvent.click(screen.getByRole('button', { name: 'Lên đầu trang' }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});

describe('CartLink', () => {
  it('có số món thì hiện ô đếm và đọc kèm số món', () => {
    render(<CartLink count={3} />);

    expect(screen.getByRole('link', { name: 'Giỏ hàng, 3 món' })).toBeInTheDocument();
    expect(screen.getByTestId('header-cart-count')).toHaveTextContent('3');
  });
});

describe('Trang 404', () => {
  it('nằm trong khung site, một H1, có lối về trang chủ và trang sản phẩm', () => {
    render(<NotFound />);

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    const main = screen.getByRole('main');
    expect(within(main).getByRole('link', { name: 'Về trang chủ' })).toHaveAttribute('href', '/');
    expect(within(main).getByRole('link', { name: 'Xem sản phẩm' })).toHaveAttribute(
      'href',
      '/san-pham',
    );
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});

describe('Menu xổ "Sản phẩm" trên desktop (R-M1-04)', () => {
  it('Esc ẩn danh sách con và đưa tiêu điểm về "Sản phẩm"; rời mục thì mở lại được', async () => {
    const user = userEvent.setup();
    renderChrome();
    const nav = screen.getByRole('navigation', { name: 'Điều hướng chính' });
    const dropdown = within(nav).getByTestId('nav-dropdown');

    act(() => within(nav).getByRole('link', { name: 'Trà rời' }).focus());
    await user.keyboard('{Escape}');

    expect(dropdown).toHaveAttribute('data-dismissed', 'true');
    expect(within(nav).getByRole('link', { name: 'Sản phẩm' })).toHaveFocus();

    act(() => within(nav).getByRole('link', { name: 'Bài viết' }).focus());
    expect(dropdown).toHaveAttribute('data-dismissed', 'false');
  });
});
