'use client';

import { useActionState, useEffect, useRef } from 'react';
import { Field, TextInput } from '@/components/ui';
import { changePasswordAction } from './actions';
import { EMPTY_PASSWORD_STATE, PASSWORD_MIN_LENGTH, type PasswordFormState } from './schemas';

function PasswordMessage({ state }: { state: PasswordFormState }) {
  if (!state.message) return null;

  return (
    <p
      role={state.success ? 'status' : 'alert'}
      data-testid="password-message"
      className={`rounded-lg px-3 py-2 text-sm ${
        state.success ? 'bg-brand-50 text-brand-700' : 'bg-red-50 text-red-700'
      }`}
    >
      {state.message}
    </p>
  );
}

function PasswordFields({ errors }: { errors: PasswordFormState['errors'] }) {
  return (
    <>
      <Field label="Mật khẩu hiện tại" htmlFor="current-password" error={errors.currentPassword}>
        <TextInput
          id="current-password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>
      <Field
        label={`Mật khẩu mới (ít nhất ${PASSWORD_MIN_LENGTH} ký tự)`}
        htmlFor="new-password"
        error={errors.newPassword}
      >
        <TextInput
          id="new-password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={PASSWORD_MIN_LENGTH}
        />
      </Field>
    </>
  );
}

/** Form đổi mật khẩu ở trang tài khoản: phải nhập đúng mật khẩu hiện tại mới đổi được. */
export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, EMPTY_PASSWORD_STATE);
  const formRef = useRef<HTMLFormElement>(null);

  // Đổi xong thì xóa trắng hai ô — không để mật khẩu vừa gõ nằm lại trên màn hình
  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={action}
      noValidate
      className="flex max-w-md flex-col gap-4"
      aria-label="Đổi mật khẩu"
    >
      <PasswordMessage state={state} />
      <PasswordFields errors={state.errors} />
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Đang đổi…' : 'Đổi mật khẩu'}
      </button>
    </form>
  );
}
