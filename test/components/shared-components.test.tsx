import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { TextArea } from '@/components/ui';

describe('ConfirmDialog', () => {
  const base = {
    title: 'Xóa cả giỏ hàng?',
    confirmLabel: 'Xóa',
    pendingLabel: 'Đang xóa…',
    saving: false,
  };

  it('đóng thì không vẽ gì', () => {
    const { container } = render(
      <ConfirmDialog {...base} open={false} onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('mở: tiêu điểm vào "Hủy", Esc hủy, bấm xác nhận gọi onConfirm', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmDialog {...base} open onConfirm={onConfirm} onCancel={onCancel} />);

    expect(screen.getByRole('alertdialog', { name: 'Xóa cả giỏ hàng?' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hủy' })).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Xóa' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});

describe('EmptyState', () => {
  it('trạng thái rỗng luôn kèm lối đi tiếp', () => {
    render(
      <EmptyState
        message="Giỏ hàng đang trống."
        actionLabel="Xem sản phẩm"
        actionHref="/san-pham"
        testId="cart-empty"
      />,
    );

    expect(screen.getByTestId('cart-empty')).toHaveTextContent('Giỏ hàng đang trống.');
    expect(screen.getByRole('link', { name: 'Xem sản phẩm' })).toHaveAttribute('href', '/san-pham');
  });
});

describe('ui', () => {
  it('TextArea nhận thuộc tính truyền vào', () => {
    render(<TextArea aria-label="Ghi chú" defaultValue="Giao giờ hành chính" />);

    expect(screen.getByRole('textbox', { name: 'Ghi chú' })).toHaveValue('Giao giờ hành chính');
  });
});
