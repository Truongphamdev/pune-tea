// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authenticate, registerUser } from '@/server/auth-service';
import { databaseConfigFromEnv, openDatabase, useDatabaseForTest, type Db } from '@/server/db';
import { createOrder, listOrdersByUser, type NewOrder } from '@/server/orders';
import { hashPassword, verifyPassword } from '@/server/password';
import {
  clearHits,
  consume,
  isRateLimited,
  RATE_RULES,
  recordHit,
  resetRateLimitsForTest,
} from '@/server/rate-limit';
import { createSession, deleteSession, findSessionUser, SESSION_TTL_MS } from '@/server/sessions';
import { createUser, findCredentialsByEmail, findUserById } from '@/server/users';

const MEMORY = { url: ':memory:' };
let db: Db;

beforeEach(async () => {
  db = await openDatabase(MEMORY);
  useDatabaseForTest(db);
  resetRateLimitsForTest();
});

async function newUser(email = 'lan@example.com') {
  const user = await createUser({ email, name: 'Lan', passwordHash: hashPassword('mat-khau-123') });
  if (!user) throw new Error('không tạo được người dùng mẫu');
  return user;
}

describe('databaseConfigFromEnv', () => {
  it('máy cá nhân: thiếu biến thì dùng file cục bộ; có biến thì dùng Turso kèm token', () => {
    expect(databaseConfigFromEnv({})).toEqual({ url: 'file:storage/puni-tea.db' });
    expect(
      databaseConfigFromEnv({ DATABASE_URL: ' libsql://a.turso.io ', DATABASE_AUTH_TOKEN: 'tk' }),
    ).toEqual({ url: 'libsql://a.turso.io', authToken: 'tk' });
  });

  it('trên Vercel mà thiếu DATABASE_URL thì dừng ngay với thông báo nêu tên biến', () => {
    expect(() => databaseConfigFromEnv({ VERCEL: '1' })).toThrow(/DATABASE_URL/);
    expect(() =>
      databaseConfigFromEnv({ VERCEL: '1', DATABASE_URL: 'libsql://a.turso.io' }),
    ).not.toThrow();
  });
});

describe('password', () => {
  it('băm có muối: cùng mật khẩu ra hai chuỗi khác nhau, cả hai đều kiểm được', () => {
    const first = hashPassword('mat-khau-123');
    const second = hashPassword('mat-khau-123');

    expect(first).not.toBe(second);
    expect(first).not.toContain('mat-khau-123');
    expect(verifyPassword('mat-khau-123', first)).toBe(true);
    expect(verifyPassword('mat-khau-123', second)).toBe(true);
  });

  it('sai mật khẩu hoặc chuỗi lưu hỏng thì trả false, không ném lỗi', () => {
    const stored = hashPassword('mat-khau-123');

    expect(verifyPassword('mat-khau-124', stored)).toBe(false);
    expect(verifyPassword('mat-khau-123', 'khong-phai-chuoi-bam')).toBe(false);
    expect(verifyPassword('mat-khau-123', 'scrypt$16384$8$1$00$abcd')).toBe(false);
  });
});

describe('users', () => {
  it('lưu email chữ thường, không trả chuỗi băm ra ngoài', async () => {
    const created = await createUser({
      email: '  Lan@Example.COM ',
      name: ' Lan ',
      passwordHash: 'x',
    });

    expect(created).toMatchObject({ email: 'lan@example.com', name: 'Lan' });
    expect(created).not.toHaveProperty('passwordHash');
    expect((await findUserById(created?.id ?? 0))?.email).toBe('lan@example.com');
    expect((await findCredentialsByEmail('LAN@example.com'))?.passwordHash).toBe('x');
  });

  it('email trùng (kể cả khác hoa thường) trả null', async () => {
    await newUser('lan@example.com');
    expect(
      await createUser({ email: 'LAN@example.com', name: 'Khác', passwordHash: 'y' }),
    ).toBeNull();
  });

  it('id lạ trả null', async () => {
    expect(await findUserById(999)).toBeNull();
    expect(await findCredentialsByEmail('ai-do@example.com')).toBeNull();
  });
});

