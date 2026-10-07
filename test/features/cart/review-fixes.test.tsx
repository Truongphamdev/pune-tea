import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { getProductBySlug } from '@/data/catalog';
import { setSessionForTest } from '@/features/auth/session-store';
import { AddToCartButton } from '@/features/cart/AddToCartButton';
import { describeAdd, MAX_CART_LINES, type Cart } from '@/features/cart/cart';
import {
  CART_STORAGE_KEY,
  cartActions,
  resetCartStoreForTest,
  useCart,
} from '@/features/cart/cart-store';
import { CART_OWNER_KEY, reconcileCartOwner } from '@/features/cart/cart-owner';
import { CartPageView } from '@/features/cart/CartPageView';
import { HeaderCart } from '@/features/cart/HeaderCart';
import { QuantityStepper } from '@/features/cart/QuantityStepper';
import { Toaster } from '@/components/toast';

const GUNG = { productSlug: 'tra-gung', variantId: '40g' };
const ORPHAN = { productSlug: 'khong-con-ban', variantId: 'x', quantity: 12 };

beforeEach(() => {
  window.localStorage.clear();
  resetCartStoreForTest();
  setSessionForTest({ name: 'Lan', email: 'lan@example.com' });
});

describe('Số trên header khớp trang giỏ (R-F-05, BR-11)', () => {
  it('không đếm dòng trỏ tới sản phẩm không tồn tại', () => {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([ORPHAN, { ...GUNG, quantity: 3 }]),
    );
    render(
      <>
        <HeaderCart />
        <CartPageView facebookUrl="https://www.facebook.com/x" />
      </>,
    );

    expect(screen.getByTestId('header-cart-count')).toHaveTextContent('3');
    expect(screen.getByRole('heading', { name: '3 món trong giỏ' })).toBeInTheDocument();
  });

  it('giỏ chỉ có dòng mồ côi: trang báo trống và header không hiện số', () => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([ORPHAN]));
    render(
      <>
        <HeaderCart />
        <CartPageView facebookUrl="https://www.facebook.com/x" />
      </>,
    );

    expect(screen.getByTestId('cart-empty')).toBeInTheDocument();
    expect(screen.queryByTestId('header-cart-count')).toBeNull();
  });
});

describe('Báo đúng kết quả khi thêm vào giỏ (R-F-06)', () => {
  it('describeAdd phân biệt đã thêm, chạm trần số lượng và giỏ đầy', () => {
    const full: Cart = Array.from({ length: MAX_CART_LINES }, (_, index) => ({
      productSlug: `sp-${index}`,
      variantId: 'a',
      quantity: 1,
    }));

    expect(describeAdd([], { ...GUNG, quantity: 1 })).toBe('added');
    expect(describeAdd([{ ...GUNG, quantity: 98 }], { ...GUNG, quantity: 5 })).toBe('added');
    expect(describeAdd([{ ...GUNG, quantity: 99 }], { ...GUNG, quantity: 1 })).toBe('max-quantity');
    expect(describeAdd(full, { ...GUNG, quantity: 1 })).toBe('cart-full');
    // Dòng đã có trong giỏ đầy vẫn cộng dồn được
    expect(describeAdd(full, { productSlug: 'sp-0', variantId: 'a', quantity: 1 })).toBe('added');
  });

  it('đã 99 món: không báo "Đã thêm", báo đã đủ', async () => {
    const product = getProductBySlug('tra-gung');
    if (!product) throw new Error('thiếu dữ liệu');
    act(() => {
      cartActions.add({ ...GUNG, quantity: 99 });
    });
    render(
      <>
        <AddToCartButton product={product} />
        <Toaster />
      </>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Thêm vào giỏ' }));

    const toast = await screen.findByTestId('toast');
    expect(toast).toHaveAttribute('data-tone', 'error');
    expect(toast).toHaveTextContent(/tối đa 99/);
    expect(toast).not.toHaveTextContent(/Đã thêm/);
  });
});

describe('Kho giỏ hàng — các nhánh với trình duyệt (R-F-08)', () => {
  function Count() {
    return <output>{useCart().length}</output>;
  }

  it('tab khác sửa giỏ thì tab này cập nhật theo sự kiện storage', () => {
    render(<Count />);
    expect(screen.getByRole('status')).toHaveTextContent('0');

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([{ ...GUNG, quantity: 1 }]));
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: CART_STORAGE_KEY }));
    });
    expect(screen.getByRole('status')).toHaveTextContent('1');

    // Khóa khác đổi thì bỏ qua
    window.localStorage.setItem(CART_STORAGE_KEY, '[]');
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'khoa-khac' }));
    });
    expect(screen.getByRole('status')).toHaveTextContent('1');
  });

  it('localStorage bị chặn: giỏ vẫn chạy trong bộ nhớ, không ném lỗi', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    render(<Count />);

    act(() => {
      cartActions.add({ ...GUNG, quantity: 1 });
    });
    expect(screen.getByRole('status')).toHaveTextContent('1');

    getItem.mockRestore();
    setItem.mockRestore();
  });
});

