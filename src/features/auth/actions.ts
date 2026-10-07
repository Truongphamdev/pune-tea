'use server';

import { redirect } from 'next/navigation';
import { authenticate, changePassword, registerUser } from '@/server/auth-service';
import { clientIp } from '@/server/client-ip';
import { getCurrentUser, signIn, signOut } from '@/server/current-user';
import { consume, isRateLimited, recordHit } from '@/server/rate-limit';
import {
  changePasswordSchema,
  fieldErrors,
  loginSchema,
  registerSchema,
  safeNextPath,
  type AuthFormState,
  type PasswordField,
  type PasswordFormState,
} from './schemas';

const TOO_MANY_LOGINS = 'Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút.';
const TOO_MANY_REGISTRATIONS =
  'Có quá nhiều lượt đăng ký trong thời gian ngắn. Vui lòng thử lại sau khoảng một giờ.';

function text(form: FormData, field: string): string {
  const value = form.get(field);
  return typeof value === 'string' ? value : '';
}

/** Đăng ký rồi đăng nhập luôn — không có bước xác minh email. */
export async function registerAction(
  _previous: AuthFormState,
  form: FormData,
): Promise<AuthFormState> {
  const values = { name: text(form, 'name'), email: text(form, 'email') };
  const parsed = registerSchema.safeParse({ ...values, password: text(form, 'password') });
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  /*
   * Đếm MỌI lần đăng ký đã qua kiểm dữ liệu, kể cả lần báo "email đã đăng ký": như vậy form này
   * cũng không dùng được để dò hàng loạt xem email nào đã có tài khoản.
   */
  if (!consume('registerIp', await clientIp()) || !consume('registerTotal', 'site')) {
    return { errors: {}, message: TOO_MANY_REGISTRATIONS, values };
  }

  const result = await registerUser(parsed.data);
  if (!result.ok) {
    return { errors: { email: 'Email này đã được đăng ký. Hãy đăng nhập.' }, values };
  }

  await signIn(result.user.id);
  redirect(safeNextPath(form.get('tiep')));
}

export async function loginAction(
  _previous: AuthFormState,
  form: FormData,
): Promise<AuthFormState> {
  const values = { email: text(form, 'email') };
  const parsed = loginSchema.safeParse({ ...values, password: text(form, 'password') });
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const ip = await clientIp();
  if (isRateLimited('loginIp', ip)) return { errors: {}, message: TOO_MANY_LOGINS, values };

  const result = await authenticate(parsed.data.email, parsed.data.password);
  if (!result.ok) {
    if (result.reason === 'invalid') recordHit('loginIp', ip);
    const message =
      result.reason === 'blocked' ? TOO_MANY_LOGINS : 'Email hoặc mật khẩu không đúng.';
    return { errors: {}, message, values };
  }

  await signIn(result.user.id);
  redirect(safeNextPath(form.get('tiep')));
}

export async function logoutAction(): Promise<void> {
  await signOut();
  redirect('/');
}

const CHANGE_PASSWORD_ERRORS = {
  'wrong-current': { errors: { currentPassword: 'Mật khẩu hiện tại không đúng.' } },
  'same-password': { errors: { newPassword: 'Mật khẩu mới phải khác mật khẩu hiện tại.' } },
  blocked: { errors: {}, message: TOO_MANY_LOGINS },
} as const satisfies Record<string, PasswordFormState>;

/**
 * Đổi mật khẩu. Thành công thì mọi phiên cũ bị hủy (thiết bị khác bị đăng xuất) và thiết bị
 * này nhận một phiên mới, nên người dùng không bị văng ra giữa chừng.
 */
export async function changePasswordAction(
  _previous: PasswordFormState,
  form: FormData,
): Promise<PasswordFormState> {
  const user = await getCurrentUser();
  if (!user) redirect('/dang-nhap?tiep=%2Ftai-khoan');

  const parsed = changePasswordSchema.safeParse({
    currentPassword: text(form, 'currentPassword'),
    newPassword: text(form, 'newPassword'),
  });
  if (!parsed.success) return { errors: fieldErrors<PasswordField>(parsed.error) };

  const result = await changePassword(user, parsed.data.currentPassword, parsed.data.newPassword);
  if (!result.ok) return CHANGE_PASSWORD_ERRORS[result.reason];

  await signIn(user.id);
  return {
    errors: {},
    success: true,
    message: 'Đã đổi mật khẩu. Các thiết bị khác đã bị đăng xuất.',
  };
}
