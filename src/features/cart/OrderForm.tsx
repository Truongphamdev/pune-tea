'use client';

import { useRef, useState } from 'react';
import { showToast } from '@/components/toast';
import { Field, TextArea, TextInput } from '@/components/ui';
import { goToLogin } from '@/features/auth/session-store';
import type { CartView } from './cart-view';
import {
  EMPTY_CUSTOMER,
  hasErrors,
  validateCustomer,
  type CustomerErrors,
  type CustomerInfo,
} from './order';
import { placeOrderAction } from './order-action';
import { copyText, OrderDialog } from './OrderDialog';
import { cartActions } from './cart-store';

interface PlacedOrder {
  readonly message: string;
  readonly copied: boolean;
}

type Resolved =
  | { readonly kind: 'placed'; readonly message: string }
  | { readonly kind: 'login-required' }
  | { readonly kind: 'rejected'; readonly error: string };

/**
 * Chốt đơn ở máy chủ: tính lại tiền và lưu vào lịch sử (FR-84). Không có đường soạn đơn tại
 * trình duyệt: một đơn "đã đặt" mà không nằm trong lịch sử là điều FR-84 không cho phép, nên
 * không gọi được máy chủ thì báo lỗi để khách thử lại.
 */
async function resolveOrder(view: CartView, customer: CustomerInfo): Promise<Resolved> {
  try {
    const result = await placeOrderAction({
      lines: view.rows.map((row) => row.line),
      customer,
    });
    if (result.ok) return { kind: 'placed', message: result.message };
    return result.code === 'unauthenticated'
      ? { kind: 'login-required' }
      : { kind: 'rejected', error: result.error };
  } catch {
    return {
      kind: 'rejected',
      error: 'Không gửi được đơn lên máy chủ. Kiểm tra kết nối mạng rồi thử lại.',
    };
  }
}

type FieldChange = (field: keyof CustomerInfo, value: string) => void;

/** Trạng thái và việc chốt đơn của form — tách khỏi phần dựng giao diện. */
function useOrderSubmit(view: CartView, facebookUrl: string, customerName: string) {
  const [customer, setCustomer] = useState<CustomerInfo>({
    ...EMPTY_CUSTOMER,
    name: customerName,
  });
  const [errors, setErrors] = useState<CustomerErrors>({});
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const [pending, setPending] = useState(false);
  // Ref song song với state: hai cú bấm trong cùng một nhịp vẽ đều thấy `pending` còn `false`
  const submitting = useRef(false);

  const setField: FieldChange = (field, value) =>
    setCustomer((current) => ({ ...current, [field]: value }));

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    // Chặn bấm đúp: mỗi lần chốt là một đơn được lưu, hai cú bấm liền nhau là hai đơn. Đơn vừa
    // đặt còn đang hiện trong hộp thoại thì cũng không chốt thêm
    if (submitting.current || placed) return;
    const found = validateCustomer(customer);
    setErrors(found);
    if (hasErrors(found)) return;

    submitting.current = true;
    setPending(true);
    try {
      /*
       * Mở tab TRƯỚC mọi `await`: trình duyệt chỉ cho mở cửa sổ ngay trong cú bấm của người
       * dùng, chờ xong máy chủ rồi mới mở là bị chặn popup.
       */
      window.open(facebookUrl, '_blank', 'noopener,noreferrer');
      const resolved = await resolveOrder(view, customer);
      if (resolved.kind === 'login-required') return goToLogin();
      if (resolved.kind === 'rejected') return showToast(resolved.error, 'error');

      setPlaced({ message: resolved.message, copied: await copyText(resolved.message) });
    } finally {
      submitting.current = false;
      setPending(false);
    }
  };

  return { customer, errors, placed, pending, setField, setPlaced, onSubmit };
}

/**
 * Form thông tin nhận hàng + nút đặt hàng qua Facebook (FR-50, FR-51, BR-13).
 *
 * Thông tin nhận hàng gửi lên máy chủ khi bấm đặt để lưu cùng đơn (BA FR-84); không ghi vào
 * `localStorage`.
 */
export function OrderForm({
  view,
  facebookUrl,
  customerName = '',
}: {
  view: CartView;
  facebookUrl: string;
  /** Tên tài khoản đang đăng nhập — điền sẵn vào ô họ tên, khách sửa được. */
  customerName?: string;
}) {
  const { customer, errors, placed, pending, setField, setPlaced, onSubmit } = useOrderSubmit(
    view,
    facebookUrl,
    customerName,
  );

  return (
    <>
      <OrderFormBody
        customer={customer}
        errors={errors}
        pending={pending}
        onChange={setField}
        onSubmit={onSubmit}
      />

      {placed ? (
        <OrderDialog
          message={placed.message}
          copied={placed.copied}
          facebookUrl={facebookUrl}
          onClose={() => setPlaced(null)}
          onClearCart={() => {
            cartActions.clear();
            setPlaced(null);
          }}
        />
      ) : null}
    </>
  );
}

function OrderFormBody({
  customer,
  errors,
  pending,
  onChange,
  onSubmit,
}: {
  customer: CustomerInfo;
  errors: CustomerErrors;
  pending: boolean;
  onChange: FieldChange;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-4"
      aria-label="Thông tin nhận hàng"
    >
      <CustomerFields customer={customer} errors={errors} onChange={onChange} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Đang gửi đơn…' : 'Đặt hàng qua Facebook'}
      </button>
      <p className="text-xs leading-relaxed text-muted">
        Website không thu tiền. Shop xác nhận đơn và hướng dẫn thanh toán qua tin nhắn Facebook.
      </p>
    </form>
  );
}

/** Ba ô bắt buộc — khai thành bảng để mỗi ô chỉ khác nhau ở dữ liệu, không ở cách dựng. */
const REQUIRED_FIELDS = [
  { field: 'name', label: 'Họ tên', autoComplete: 'name', type: 'text' },
  { field: 'phone', label: 'Số điện thoại', autoComplete: 'tel', type: 'tel' },
  { field: 'address', label: 'Địa chỉ nhận hàng', autoComplete: 'street-address', type: 'text' },
] as const;

function CustomerFields({
  customer,
  errors,
  onChange,
}: {
  customer: CustomerInfo;
  errors: CustomerErrors;
  onChange: FieldChange;
}) {
  return (
    <>
      {REQUIRED_FIELDS.map(({ field, label, autoComplete, type }) => (
        <Field key={field} label={label} htmlFor={`order-${field}`} error={errors[field]}>
          <TextInput
            id={`order-${field}`}
            name={field}
            type={type}
            autoComplete={autoComplete}
            required
            value={customer[field]}
            onChange={(event) => onChange(field, event.target.value)}
          />
        </Field>
      ))}
      <Field label="Ghi chú (không bắt buộc)" htmlFor="order-note">
        <TextArea
          id="order-note"
          name="note"
          rows={3}
          maxLength={500}
          value={customer.note}
          onChange={(event) => onChange('note', event.target.value)}
        />
      </Field>
    </>
  );
}
