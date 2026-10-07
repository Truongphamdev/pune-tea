import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Breadcrumbs } from '@/features/catalog/Breadcrumbs';
import { CategoryProvider } from '@/features/catalog/category-context';
import { ProductGrid } from '@/features/catalog/ProductGrid';
import { ProductSpecs } from '@/features/catalog/ProductSpecs';
import { CATEGORY, MULTI_VARIANT, SINGLE_VARIANT } from '../fixtures/catalog';

describe('ProductGrid / ProductCard', () => {
  it('mỗi sản phẩm một thẻ: tên dẫn tới /san-pham/{slug}, giá theo biến thể', () => {
    render(
      <CategoryProvider categories={[CATEGORY]}>
        <ProductGrid products={[SINGLE_VARIANT, MULTI_VARIANT]} emptyMessage="Trống" />
      </CategoryProvider>,
    );

    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(2);

    const multi = cards[1] as HTMLElement;
    // Chỉ MỘT link có tên: link ảnh bị ẩn khỏi trình đọc màn hình để không đọc trùng hai lần
    const links = within(multi).getAllByRole('link', { name: 'Trà Đào Hòa Tan' });
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/san-pham/tra-dao-hoa-tan']);
    expect(within(multi).getByText('Từ 45.000 ₫')).toBeInTheDocument();
    expect(within(cards[0] as HTMLElement).getByText('39.000 ₫')).toBeInTheDocument();
  });

  it('gắn nhãn danh mục dẫn tới /danh-muc/{slug} khi danh mục có trong ngữ cảnh', () => {
    render(
      <CategoryProvider categories={[CATEGORY]}>
        <ProductGrid products={[MULTI_VARIANT]} emptyMessage="Trống" />
      </CategoryProvider>,
    );

    expect(screen.getByRole('link', { name: 'Trà hòa tan' })).toHaveAttribute(
      'href',
      '/danh-muc/tra-hoa-tan',
    );
  });

  it('danh mục không có trong ngữ cảnh: không vẽ nhãn, thẻ vẫn hiện', () => {
    render(<ProductGrid products={[SINGLE_VARIANT]} emptyMessage="Trống" />);

    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Trà túi lọc' })).toBeNull();
  });

  it('không có sản phẩm: hiện lời nhắn rỗng', () => {
    render(<ProductGrid products={[]} emptyMessage="Chưa có sản phẩm nào." />);

    expect(screen.getByText('Chưa có sản phẩm nào.')).toBeInTheDocument();
  });
});

describe('ProductSpecs', () => {
  it('in từng dòng thông số thành cặp nhãn – giá trị', () => {
    render(<ProductSpecs specs={SINGLE_VARIANT.specs} />);

    expect(screen.getByText('Quy cách')).toBeInTheDocument();
    expect(screen.getByText('40g (20 túi)')).toBeInTheDocument();
  });

  it('không có thông số: không vẽ khung rỗng', () => {
    const { container } = render(<ProductSpecs specs={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe('Breadcrumbs', () => {
  it('mục cuối là trang hiện tại, không phải liên kết', () => {
    render(
      <Breadcrumbs items={[{ href: '/', label: 'Trang chủ' }, { label: 'Trà Đào Hòa Tan' }]} />,
    );

    expect(screen.getByRole('link', { name: 'Trang chủ' })).toHaveAttribute('href', '/');
    expect(screen.getByText('Trà Đào Hòa Tan')).toHaveAttribute('aria-current', 'page');
  });
});