describe('QuantityStepper — gõ số trực tiếp (R-F-14)', () => {
  function Harness() {
    const [value, setValue] = useState(1);
    return <QuantityStepper value={value} onChange={setValue} label="Trà Gừng" />;
  }

  it('xóa trắng rồi gõ 5 ra 5, không phải 15', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByLabelText('Số lượng Trà Gừng');

    await user.clear(input);
    await user.type(input, '5');
    expect(input).toHaveValue('5');

    await user.tab();
    expect(input).toHaveValue('5');
  });

  it('để trống rồi rời ô thì quay về số lượng đang có hiệu lực', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByLabelText('Số lượng Trà Gừng');

    await user.clear(input);
    await user.tab();
    expect(input).toHaveValue('1');
  });
});

describe('Hộp thoại giữ và trả tiêu điểm (R-F-07)', () => {
  function Harness() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          Mở
        </button>
        <a href="/">Nền</a>
        <ConfirmDialog
          open={open}
          title="Xóa?"
          confirmLabel="Xóa"
          pendingLabel="…"
          saving={false}
          onConfirm={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </>
    );
  }

  it('Tab đi vòng trong hộp thoại; đóng xong tiêu điểm về nút đã mở', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Mở' }));

    const dialog = screen.getByRole('alertdialog');
    const cancel = within(dialog).getByRole('button', { name: 'Hủy' });
    const confirm = within(dialog).getByRole('button', { name: 'Xóa' });
    expect(cancel).toHaveFocus();

    await user.tab();
    expect(confirm).toHaveFocus();
    await user.tab();
    expect(cancel).toHaveFocus();
    await user.tab({ shift: true });
    expect(confirm).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Mở' })).toHaveFocus();
  });
});

describe('Giỏ hàng chỉ thuộc về một tài khoản (R-F-27)', () => {
  const seed = (): void => {
    act(() => {
      cartActions.add({ ...GUNG, quantity: 2 });
    });
  };
  const cartSize = (): number =>
    (JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? '[]') as unknown[]).length;

  it('giỏ chưa ghi chủ thì gán cho người đang đăng nhập, không xóa', () => {
    seed();
    reconcileCartOwner('lan@example.com');

    expect(cartSize()).toBe(1);
    expect(window.localStorage.getItem(CART_OWNER_KEY)).toBe('lan@example.com');
  });

  it('cùng một người thì giữ nguyên giỏ', () => {
    seed();
    reconcileCartOwner('lan@example.com');
    reconcileCartOwner('lan@example.com');
    expect(cartSize()).toBe(1);
  });

  it('người khác đăng nhập trên cùng máy: giỏ của người trước bị xóa', () => {
    seed();
    reconcileCartOwner('lan@example.com');
    reconcileCartOwner('minh@example.com');

    expect(cartSize()).toBe(0);
    expect(window.localStorage.getItem(CART_OWNER_KEY)).toBe('minh@example.com');
  });

  it('phiên mất mà không bấm Đăng xuất: giỏ cũng bị xóa', () => {
    seed();
    reconcileCartOwner('lan@example.com');
    reconcileCartOwner(null);

    expect(cartSize()).toBe(0);
    expect(window.localStorage.getItem(CART_OWNER_KEY)).toBeNull();
  });

  it('HeaderCart tự đối chiếu khi biết chắc phiên; CHƯA biết thì không đụng vào giỏ', () => {
    seed();
    window.localStorage.setItem(CART_OWNER_KEY, 'lan@example.com');

    setSessionForTest(undefined);
    const { rerender } = render(<HeaderCart />);
    expect(cartSize()).toBe(1);

    act(() => setSessionForTest({ name: 'Minh', email: 'minh@example.com' }));
    rerender(<HeaderCart />);
    expect(cartSize()).toBe(0);
  });
});
