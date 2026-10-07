'use client';

import Link from 'next/link';
import { UserIcon } from '@/features/shell/UiIcons';
import { useSessionSync, useSessionUser } from './session-store';

/** Biểu tượng tài khoản trên thanh đầu trang: đã đăng nhập thì tới trang tài khoản, chưa thì tới đăng nhập. */
export function HeaderAccount() {
  useSessionSync();
  const user = useSessionUser();
  const href = user ? '/tai-khoan' : '/dang-nhap';
  const label = user ? `Tài khoản của ${user.name}` : 'Đăng nhập';

  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="relative grid size-10 place-items-center rounded-full text-white transition-colors duration-200 hover:bg-white/10"
    >
      <UserIcon className="size-6" />
      {user ? (
        <span
          aria-hidden="true"
          data-testid="header-account-dot"
          className="absolute top-1.5 right-1.5 size-2.5 rounded-full bg-gold-400 ring-2 ring-brand-700"
        />
      ) : null}
    </Link>
  );
}
