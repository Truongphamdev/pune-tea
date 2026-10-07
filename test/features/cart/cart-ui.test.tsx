import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getProductBySlug } from '@/data/catalog';
import { goToLogin, setSessionForTest } from '@/features/auth/session-store';
import { Toaster } from '@/components/toast';
import { AddToCartButton } from '@/features/cart/AddToCartButton';
import type { CartLine } from '@/features/cart/cart';
import { CART_STORAGE_KEY, cartActions, resetCartStoreForTest } from '@/features/cart/cart-store';
import { buildCartView } from '@/features/cart/cart-view';
import { CartPageView } from '@/features/cart/CartPageView';
import { buildOrderMessage, type CustomerInfo } from '@/features/cart/order';
import { placeOrderAction } from '@/features/cart/order-action';
import { HeaderCart } from '@/features/cart/HeaderCart';
import { PurchasePanel } from '@/features/cart/PurchasePanel';

/** Giữ nguyên kho phiên thật, chỉ thay việc chuyển trang — jsdom không điều hướng được. */
vi.mock('@/features/auth/session-store', async (original) => ({
  ...(await original<typeof import('@/features/auth/session-store')>()),
  goToLogin: vi.fn(),
}));

/**
 * Server action không chạy được trong jsdom (cần cookie của một request thật) — thay bằng bản
 * giả soạn nội dung đơn từ CHÍNH các hàm thật, với mã tham chiếu cố định.
 */
vi.mock('@/features/cart/order-action', () => ({ placeOrderAction: vi.fn() }));

const SIGNED_IN = { name: 'Lan', email: 'lan@example.com' };

const FACEBOOK = 'https://www.facebook.com/share/19fniaMu8F/';

function product(slug: string) {
  const found = getProductBySlug(slug);
  if (!found) throw new Error(`thiếu sản phẩm ${slug}`);
  return found;
}

function stored(): unknown {
  return JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? '[]');
}

