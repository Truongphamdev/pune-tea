import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Toaster, showToast } from '@/components/toast';

describe('Toaster — thông báo nổi toàn site', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('showToast hiện thông báo, mặc định tông thành công', () => {
    render(<Toaster />);

    act(() => showToast('Đã lưu xong.'));

    const toast = screen.getByTestId('toast');
    expect(toast).toHaveTextContent('Đã lưu xong.');
    expect(toast).toHaveAttribute('data-tone', 'success');
  });

  it('tự biến mất sau thời hạn — không thành rác che nội dung', () => {
    render(<Toaster />);
    act(() => showToast('Sắp trôi đi.'));

    act(() => vi.advanceTimersByTime(3_600));

    expect(screen.queryByTestId('toast')).not.toBeInTheDocument();
  });

  it('bấm vào là tắt ngay, không phải chờ', () => {
    render(<Toaster />);
    act(() => showToast('Bấm để tắt.'));

    fireEvent.click(screen.getByTestId('toast'));

    expect(screen.queryByTestId('toast')).not.toBeInTheDocument();
  });

  it('nhiều thông báo xếp chồng, cái nào hết hạn cái đó tự rút', () => {
    render(<Toaster />);
    act(() => showToast('Thứ nhất.'));
    act(() => vi.advanceTimersByTime(2_000));
    act(() => showToast('Thứ hai.'));

    expect(screen.getAllByTestId('toast')).toHaveLength(2);

    // 2s nữa: cái đầu (3.5s tuổi) rút, cái sau còn ở lại
    act(() => vi.advanceTimersByTime(2_000));
    const remaining = screen.getAllByTestId('toast');
    expect(remaining).toHaveLength(1);
    expect(remaining[0]).toHaveTextContent('Thứ hai.');
  });

  it('tông lỗi được đánh dấu riêng để nhìn là biết', () => {
    render(<Toaster />);

    act(() => showToast('Có lỗi rồi.', 'error'));

    expect(screen.getByTestId('toast')).toHaveAttribute('data-tone', 'error');
  });
});
