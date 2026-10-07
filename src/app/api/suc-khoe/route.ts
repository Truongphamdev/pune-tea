import { NextResponse } from 'next/server';
import { databaseConfigFromEnv, getDb } from '@/server/db';

export const dynamic = 'force-dynamic';

/** Loại database đang cấu hình — không bao giờ trả URL hay token. */
function databaseKind(): 'turso' | 'file' | 'memory' {
  const { url } = databaseConfigFromEnv();
  if (url === ':memory:') return 'memory';
  return url.startsWith('file:') ? 'file' : 'turso';
}

/**
 * Kiểm tra sức khỏe: web có nối được database không.
 *
 * Trang lỗi của Next giấu thông điệp thật trong bản production, nên khi deploy hỏng chỉ thấy
 * một mã sự cố. Endpoint này trả về LÝ DO ở dạng đã lọc: loại database và thông điệp lỗi — không
 * có URL, token hay đường dẫn file.
 */
export async function GET(): Promise<NextResponse> {
  const headers = { 'Cache-Control': 'no-store' };
  try {
    const db = await getDb();
    await db.execute('SELECT 1');
    return NextResponse.json({ ok: true, database: databaseKind() }, { headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        ok: false,
        database: safeKind(),
        // Cắt ngắn và bỏ chuỗi giống token (JWT) nếu lỡ nằm trong thông điệp
        error: message.replace(/eyJ[\w-]+\.[\w-]+\.[\w-]+/g, '[token]').slice(0, 300),
      },
      { status: 503, headers },
    );
  }
}

/** `databaseKind` tự nó có thể ném lỗi (thiếu biến trên Vercel) — ở nhánh lỗi thì chỉ cần cố gắng. */
function safeKind(): string {
  try {
    return databaseKind();
  } catch {
    return 'chưa cấu hình';
  }
}
