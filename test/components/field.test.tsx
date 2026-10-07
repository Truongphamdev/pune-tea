import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Field, TextInput } from '@/components/ui';

/**
 * `aria-describedby` là sợi dây DUY NHẤT nối ô nhập với lời báo lỗi của nó. Không có nó, người dùng trình đọc màn hình nghe được "Email, ô nhập" rồi hết — chữ
 * "Email không hợp lệ" nằm ngay bên dưới nhưng không thuộc về ô nào cả.
 */
describe('Field', () => {
  it('nối ô nhập với phần báo lỗi', () => {
    render(
      <Field label="Email" htmlFor="email" error="Email không hợp lệ.">
        <TextInput id="email" />
      </Field>,
    );

    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-describedby', 'email-error');
    expect(document.getElementById('email-error')).toHaveTextContent('Email không hợp lệ.');
  });

  it('không gắn thuộc tính rỗng khi không có báo lỗi', () => {
    render(
      <Field label="Tên" htmlFor="name">
        <TextInput id="name" />
      </Field>,
    );

    expect(screen.getByLabelText('Tên')).not.toHaveAttribute('aria-describedby');
  });

  it('đánh dấu ô nhập là không hợp lệ khi có lỗi', () => {
    render(
      <Field label="Email" htmlFor="email" error="Email không hợp lệ.">
        <TextInput id="email" />
      </Field>,
    );

    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });
});
