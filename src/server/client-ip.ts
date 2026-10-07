import 'server-only';
import { headers } from 'next/headers';

/** Khóa dùng khi không đọc được địa chỉ nào — mọi yêu cầu như vậy đếm chung một rổ. */
const UNKNOWN_IP = 'unknown';
const IP_MAX_LENGTH = 64;

/**
 * Địa chỉ IP của máy khách, để giới hạn tần suất.
 *
 * Đọc mục ĐẦU của `x-forwarded-for`. Next tự điền header này từ kết nối khi nó vắng mặt, nhưng
 * GIỮ NGUYÊN giá trị máy khách gửi lên — nên khi site không đứng sau một proxy ghi đè header,
 * giá trị này giả mạo được. Vì vậy mọi giới hạn theo IP ở dự án này chỉ là lớp cản thêm; các
 * giới hạn quan trọng khóa theo thứ không giả được (email, id tài khoản, trần của cả site).
 */
export async function clientIp(): Promise<string> {
  const forwarded = (await headers()).get('x-forwarded-for');
  const first = forwarded?.split(',')[0]?.trim();
  return first ? first.slice(0, IP_MAX_LENGTH) : UNKNOWN_IP;
}