describe('sessions', () => {
  it('token hợp lệ trả đúng người; database không chứa token gốc', async () => {
    const user = await newUser();
    const token = await createSession(user.id);

    expect((await findSessionUser(token))?.id).toBe(user.id);
    const stored = (await db.execute('SELECT token_hash FROM sessions')).rows;
    expect(stored).toHaveLength(1);
    expect(stored[0]?.token_hash).not.toBe(token);
  });

  it('token lạ, hết hạn hoặc đã đăng xuất đều trả null', async () => {
    const user = await newUser();
    const now = 1_000_000;
    const token = await createSession(user.id, now);

    expect(await findSessionUser('token-la')).toBeNull();
    expect((await findSessionUser(token, now + SESSION_TTL_MS - 1))?.id).toBe(user.id);
    expect(await findSessionUser(token, now + SESSION_TTL_MS)).toBeNull();
    // Phiên hết hạn bị xóa hẳn: hỏi lại ở thời điểm còn hạn cũng không còn
    expect(await findSessionUser(token, now)).toBeNull();

    const second = await createSession(user.id);
    await deleteSession(second);
    expect(await findSessionUser(second)).toBeNull();
  });
});

describe('rate-limit', () => {
  const LOGIN = RATE_RULES.loginEmail;

  it('chặn sau đủ số lượt, tự mở khi hết thời gian chờ', () => {
    const key = 'khoa@example.com';
    const now = 5_000;
    for (let attempt = 0; attempt < LOGIN.limit - 1; attempt += 1)
      recordHit('loginEmail', key, now);
    expect(isRateLimited('loginEmail', key, now)).toBe(false);

    recordHit('loginEmail', key, now);
    expect(isRateLimited('loginEmail', key, now)).toBe(true);
    expect(isRateLimited('loginEmail', key, now + LOGIN.windowMs)).toBe(false);
  });

  it('luật trượt (dò mật khẩu): mỗi lần sai mới đẩy lùi lúc mở khóa', () => {
    const key = 'truot@example.com';
    for (let attempt = 0; attempt < LOGIN.limit; attempt += 1) {
      recordHit('loginEmail', key, attempt * 60_000);
    }
    const lastHit = (LOGIN.limit - 1) * 60_000;

    // Tính từ lần sai ĐẦU thì đã hết hạn, nhưng tính từ lần sai CUỐI thì chưa
    expect(isRateLimited('loginEmail', key, LOGIN.windowMs + 1)).toBe(true);
    expect(isRateLimited('loginEmail', key, lastHit + LOGIN.windowMs)).toBe(false);
  });

  it('luật cửa sổ cố định (đăng ký): hết cửa sổ tính từ lượt đầu là mở lại', () => {
    const rule = RATE_RULES.registerIp;
    for (let attempt = 0; attempt < rule.limit; attempt += 1) {
      expect(consume('registerIp', '203.0.113.1', attempt * 1_000)).toBe(true);
    }

    expect(consume('registerIp', '203.0.113.1', 10_000)).toBe(false);
    expect(consume('registerIp', '203.0.113.1', rule.windowMs)).toBe(true);
  });

  it('mỗi phạm vi và mỗi khóa đếm riêng', () => {
    for (let attempt = 0; attempt < RATE_RULES.registerIp.limit; attempt += 1) {
      consume('registerIp', '203.0.113.2');
    }

    expect(isRateLimited('registerIp', '203.0.113.2')).toBe(true);
    expect(isRateLimited('registerIp', '203.0.113.3')).toBe(false);
    expect(isRateLimited('loginIp', '203.0.113.2')).toBe(false);
  });

  it('hết lượt thì consume không ghi thêm — bị chặn không tự kéo dài lệnh chặn', () => {
    const rule = RATE_RULES.orderUser;
    for (let attempt = 0; attempt < rule.limit; attempt += 1) consume('orderUser', '7', 0);
    for (let attempt = 0; attempt < 50; attempt += 1) consume('orderUser', '7', 1_000);

    expect(isRateLimited('orderUser', '7', rule.windowMs)).toBe(false);
  });

  it('bộ đếm treo trên globalThis — hai bản sao module vẫn đếm chung', async () => {
    const key = 'hai-ban-sao@example.com';
    for (let attempt = 0; attempt < LOGIN.limit; attempt += 1) recordHit('loginEmail', key);

    // Nạp lại module như khi Next đóng gói nó vào một chunk khác
    vi.resetModules();
    const copy = await import('@/server/rate-limit');
    expect(copy.isRateLimited('loginEmail', key)).toBe(true);
  });

  it('mục đã hết hạn được dọn khi có lượt mới', () => {
    const store = (globalThis as { __puniTeaRateLimits?: Map<string, unknown> })
      .__puniTeaRateLimits;
    recordHit('loginEmail', 'cu@example.com', 1_000);
    recordHit('loginEmail', 'moi@example.com', 1_000 + LOGIN.windowMs + 1);

    expect(store?.has('loginEmail:cu@example.com')).toBe(false);
    expect(store?.has('loginEmail:moi@example.com')).toBe(true);
  });

  it('xóa bộ đếm thì mở khóa ngay', () => {
    const key = 'xoa@example.com';
    for (let attempt = 0; attempt < LOGIN.limit; attempt += 1) recordHit('loginEmail', key);
    clearHits('loginEmail', key);
    expect(isRateLimited('loginEmail', key)).toBe(false);
  });
});

