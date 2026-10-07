import 'server-only';
import { getCurrentUser } from './current-user';
import type { User } from './users';

/**
 * Quản trị viên đang đăng nhập, hoặc `null`.
 *
 * MỌI trang và mọi server action của khu quản trị gọi hàm này trước tiên. Ẩn đường link trên
 * giao diện không phải là phân quyền — server action gọi thẳng được từ bên ngoài.
 */
export async function getAdmin(): Promise<User | null> {
  const user = await getCurrentUser();
  return user?.role === 'admin' ? user : null;
}
