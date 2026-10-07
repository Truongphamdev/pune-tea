import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/server/current-user';

/** Luôn chạy theo yêu cầu — câu trả lời phụ thuộc cookie của từng người. */
export const dynamic = 'force-dynamic';

/**
 * Người đang đăng nhập, cho thanh đầu trang hỏi từ trình duyệt.
 *
 * Chỉ trả tên và email của CHÍNH người gọi. `no-store` để proxy hay trình duyệt không giữ lại
 * câu trả lời của người này rồi đưa cho người khác.
 */
export async function GET(): Promise<NextResponse> {
  const user = await getCurrentUser();

  return NextResponse.json(
    { user: user ? { name: user.name, email: user.email } : null },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
