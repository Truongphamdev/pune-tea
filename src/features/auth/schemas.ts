import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 8;
/** Trần độ dài để một mật khẩu dài bất thường không biến lần băm thành việc nặng. */
const PASSWORD_MAX_LENGTH = 128;
const NAME_MAX_LENGTH = 80;
const EMAIL_MAX_LENGTH = 254;

const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(EMAIL_MAX_LENGTH, 'Email quá dài.')
  .pipe(z.email('Email không hợp lệ.'));

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập họ tên.').max(NAME_MAX_LENGTH, 'Họ tên quá dài.'),
  email,
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Mật khẩu cần ít nhất ${PASSWORD_MIN_LENGTH} ký tự.`)
    .max(PASSWORD_MAX_LENGTH, 'Mật khẩu quá dài.'),
});

export const loginSchema = z.object({
  email,
  // Đăng nhập không kiểm độ dài tối thiểu: sai thì trả lỗi chung, không gợi ý luật mật khẩu
  password: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu.')
    .max(PASSWORD_MAX_LENGTH, 'Mật khẩu quá dài.'),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu hiện tại.')
    .max(PASSWORD_MAX_LENGTH, 'Mật khẩu quá dài.'),
  newPassword: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Mật khẩu mới cần ít nhất ${PASSWORD_MIN_LENGTH} ký tự.`)
    .max(PASSWORD_MAX_LENGTH, 'Mật khẩu quá dài.'),
});

export type PasswordField = 'currentPassword' | 'newPassword';

/** Trạng thái form đổi mật khẩu. Không bao giờ mang theo mật khẩu đã nhập. */
export interface PasswordFormState {
  readonly errors: Partial<Record<PasswordField, string>>;
  readonly message?: string;
  readonly success?: boolean;
}

export const EMPTY_PASSWORD_STATE: PasswordFormState = { errors: {} };

export type AuthField = 'name' | 'email' | 'password';

/** Trạng thái form trả về từ server action, dùng với `useActionState`. */
export interface AuthFormState {
  readonly errors: Partial<Record<AuthField, string>>;
  /** Lỗi chung của cả form (sai email/mật khẩu, bị tạm khóa…). */
  readonly message?: string;
  /** Giá trị đã nhập để điền lại — KHÔNG bao giờ gồm mật khẩu. */
  readonly values?: { readonly name?: string; readonly email?: string };
}

export const EMPTY_AUTH_STATE: AuthFormState = { errors: {} };

/** Lấy lỗi ĐẦU TIÊN của mỗi ô từ kết quả kiểm của zod. */
export function fieldErrors<Field extends string = AuthField>(
  error: z.ZodError,
): Partial<Record<Field, string>> {
  const flat = z.flattenError(error).fieldErrors as Partial<Record<string, string[]>>;
  return Object.fromEntries(
    Object.entries(flat).flatMap(([field, messages]) =>
      messages?.[0] ? [[field, messages[0]]] : [],
    ),
  ) as Partial<Record<Field, string>>;
}

/** Nơi tới mặc định sau khi đăng nhập hoặc đăng ký. */
export const DEFAULT_NEXT_PATH = '/tai-khoan';

/** Gốc giả chỉ để phân tích đường dẫn tương đối — không bao giờ xuất hiện trong kết quả. */
const PARSE_ORIGIN = 'http://noi-bo.invalid';

const FIRST_PRINTABLE_CODE = 0x20;
const DELETE_CODE = 0x7f;

/** Ký tự điều khiển (TAB, xuống dòng…) hoặc dấu `\`: trình duyệt lặng lẽ bỏ hoặc đổi chúng khi đọc URL. */
function hasUnsafePathCharacter(value: string): boolean {
  return [...value].some((character) => {
    const code = character.charCodeAt(0);
    return code < FIRST_PRINTABLE_CODE || code === DELETE_CODE || character === '\\';
  });
}

/**
 * Đường dẫn quay lại sau khi đăng nhập (tham số `tiep`) — chỉ nhận đường dẫn NỘI BỘ (BR-23).
 *
 * Kiểm bằng CHÍNH bộ phân tích URL chứ không bằng biểu thức chính quy tự viết: trình duyệt bỏ
 * TAB và xuống dòng khi đọc URL, nên `/<TAB>/evil.com` qua mặt được một phép kiểm "không bắt
 * đầu bằng //" rồi vẫn được hiểu là `//evil.com` — một tên miền khác. Ở đây:
 *
 * 1. từ chối mọi ký tự điều khiển và dấu `\` ngay từ đầu;
 * 2. phân tích như trình duyệt sẽ làm, và chỉ nhận khi kết quả vẫn nằm trên cùng gốc;
 * 3. trả lại đường dẫn ĐÃ CHUẨN HÓA (`pathname + search`), không trả chuỗi thô.
 */
export function safeNextPath(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/')) return DEFAULT_NEXT_PATH;
  if (hasUnsafePathCharacter(value)) return DEFAULT_NEXT_PATH;

  let url: URL;
  try {
    url = new URL(value, PARSE_ORIGIN);
  } catch {
    return DEFAULT_NEXT_PATH;
  }
  if (url.origin !== PARSE_ORIGIN || url.pathname.startsWith('//')) return DEFAULT_NEXT_PATH;

  return `${url.pathname}${url.search}`;
}
