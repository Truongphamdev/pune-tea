import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CategoryTiles } from '@/features/home/CategoryTiles';
import { Hero } from '@/features/home/Hero';
import { SectionHeading } from '@/features/home/SectionHeading';
import { CATEGORY } from '../fixtures/catalog';

describe('Hero', () => {
  it('đúng một H1 và các nút dẫn đường', () => {
    render(
      <Hero
        title="Trà nền chuẩn vị Việt"
        subtitle="Mô tả ngắn"
        image="/images/categories/tra-roi.jpg"
        imageAlt="Các gói trà nền"
        actions={[{ href: '/san-pham', label: 'Xem sản phẩm' }]}
      />,
    );

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Xem sản phẩm' })).toHaveAttribute('href', '/san-pham');
  });

  it('không truyền nút thì không vẽ hàng nút', () => {
    render(
      <Hero
        title="Tiêu đề"
        subtitle="Mô tả"
        image="/images/categories/tra-roi.jpg"
        imageAlt="Các gói trà nền"
      />,
    );

    expect(screen.queryByRole('link')).toBeNull();
  });
});

describe('CategoryTiles', () => {
  it('mỗi danh mục một ô: tên, số sản phẩm, dẫn tới /danh-muc/{slug}', () => {
    render(<CategoryTiles tiles={[{ category: CATEGORY, productCount: 3 }]} intro="Giới thiệu" />);

    const link = screen.getByRole('link', { name: /Trà hòa tan/ });
    expect(link).toHaveAttribute('href', '/danh-muc/tra-hoa-tan');
    expect(link).toHaveTextContent('3 sản phẩm');
    expect(screen.getByRole('heading', { level: 2, name: 'Sản phẩm' })).toBeInTheDocument();
  });

  it('không có danh mục: không vẽ khối rỗng', () => {
    const { container } = render(<CategoryTiles tiles={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe('SectionHeading', () => {
  it('tiêu đề H2 kèm liên kết "xem tất cả" khi có đích', () => {
    render(<SectionHeading id="featured" title="Sản phẩm nổi bật" href="/san-pham" />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveAttribute('id', 'featured');
    expect(screen.getByRole('link', { name: 'Xem tất cả →' })).toHaveAttribute('href', '/san-pham');
  });
});
