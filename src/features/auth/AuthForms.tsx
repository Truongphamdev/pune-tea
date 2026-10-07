'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Field, TextInput } from '@/components/ui';
import { loginAction, registerAction } from './actions';
import { EMPTY_AUTH_STATE, PASSWORD_MIN_LENGTH, type AuthFormState } from './schemas';

const SUBMIT_CLASS =
  'rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60';

function FormMessage({ state }: { state: AuthFormState }) {
  if (!state.message) return null;

  return (
    <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
      {state.message}
    </p>
  );
}

/** Link sang form còn lại, giữ nguyên nơi quay về sau khi đăng nhập. */
function SwitchLink({ href, next, children }: { href: string; next: string; children: string }) {
  const query = next ? `?tiep=${encodeURIComponent(next)}` : '';

  return (
    <Link
      href={`${href}${query}`}
      className="font-semibold text-accent underline underline-offset-2"
    >
      {children}
    </Link>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, EMPTY_AUTH_STATE);

  return (
    <form action={action} noValidate className="flex flex-col gap-4" aria-label="Đăng nhập">
      <input type="hidden" name="tiep" value={next} />
      <FormMessage state={state} />
      <Field label="Email" htmlFor="login-email" error={state.errors.email}>
        <TextInput
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email ?? ''}
        />
      </Field>
      <Field label="Mật khẩu" htmlFor="login-password" error={state.errors.password}>
        <TextInput
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>
      <button type="submit" disabled={pending} className={SUBMIT_CLASS}>
        {pending ? 'Đang đăng nhập…' : 'Đăng nhập'}
      </button>
      <p className="text-sm text-muted">
        Chưa có tài khoản?{' '}
        <SwitchLink href="/dang-ky" next={next}>
          Đăng ký
        </SwitchLink>
      </p>
    </form>
  );
}

function NewPasswordField({ error }: { error: string | undefined }) {
  return (
    <Field
      label={`Mật khẩu (ít nhất ${PASSWORD_MIN_LENGTH} ký tự)`}
      htmlFor="register-password"
      error={error}
    >
      <TextInput
        id="register-password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={PASSWORD_MIN_LENGTH}
      />
    </Field>
  );
}

export function RegisterForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(registerAction, EMPTY_AUTH_STATE);

  return (
    <form action={action} noValidate className="flex flex-col gap-4" aria-label="Đăng ký">
      <input type="hidden" name="tiep" value={next} />
      <FormMessage state={state} />
      <Field label="Họ tên" htmlFor="register-name" error={state.errors.name}>
        <TextInput
          id="register-name"
          name="name"
          autoComplete="name"
          required
          defaultValue={state.values?.name ?? ''}
        />
      </Field>
      <Field label="Email" htmlFor="register-email" error={state.errors.email}>
        <TextInput
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email ?? ''}
        />
      </Field>
      <NewPasswordField error={state.errors.password} />
      <button type="submit" disabled={pending} className={SUBMIT_CLASS}>
        {pending ? 'Đang tạo tài khoản…' : 'Đăng ký'}
      </button>
      <p className="text-sm text-muted">
        Đã có tài khoản?{' '}
        <SwitchLink href="/dang-nhap" next={next}>
          Đăng nhập
        </SwitchLink>
      </p>
    </form>
  );
}