beforeEach(() => {
  window.localStorage.clear();
  resetCartStoreForTest();
  setSessionForTest(SIGNED_IN);
  vi.mocked(goToLogin).mockClear();
  vi.mocked(placeOrderAction).mockReset();
  vi.mocked(placeOrderAction).mockImplementation(async (input) => {
    const { lines, customer } = input as { lines: CartLine[]; customer: CustomerInfo };
    const reference = 'PT-261006-0001';
    return {
      ok: true,
      reference,
      message: buildOrderMessage(buildCartView(lines), customer, reference),
    };
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('AddToCartButton (FR-20)', () => {
  it('một biến thể: bấm là thêm vào giỏ và ghi localStorage', async () => {
    render(<AddToCartButton product={product('tra-gung')} />);
    await userEvent.click(screen.getByRole('button', { name: 'Thêm vào giỏ' }));

    await waitFor(() =>
      expect(stored()).toEqual([{ productSlug: 'tra-gung', variantId: '40g', quantity: 1 }]),
    );
    expect(goToLogin).not.toHaveBeenCalled();
  });

  it('chưa đăng nhập: KHÔNG thêm gì, đưa sang trang đăng nhập (FR-84)', async () => {
    setSessionForTest(null);
    render(<AddToCartButton product={product('tra-gung')} />);
    await userEvent.click(screen.getByRole('button', { name: 'Thêm vào giỏ' }));

    await waitFor(() => expect(goToLogin).toHaveBeenCalledTimes(1));
    expect(stored()).toEqual([]);
  });

  it('nhiều biến thể: dẫn sang trang chi tiết để chọn loại, không đoán hộ', () => {
    render(<AddToCartButton product={product('tra-dao-hoa-tan')} />);

    expect(screen.getByRole('link', { name: 'Chọn loại' })).toHaveAttribute(
      'href',
      '/san-pham/tra-dao-hoa-tan',
    );
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('PurchasePanel (FR-31, FR-32)', () => {
  it('đổi biến thể thì giá đổi theo; thêm đúng biến thể và số lượng đã chọn', async () => {
    render(<PurchasePanel product={product('tra-dao-hoa-tan')} />);
    expect(screen.getByTestId('price')).toHaveTextContent('45.000 ₫');

    await userEvent.click(screen.getByRole('radio', { name: '240g (16 gói × 15g)' }));
    expect(screen.getByTestId('price')).toHaveTextContent('58.000 ₫');

    await userEvent.click(screen.getByRole('button', { name: /Tăng số lượng/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Thêm vào giỏ hàng' }));

    expect(await screen.findByRole('link', { name: /Xem giỏ hàng/ })).toHaveAttribute(
      'href',
      '/gio-hang',
    );
    expect(stored()).toEqual([{ productSlug: 'tra-dao-hoa-tan', variantId: '240g', quantity: 2 }]);
  });

  it('chưa đăng nhập: không thêm, không hiện lối sang giỏ, đưa sang đăng nhập (FR-84)', async () => {
    setSessionForTest(null);
    render(<PurchasePanel product={product('tra-gung')} />);
    await userEvent.click(screen.getByRole('button', { name: 'Thêm vào giỏ hàng' }));

    await waitFor(() => expect(goToLogin).toHaveBeenCalledTimes(1));
    expect(stored()).toEqual([]);
    expect(screen.queryByRole('link', { name: /Xem giỏ hàng/ })).toBeNull();
  });

  it('sản phẩm một biến thể không hiện bộ chọn', () => {
    render(<PurchasePanel product={product('tra-gung')} />);
    expect(screen.queryByRole('radio')).toBeNull();
  });
});

describe('HeaderCart (FR-01)', () => {
  it('giỏ trống không vẽ ô đếm; thêm hàng thì số cập nhật tức thì', () => {
    render(<HeaderCart />);
    expect(screen.queryByTestId('header-cart-count')).toBeNull();

    act(() => cartActions.add({ productSlug: 'tra-gung', variantId: '40g', quantity: 3 }));
    expect(screen.getByTestId('header-cart-count')).toHaveTextContent('3');
  });
});

describe('CartPageView (FR-42, FR-43)', () => {
  it('giỏ trống → trạng thái rỗng có lối về trang sản phẩm', () => {
    render(<CartPageView facebookUrl={FACEBOOK} />);
    expect(within(screen.getByTestId('cart-empty')).getByRole('link')).toHaveAttribute(
      'href',
      '/san-pham',
    );
  });

  it('đọc giỏ từ localStorage, tính thành tiền và tổng; tăng số lượng thì tổng đổi', async () => {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([
        { productSlug: 'tra-gung', variantId: '40g', quantity: 2 },
        { productSlug: 'tra-dao-hoa-tan', variantId: '240g', quantity: 1 },
      ]),
    );
    render(<CartPageView facebookUrl={FACEBOOK} />);

    expect(screen.getAllByTestId('cart-row')).toHaveLength(2);
    expect(screen.getByTestId('cart-total')).toHaveTextContent('136.000 ₫');

    await userEvent.click(screen.getByRole('button', { name: 'Tăng số lượng Trà Gừng' }));
    expect(screen.getByTestId('cart-total')).toHaveTextContent('175.000 ₫');
  });

  it('localStorage hỏng hoặc trỏ tới sản phẩm lạ → trang vẫn dựng (BR-11)', () => {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([
        { productSlug: 'khong-co', variantId: 'x', quantity: 1 },
        { productSlug: 'tra-gung', variantId: '40g', quantity: 1, priceVnd: 1 },
      ]),
    );
    render(<CartPageView facebookUrl={FACEBOOK} />);

    expect(screen.getAllByTestId('cart-row')).toHaveLength(1);
    // Giá sửa tay trong localStorage không có tác dụng (BR-10)
    expect(screen.getByTestId('cart-total')).toHaveTextContent('39.000 ₫');
  });

  it('xóa một dòng; xóa cả giỏ phải qua hộp thoại hỏi lại', async () => {
    act(() => {
      cartActions.add({ productSlug: 'tra-gung', variantId: '40g', quantity: 1 });
      cartActions.add({ productSlug: 'tra-den-barista', variantId: '200g', quantity: 1 });
    });
    render(<CartPageView facebookUrl={FACEBOOK} />);

    await userEvent.click(screen.getByRole('button', { name: /Xóa Trà Gừng/ }));
    expect(screen.getAllByTestId('cart-row')).toHaveLength(1);

    await userEvent.click(screen.getByRole('button', { name: 'Xóa cả giỏ' }));
    expect(screen.getAllByTestId('cart-row')).toHaveLength(1);
    await userEvent.click(screen.getByTestId('confirm-clear-cart'));
    expect(screen.getByTestId('cart-empty')).toBeInTheDocument();
  });
});

describe('Đặt hàng qua Facebook (FR-50…54)', () => {
  async function openCartWithItem() {
    act(() => cartActions.add({ productSlug: 'tra-gung', variantId: '40g', quantity: 2 }));
    render(<CartPageView facebookUrl={FACEBOOK} />);
    return userEvent.setup();
  }

  async function fillForm(user: ReturnType<typeof userEvent.setup>, phone = '0901234567') {
    await user.type(screen.getByLabelText('Họ tên'), 'Nguyễn Lan');
    await user.type(screen.getByLabelText('Số điện thoại'), phone);
    await user.type(screen.getByLabelText('Địa chỉ nhận hàng'), '12 Lê Lợi, Biên Hòa');
  }

  it('bỏ trống form: báo lỗi từng ô và KHÔNG mở Facebook', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const user = await openCartWithItem();
    await user.click(screen.getByRole('button', { name: 'Đặt hàng qua Facebook' }));

    expect(screen.getByText('Vui lòng nhập họ tên.')).toBeInTheDocument();
    expect(screen.getByText(/10 chữ số/)).toBeInTheDocument();
    expect(screen.getByText('Vui lòng nhập địa chỉ nhận hàng.')).toBeInTheDocument();
    expect(open).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('số điện thoại sai thì không mở Facebook', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const user = await openCartWithItem();
    await fillForm(user, '09012abc');
    await user.click(screen.getByRole('button', { name: 'Đặt hàng qua Facebook' }));

    expect(open).not.toHaveBeenCalled();
  });

  it('hợp lệ: chép nội dung đơn, mở page ở tab mới, hiện hộp thoại hướng dẫn', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const user = await openCartWithItem();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Đặt hàng qua Facebook' }));

    const dialog = await screen.findByRole('dialog');
    expect(open).toHaveBeenCalledWith(FACEBOOK, '_blank', 'noopener,noreferrer');

    const message = (within(dialog).getByLabelText('Nội dung đơn hàng') as HTMLTextAreaElement)
      .value;
    expect(writeText).toHaveBeenCalledWith(message);
    expect(message).toContain('PT-261006-0001');
    expect(message).toContain('Trà Gừng — 40g (20 túi) × 2 = 78.000 ₫');
    expect(message).toContain('Tổng cộng: 78.000 ₫');
    expect(message).toContain('Người nhận: Nguyễn Lan');
    expect(within(dialog).getByText(/Dán nội dung vừa sao chép/)).toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: 'Mở Facebook page' })).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    );
  });

  it('clipboard bị chặn: vẫn hiện nội dung đơn để tự chép (FR-52)', async () => {
    vi.spyOn(window, 'open').mockImplementation(() => null);
    const user = await openCartWithItem();
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'));
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Đặt hàng qua Facebook' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/không cho sao chép tự động/)).toBeInTheDocument();
    const box = within(dialog).getByLabelText('Nội dung đơn hàng') as HTMLTextAreaElement;
    expect(box.value).toContain('Tổng cộng: 78.000 ₫');
  });

  it('không tự xóa giỏ: giữ thì còn nguyên, chọn xóa mới xóa (FR-53)', async () => {
    vi.spyOn(window, 'open').mockImplementation(() => null);
    const user = await openCartWithItem();
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Đặt hàng qua Facebook' }));
    await screen.findByRole('dialog');

    await user.click(screen.getByRole('button', { name: 'Giữ giỏ hàng' }));
    expect(screen.getAllByTestId('cart-row')).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Đặt hàng qua Facebook' }));
    await user.click(await screen.findByRole('button', { name: 'Xóa giỏ hàng' }));
    expect(screen.getByTestId('cart-empty')).toBeInTheDocument();
  });

  it('điền sẵn họ tên từ tài khoản đang đăng nhập, khách sửa được', async () => {
    act(() => {
      cartActions.add({ productSlug: 'tra-gung', variantId: '40g', quantity: 1 });
    });
    render(<CartPageView facebookUrl={FACEBOOK} customerName="Nguyễn Lan" />);

    const name = screen.getByLabelText('Họ tên');
    expect(name).toHaveValue('Nguyễn Lan');
    await userEvent.clear(name);
    await userEvent.type(name, 'Trần Minh');
    expect(name).toHaveValue('Trần Minh');
  });

  it('gửi lên máy chủ đúng các dòng giỏ và thông tin nhận hàng, không gửi giá', async () => {
    vi.spyOn(window, 'open').mockImplementation(() => null);
    const user = await openCartWithItem();
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Đặt hàng qua Facebook' }));
    await screen.findByRole('dialog');

    expect(placeOrderAction).toHaveBeenCalledWith({
      lines: [{ productSlug: 'tra-gung', variantId: '40g', quantity: 2 }],
      customer: {
        name: 'Nguyễn Lan',
        phone: '0901234567',
        address: '12 Lê Lợi, Biên Hòa',
        note: '',
      },
    });
    expect(screen.getByTestId('order-saved')).toBeInTheDocument();
  });

  it('không gọi được máy chủ: báo lỗi, KHÔNG hiện hộp thoại như thể đơn đã đặt (FR-84)', async () => {
    vi.spyOn(window, 'open').mockImplementation(() => null);
    vi.mocked(placeOrderAction).mockRejectedValue(new Error('offline'));
    const user = await openCartWithItem();
    render(<Toaster />);
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Đặt hàng qua Facebook' }));

    expect(await screen.findByTestId('toast')).toHaveTextContent(/Không gửi được đơn/);
    expect(screen.queryByRole('dialog')).toBeNull();
    // Form mở lại để khách thử lần nữa
    expect(screen.getByRole('button', { name: 'Đặt hàng qua Facebook' })).toBeEnabled();
  });

  it('phiên đăng nhập đã mất: đưa sang đăng nhập, không hiện hộp thoại', async () => {
    vi.spyOn(window, 'open').mockImplementation(() => null);
    vi.mocked(placeOrderAction).mockResolvedValue({
      ok: false,
      code: 'unauthenticated',
      error: 'Vui lòng đăng nhập để đặt hàng.',
    });
    const user = await openCartWithItem();
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Đặt hàng qua Facebook' }));

    await waitFor(() => expect(goToLogin).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('bấm đúp chỉ tạo MỘT đơn và mở MỘT tab', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const user = await openCartWithItem();
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    // Máy chủ thật cần thời gian trả lời — cú bấm thứ hai rơi vào lúc đơn đầu còn đang gửi
    const instant = vi.mocked(placeOrderAction).getMockImplementation();
    vi.mocked(placeOrderAction).mockImplementation(async (input) => {
      await new Promise((resolve) => setTimeout(resolve, 60));
      return instant!(input);
    });
    await fillForm(user);
    const submit = screen.getByRole('button', { name: 'Đặt hàng qua Facebook' });
    await user.dblClick(submit);
    expect(screen.getByRole('button', { name: 'Đang gửi đơn…' })).toBeDisabled();
    await screen.findByRole('dialog');

    // Hộp thoại đang mở mà form bị gửi lần nữa (Enter trong ô nhập) cũng không tạo đơn mới
    await user.type(screen.getByLabelText('Họ tên'), '{Enter}');

    expect(placeOrderAction).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledTimes(1);
  });

  it('có ghi rõ website không thu tiền (BR-13)', async () => {
    await openCartWithItem();
    expect(screen.getByText(/Website không thu tiền/)).toBeInTheDocument();
  });
});
