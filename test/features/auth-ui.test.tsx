import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginForm, RegisterForm } from '@/features/auth/AuthForms';
import { ChangePasswordForm } from '@/features/auth/ChangePasswordForm';
import { HeaderAccount } from '@/features/auth/HeaderAccount';
import { OrderHistory } from '@/features/auth/OrderHistory';
import { ensureSession, refreshSession, setSessionForTest } from '@/features/auth/session-store';
import type { SavedOrder } from '@/server/orders';

function mockSession(user: { name: string; email: string } | null, ok = true): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok, json: async () => ({ user }) })),
  );
}

beforeEach(() => {
  // Kho phiên dùng chung cả trang — đưa về trạng thái "chưa hỏi" trước mỗi ca
  setSessionForTest(undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('HeaderAccount', () => {
  it('chưa đăng nhập: dẫn tới trang đăng nhập', async () => {
    mockSession(null);
    render(<HeaderAccount />);

    expect(screen.getByRole('link', { name: 'Đăng nhập' })).toHaveAttribute('href', '/dang-nhap');
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/phien', expect.anything()));
    expect(screen.queryByTestId('header-account-dot')).toBeNull();
  });

  it('đã đăng nhập: dẫn tới trang tài khoản, có chấm báo hiệu', async () => {
    mockSession({ name: 'Lan', email: 'lan@example.com' });
    render(<HeaderAccount />);

    const link = await screen.findByRole('link', { name: 'Tài khoản của Lan' });
    expect(link).toHaveAttribute('href', '/tai-khoan');
    expect(screen.getByTestId('header-account-dot')).toBeInTheDocument();
  });

  it('API lỗi hoặc trả dữ liệu lạ: coi như chưa đăng nhập, không vỡ', async () => {
    mockSession({ name: 'Lan' } as never, false);
    render(<HeaderAccount />);

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.getByRole('link', { name: 'Đăng nhập' })).toBeInTheDocument();
  });

  it('mất mạng: không ném lỗi', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline');
      }),
    );
    render(<HeaderAccount />);

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.getByRole('link', { name: 'Đăng nhập' })).toBeInTheDocument();
  });
});

describe('Kho phiên đăng nhập', () => {
  it('nhiều nơi hỏi cùng lúc chỉ sinh một yêu cầu; đã biết rồi thì không hỏi lại', async () => {
    mockSession({ name: 'Lan', email: 'lan@example.com' });

    const [first, second] = await Promise.all([ensureSession(), ensureSession()]);
    expect(first).toEqual({ name: 'Lan', email: 'lan@example.com' });
    expect(second).toBe(first);
    expect(fetch).toHaveBeenCalledTimes(1);

    await ensureSession();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe('Kho phiên — khi máy chủ không trả lời được', () => {
  it('giữ nguyên điều đã biết, không coi lỗi mạng là đã đăng xuất', async () => {
    const lan = { name: 'Lan', email: 'lan@example.com' };
    setSessionForTest(lan);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline');
      }),
    );

    expect(await refreshSession()).toEqual(lan);
    expect(await ensureSession()).toEqual(lan);
  });
});

describe('Form đăng nhập / đăng ký', () => {
  it('đăng nhập: có ô email, mật khẩu, mang theo nơi quay về và link sang đăng ký', () => {
    const { container } = render(<LoginForm next="/gio-hang" />);

    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Mật khẩu')).toHaveAttribute('autocomplete', 'current-password');
    expect(container.querySelector('input[name="tiep"]')).toHaveValue('/gio-hang');
    expect(screen.getByRole('link', { name: 'Đăng ký' })).toHaveAttribute(
      'href',
      '/dang-ky?tiep=%2Fgio-hang',
    );
  });

  it('đăng ký: chỉ hỏi họ tên, email, mật khẩu — không có bước xác minh email', () => {
    render(<RegisterForm next="/tai-khoan" />);

    expect(screen.getByLabelText('Họ tên')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText(/Mật khẩu/)).toHaveAttribute('autocomplete', 'new-password');
    expect(screen.queryByText(/xác minh/i)).toBeNull();
    expect(screen.getByRole('button', { name: 'Đăng ký' })).toBeEnabled();
  });
});

describe('ChangePasswordForm', () => {
  it('hỏi mật khẩu hiện tại và mật khẩu mới, đúng kiểu ô và gợi ý trình quản lý mật khẩu', () => {
    render(<ChangePasswordForm />);

    expect(screen.getByLabelText('Mật khẩu hiện tại')).toHaveAttribute(
      'autocomplete',
      'current-password',
    );
    const next = screen.getByLabelText(/Mật khẩu mới/);
    expect(next).toHaveAttribute('type', 'password');
    expect(next).toHaveAttribute('autocomplete', 'new-password');
    expect(screen.getByRole('button', { name: 'Đổi mật khẩu' })).toBeEnabled();
  });
});

describe('OrderHistory', () => {
  const order: SavedOrder = {
    reference: 'PT-261006-0042',
    customerName: 'Lan',
    phone: '0901234567',
    address: '12 Lê Lợi',
    note: 'Giao giờ hành chính',
    totalVnd: 78_000,
    createdAt: '2026-10-06 14:30:00',
    items: [
      {
        productSlug: 'tra-gung',
        productName: 'Trà Gừng',
        variantLabel: '40g (20 túi)',
        unitPriceVnd: 39_000,
        quantity: 2,
        lineTotalVnd: 78_000,
      },
    ],
  };

  it('chưa có đơn: mời xem sản phẩm', () => {
    render(<OrderHistory orders={[]} />);
    expect(screen.getByRole('link', { name: 'Xem sản phẩm' })).toHaveAttribute('href', '/san-pham');
  });

  it('hiện mã đơn, dòng hàng, tổng tiền và giờ Việt Nam', () => {
    render(<OrderHistory orders={[order]} />);

    expect(screen.getByRole('heading', { name: 'PT-261006-0042' })).toBeInTheDocument();
    expect(screen.getByText('Trà Gừng — 40g (20 túi) × 2')).toBeInTheDocument();
    expect(screen.getAllByText('78.000 ₫')).toHaveLength(2);
    // 14:30 UTC = 21:30 giờ Việt Nam
    expect(screen.getByText(/21:30/)).toBeInTheDocument();
    expect(screen.getByText(/Ghi chú: Giao giờ hành chính/)).toBeInTheDocument();
  });
});
