import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AppError from '@/app/error';

/**
 * Màn hình lỗi chung phải giữ khách lại thay vì đẩy họ đi.
 *
 * Suốt sự cố ổ đầy 09/2026 khách chỉ thấy "Application error: a server-side exception has
 * occurred" — không tiếng Việt, không nút bấm. Bài này canh ba thứ tối thiểu: nói bằng tiếng
 * Việt, có nút thử lại gọi đúng `reset`, và có đường về trang chủ.
 */
describe('AppError', () => {
  it('nói bằng tiếng Việt, kèm mã sự cố để tra log máy chủ', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(
      <AppError
        error={Object.assign(new Error('boom'), { digest: '2180288181' })}
        reset={() => undefined}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Cửa hàng đang gặp trục trặc' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Mã sự cố: 2180288181/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Về trang chủ' })).toHaveAttribute('href', '/');
  });

  it('nút "Thử lại" gọi reset của Next để dựng lại trang', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const reset = vi.fn();

    render(<AppError error={new Error('boom')} reset={reset} />);
    await userEvent.click(screen.getByRole('button', { name: 'Thử lại' }));

    expect(reset).toHaveBeenCalledTimes(1);
  });
});