describe('auth-service', () => {
  const input = { name: 'Lan', email: 'dich-vu@example.com', password: 'mat-khau-123' };
  const LIMIT = RATE_RULES.loginEmail.limit;

  it('đăng ký xong đăng nhập được ngay, không cần bước xác minh nào', async () => {
    const registered = await registerUser(input);
    expect(registered.ok).toBe(true);

    const login = await authenticate('Dich-Vu@Example.com', 'mat-khau-123');
    expect(login).toMatchObject({ ok: true, user: { email: 'dich-vu@example.com' } });
  });

  it('email đã đăng ký thì báo email-taken', async () => {
    await registerUser(input);
    expect(await registerUser(input)).toEqual({ ok: false, reason: 'email-taken' });
  });

  it('sai mật khẩu và email không tồn tại trả cùng một lý do', async () => {
    await registerUser({ ...input, email: 'cung-ly-do@example.com' });

    expect(await authenticate('cung-ly-do@example.com', 'sai')).toEqual({
      ok: false,
      reason: 'invalid',
    });
    expect(await authenticate('khong-co@example.com', 'sai')).toEqual({
      ok: false,
      reason: 'invalid',
    });
  });

  it('sai quá số lần thì khóa — kể cả khi sau đó nhập ĐÚNG mật khẩu', async () => {
    const email = 'bi-khoa@example.com';
    await registerUser({ ...input, email });
    for (let attempt = 0; attempt < LIMIT; attempt += 1) await authenticate(email, 'sai');

    expect(await authenticate(email, 'mat-khau-123')).toEqual({ ok: false, reason: 'blocked' });
  });

  it('đăng nhập đúng thì xóa bộ đếm lần sai', async () => {
    const email = 'xoa-dem@example.com';
    await registerUser({ ...input, email });
    for (let attempt = 0; attempt < LIMIT - 1; attempt += 1) await authenticate(email, 'sai');

    expect((await authenticate(email, 'mat-khau-123')).ok).toBe(true);
    expect(await authenticate(email, 'sai')).toEqual({ ok: false, reason: 'invalid' });
  });
});

describe('orders', () => {
  function order(userId: number, reference: string): NewOrder {
    return {
      reference,
      userId,
      customerName: 'Lan',
      phone: '0901234567',
      address: '12 Lê Lợi',
      note: '',
      totalVnd: 136_000,
      items: [
        {
          productSlug: 'tra-gung',
          productName: 'Trà Gừng',
          variantLabel: '40g (20 túi)',
          unitPriceVnd: 39_000,
          quantity: 2,
        },
        {
          productSlug: 'tra-dao-hoa-tan',
          productName: 'Trà Đào Hòa Tan',
          variantLabel: '240g (16 gói × 15g)',
          unitPriceVnd: 58_000,
          quantity: 1,
        },
      ],
    };
  }

  it('lưu đơn kèm dòng hàng, đọc lại mới nhất trước', async () => {
    const user = await newUser();
    await createOrder(order(user.id, 'PT-261006-0001'));
    await createOrder(order(user.id, 'PT-261006-0002'));

    const orders = await listOrdersByUser(user.id);
    expect(orders.map((item) => item.reference)).toEqual(['PT-261006-0002', 'PT-261006-0001']);
    expect(orders[0]?.items.map((item) => item.lineTotalVnd)).toEqual([78_000, 58_000]);
    expect(orders[0]?.totalVnd).toBe(136_000);
  });

  it('người này không thấy đơn của người khác', async () => {
    const lan = await newUser('lan@example.com');
    const minh = await newUser('minh@example.com');
    await createOrder(order(lan.id, 'PT-261006-0003'));

    expect(await listOrdersByUser(minh.id)).toEqual([]);
    expect(await listOrdersByUser(lan.id)).toHaveLength(1);
  });

  it('dòng hàng sai thì cả đơn không được lưu (transaction)', async () => {
    const user = await newUser();
    const broken = order(user.id, 'PT-261006-0004');
    const invalid = { ...broken, items: [...broken.items, { ...broken.items[0]!, quantity: 0 }] };

    await expect(createOrder(invalid)).rejects.toThrow();
    expect(await listOrdersByUser(user.id)).toEqual([]);
  });

  it('trùng mã tham chiếu thì database từ chối', async () => {
    const user = await newUser();
    await createOrder(order(user.id, 'PT-261006-0005'));
    await expect(createOrder(order(user.id, 'PT-261006-0005'))).rejects.toThrow(/UNIQUE/);
  });
});
