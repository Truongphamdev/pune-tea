import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ProductGallery } from '@/features/catalog/ProductGallery';

const IMAGES = [
  { id: 'i1', url: '/images/products/1.jpg' },
  { id: 'i2', url: '/images/products/2.jpg' },
  { id: 'i3', url: '/images/products/3.jpg' },
];

function counter(): string {
  return screen.getByTestId('lightbox-counter').textContent?.replace(/\s+/g, ' ') ?? '';
}

describe('ProductGallery — bộ ảnh ở trang chi tiết', () => {
  it('không có ảnh: hiện khung giữ chỗ, không có nút phóng to', () => {
    render(<ProductGallery images={[]} title="Trà Đào Hòa Tan" />);
    expect(screen.getByTestId('product-image-placeholder')).toBeTruthy();
    expect(screen.queryByTestId('gallery-main')).toBeNull();
  });

  it('một ảnh: không có dải ảnh nhỏ', () => {
    render(<ProductGallery images={IMAGES.slice(0, 1)} title="Trà Đào Hòa Tan" />);
    expect(screen.getByTestId('gallery-main')).toBeTruthy();
    expect(screen.queryAllByTestId('gallery-thumb')).toHaveLength(0);
  });

  it('nhiều ảnh: có dải ảnh nhỏ, ảnh đầu đang được chọn', () => {
    render(<ProductGallery images={IMAGES} title="Trà Đào Hòa Tan" />);
    const thumbs = screen.getAllByTestId('gallery-thumb');
    expect(thumbs).toHaveLength(3);
    expect(thumbs[0]?.getAttribute('aria-pressed')).toBe('true');
  });

  it('bấm ảnh nhỏ đổi ảnh lớn; bấm ảnh lớn mở đúng ảnh đó', async () => {
    const user = userEvent.setup();
    render(<ProductGallery images={IMAGES} title="Trà Đào Hòa Tan" />);

    await user.click(screen.getAllByTestId('gallery-thumb')[2] as HTMLElement);
    expect(screen.queryByRole('dialog')).toBeNull();

    await user.click(screen.getByTestId('gallery-main'));
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(counter()).toBe('3 / 3');
  });

  it('phím → ← chuyển ảnh vòng tròn, Esc đóng', async () => {
    const user = userEvent.setup();
    render(<ProductGallery images={IMAGES} title="Trà Đào Hòa Tan" />);
    await user.click(screen.getByTestId('gallery-main'));

    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(counter()).toBe('2 / 3');
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(counter()).toBe('3 / 3');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('nút Ảnh sau / Ảnh trước và bấm nền mờ để đóng', async () => {
    const user = userEvent.setup();
    render(<ProductGallery images={IMAGES} title="Trà Đào Hòa Tan" />);
    await user.click(screen.getByTestId('gallery-main'));

    await user.click(screen.getByRole('button', { name: 'Ảnh sau' }));
    expect(counter()).toBe('2 / 3');
    await user.click(screen.getByRole('button', { name: 'Ảnh trước' }));
    expect(counter()).toBe('1 / 3');

    await user.click(screen.getByTestId('lightbox-backdrop'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('Tab xoay vòng trong trình xem ảnh, không lọt ra trang phía sau', async () => {
    const user = userEvent.setup();
    render(<ProductGallery images={IMAGES} title="Trà Đào Hòa Tan" />);
    await user.click(screen.getByTestId('gallery-main'));
    const dialog = screen.getByRole('dialog');

    for (let step = 0; step < 5; step += 1) {
      await user.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
    await user.tab({ shift: true });
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('mở ra thì tiêu điểm vào nút Đóng; đóng bằng nút thì dải ảnh theo ảnh vừa xem', async () => {
    const user = userEvent.setup();
    render(<ProductGallery images={IMAGES} title="Trà Đào Hòa Tan" />);
    await user.click(screen.getByTestId('gallery-main'));
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Đóng' }));

    await user.click(screen.getByRole('button', { name: 'Ảnh sau' }));
    await user.click(screen.getByRole('button', { name: 'Đóng' }));
    expect(screen.getAllByTestId('gallery-thumb')[1]?.getAttribute('aria-pressed')).toBe('true');
  });
});
