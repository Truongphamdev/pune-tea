import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageHeader } from '@/components/PageHeader';
import { listArticles } from '@/data/articles';
import { listCategories } from '@/data/catalog';
import { ArticleBody } from '@/features/articles/ArticleBody';
import { ArticleGrid } from '@/features/articles/ArticleCard';
import { ProductFilters } from '@/features/catalog/ProductFilters';
import { BrandStory } from '@/features/home/BrandStory';
import { FacebookCta } from '@/features/home/FacebookCta';
import { JsonLd } from '@/features/seo/JsonLd';
import { OrderSteps } from '@/features/shell/OrderSteps';

describe('ArticleGrid / ArticleBody', () => {
  it('thẻ bài viết dẫn tới /bai-viet/{slug}, có ngày đăng và thời gian đọc', () => {
    const [article] = listArticles();
    if (!article) throw new Error('thiếu bài viết');
    render(<ArticleGrid articles={[article]} />);

    expect(screen.getByRole('link', { name: article.title })).toHaveAttribute(
      'href',
      `/bai-viet/${article.slug}`,
    );
    expect(screen.getByText(/phút đọc/)).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('alt', article.coverAlt);
  });

  it('dựng đủ các loại khối, liên kết nội bộ là thẻ a', () => {
    render(
      <ArticleBody
        blocks={[
          { type: 'heading', level: 2, text: 'Mục lớn' },
          { type: 'heading', level: 3, text: 'Mục nhỏ' },
          {
            type: 'paragraph',
            content: ['Xem ', { text: 'trà gừng', href: '/san-pham/tra-gung' }],
          },
          { type: 'list', ordered: true, items: ['Bước một', 'Bước hai'] },
          { type: 'list', ordered: false, items: ['Ý một'] },
          { type: 'image', src: '/images/products/tra-gung.jpg', alt: 'Hộp trà gừng' },
        ]}
      />,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Mục lớn' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Mục nhỏ' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'trà gừng' })).toHaveAttribute(
      'href',
      '/san-pham/tra-gung',
    );
    expect(screen.getAllByRole('list')).toHaveLength(2);
    expect(screen.getByRole('img', { name: 'Hộp trà gừng' })).toBeInTheDocument();
  });
});

describe('ProductFilters (FR-21)', () => {
  it('giữ từ khóa khi đổi danh mục; đánh dấu danh mục đang chọn', () => {
    render(
      <ProductFilters
        categories={listCategories()}
        query={{ q: 'trà', categorySlug: 'tra-roi', sort: 'gia-tang' }}
      />,
    );

    expect(screen.getByRole('link', { name: 'Trà rời' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('link', { name: 'Tất cả' })).toHaveAttribute(
      'href',
      '/san-pham?q=tr%C3%A0&sort=gia-tang',
    );
    expect(screen.getByLabelText('Tìm theo tên')).toHaveValue('trà');
    expect(screen.getByLabelText('Sắp xếp')).toHaveValue('gia-tang');
  });
});

describe('Khối nội dung', () => {
  it('FacebookCta mở page ở tab mới, an toàn', () => {
    render(<FacebookCta facebookUrl="https://www.facebook.com/x" />);
    const link = screen.getByRole('link', { name: 'Nhắn Facebook page' });
    expect(link).toHaveAttribute('href', 'https://www.facebook.com/x');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('BrandStory dẫn sang trang Giới thiệu', () => {
    render(<BrandStory />);
    expect(screen.getByRole('link', { name: 'Tìm hiểu thêm' })).toHaveAttribute(
      'href',
      '/gioi-thieu',
    );
  });

  it('OrderSteps có đúng 3 bước', () => {
    render(<OrderSteps />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('PageHeader vẽ đúng một H1', () => {
    render(<PageHeader title="Giỏ hàng" lead="Xem lại giỏ" />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('JsonLd in thẻ script kiểu application/ld+json phân tích được', () => {
    const { container } = render(<JsonLd data={{ '@type': 'Thing', name: 'a<b' }} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(JSON.parse(script?.textContent ?? '')).toEqual({ '@type': 'Thing', name: 'a<b' });
  });
});
