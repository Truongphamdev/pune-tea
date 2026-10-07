// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const cookieJar = new Map<string, string>();
const cookieOptions = new Map<string, Record<string, unknown>>();

/** Địa chỉ IP giả của yêu cầu hiện tại — đổi để đóng vai máy khách khác. */
let requestIp = '198.51.100.1';

vi.mock('next/headers', () => ({
  headers: async () => ({
    get: (name: string) => (name === 'x-forwarded-for' ? requestIp : null),
  }),
  cookies: async () => ({
    get: (name: string) => (cookieJar.has(name) ? { name, value: cookieJar.get(name) } : undefined),
    set: (name: string, value: string, options: Record<string, unknown>) => {
      cookieOptions.set(name, options);
      if (value === '') cookieJar.delete(name);
      else cookieJar.set(name, value);
    },
  }),
}));

/** `redirect` của Next ném một lỗi đặc biệt để dừng hàm — bản giả ném lỗi mang theo đích tới. */
vi.mock('next/navigation', () => ({
  redirect: (path: string) => {
    throw new Error(`REDIRECT:${path}`);
  },
}));

import {
  changePasswordAction,
  loginAction,
  logoutAction,
  registerAction,
} from '@/features/auth/actions';
import { EMPTY_AUTH_STATE, EMPTY_PASSWORD_STATE, safeNextPath } from '@/features/auth/schemas';
import { placeOrderAction } from '@/features/cart/order-action';
import { getCurrentUser, SESSION_COOKIE } from '@/server/current-user';
import { openDatabase, useDatabaseForTest } from '@/server/db';
import { listOrdersByUser } from '@/server/orders';
import { RATE_RULES, resetRateLimitsForTest } from '@/server/rate-limit';

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const ACCOUNT = { name: 'Nguyễn Lan', email: 'lan@example.com', password: 'mat-khau-123' };

async function register(fields: Record<string, string> = ACCOUNT): Promise<void> {
  await expect(registerAction(EMPTY_AUTH_STATE, form(fields))).rejects.toThrow(/^REDIRECT:/);
}

beforeEach(async () => {
  cookieJar.clear();
  cookieOptions.clear();
  requestIp = '198.51.100.1';
  resetRateLimitsForTest();
  useDatabaseForTest(await openDatabase({ url: ':memory:' }));
});

describe('registerAction', () => {
  it('tạo tài khoản, đăng nhập luôn và chuyển tới trang tài khoản', async () => {
    await expect(registerAction(EMPTY_AUTH_STATE, form(ACCOUNT))).rejects.toThrow(
      'REDIRECT:/tai-khoan',
    );

    expect(await getCurrentUser()).toMatchObject({ email: 'lan@example.com', name: 'Nguyễn Lan' });
    expect(cookieOptions.get(SESSION_COOKIE)).toMatchObject({
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });
  });

  it('quay lại đúng trang nội bộ trong tham số tiep, bỏ qua đích ngoài site', async () => {
    await expect(
      registerAction(EMPTY_AUTH_STATE, form({ ...ACCOUNT, tiep: '/gio-hang' })),
    ).rejects.toThrow('REDIRECT:/gio-hang');

    await expect(
      registerAction(
        EMPTY_AUTH_STATE,
        form({ ...ACCOUNT, email: 'khac@example.com', tiep: '//evil.example' }),
      ),
    ).rejects.toThrow('REDIRECT:/tai-khoan');
  });

  it('dữ liệu sai: báo lỗi từng ô, giữ lại tên và email, KHÔNG trả lại mật khẩu', async () => {
    const state = await registerAction(
      EMPTY_AUTH_STATE,
      form({ name: ' ', email: 'khong-phai-email', password: '123' }),
    );

    expect(Object.keys(state.errors).sort()).toEqual(['email', 'name', 'password']);
    expect(state.values).toEqual({ name: ' ', email: 'khong-phai-email' });
    expect(JSON.stringify(state)).not.toContain('"123"');
    expect(await getCurrentUser()).toBeNull();
  });

  it('email đã đăng ký thì báo ở ô email', async () => {
    await register();
    cookieJar.clear();
    const state = await registerAction(EMPTY_AUTH_STATE, form(ACCOUNT));

    expect(state.errors.email).toMatch(/đã được đăng ký/);
    expect(await getCurrentUser()).toBeNull();
  });
});

describe('loginAction / logoutAction', () => {
  it('đúng email + mật khẩu thì có phiên; đăng xuất thì hết phiên', async () => {
    await register();
    cookieJar.clear();

    await expect(
      loginAction(EMPTY_AUTH_STATE, form({ email: 'LAN@example.com', password: 'mat-khau-123' })),
    ).rejects.toThrow('REDIRECT:/tai-khoan');
    const token = cookieJar.get(SESSION_COOKIE);
    expect(await getCurrentUser()).toMatchObject({ email: 'lan@example.com' });

    await expect(logoutAction()).rejects.toThrow('REDIRECT:/');
    expect(cookieJar.has(SESSION_COOKIE)).toBe(false);

    // Token cũ bị hủy ở máy chủ: đặt lại cookie cũ cũng không đăng nhập lại được
    cookieJar.set(SESSION_COOKIE, token ?? '');
    expect(await getCurrentUser()).toBeNull();
  });

  it('sai mật khẩu: lỗi chung, không tạo phiên', async () => {
    await register({ ...ACCOUNT, email: 'sai-mk@example.com' });
    cookieJar.clear();
    const state = await loginAction(
      EMPTY_AUTH_STATE,
      form({ email: 'sai-mk@example.com', password: 'sai-mat-khau' }),
    );

    expect(state.message).toBe('Email hoặc mật khẩu không đúng.');
    expect(state.values).toEqual({ email: 'sai-mk@example.com' });
    expect(cookieJar.has(SESSION_COOKIE)).toBe(false);
  });

  it('bỏ trống thì báo lỗi từng ô', async () => {
    const state = await loginAction(EMPTY_AUTH_STATE, form({ email: '', password: '' }));
    expect(Object.keys(state.errors).sort()).toEqual(['email', 'password']);
  });

  it('sai quá nhiều lần thì báo tạm khóa', async () => {
    const email = 'khoa-action@example.com';
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await loginAction(EMPTY_AUTH_STATE, form({ email, password: 'sai' }));
    }
    const state = await loginAction(EMPTY_AUTH_STATE, form({ email, password: 'sai' }));

    expect(state.message).toMatch(/quá nhiều lần/);
  });
});

describe('changePasswordAction', () => {
  const change = (currentPassword: string, newPassword: string) =>
    changePasswordAction(EMPTY_PASSWORD_STATE, form({ currentPassword, newPassword }));

  it('chưa đăng nhập thì bị đưa sang trang đăng nhập', async () => {
    await expect(change('mat-khau-123', 'mat-khau-moi-456')).rejects.toThrow(
      'REDIRECT:/dang-nhap?tiep=%2Ftai-khoan',
    );
  });

  it('đổi xong: mật khẩu cũ hết dùng, mật khẩu mới dùng được, phiên cũ bị hủy, phiên này còn', async () => {
    await register({ ...ACCOUNT, email: 'doi-mk@example.com' });
    const oldToken = cookieJar.get(SESSION_COOKIE);

    const state = await change('mat-khau-123', 'mat-khau-moi-456');
    expect(state).toMatchObject({ success: true, errors: {} });
    expect(JSON.stringify(state)).not.toContain('mat-khau');

    // Thiết bị này vẫn đăng nhập, nhưng bằng token MỚI
    const newToken = cookieJar.get(SESSION_COOKIE);
    expect(newToken).not.toBe(oldToken);
    expect(await getCurrentUser()).toMatchObject({ email: 'doi-mk@example.com' });

    // Token cũ (thiết bị khác) không còn hiệu lực
    cookieJar.set(SESSION_COOKIE, oldToken ?? '');
    expect(await getCurrentUser()).toBeNull();

    cookieJar.clear();
    const oldLogin = await loginAction(
      EMPTY_AUTH_STATE,
      form({ email: 'doi-mk@example.com', password: 'mat-khau-123' }),
    );
    expect(oldLogin.message).toBe('Email hoặc mật khẩu không đúng.');
    await expect(
      loginAction(
        EMPTY_AUTH_STATE,
        form({ email: 'doi-mk@example.com', password: 'mat-khau-moi-456' }),
      ),
    ).rejects.toThrow('REDIRECT:/tai-khoan');
  });

  it('sai mật khẩu hiện tại: không đổi gì', async () => {
    await register({ ...ACCOUNT, email: 'sai-hien-tai@example.com' });
    const state = await change('khong-dung', 'mat-khau-moi-456');

    expect(state.errors.currentPassword).toBe('Mật khẩu hiện tại không đúng.');
    expect(state.success).toBeUndefined();
    cookieJar.clear();
    await expect(
      loginAction(
        EMPTY_AUTH_STATE,
        form({ email: 'sai-hien-tai@example.com', password: 'mat-khau-123' }),
      ),
    ).rejects.toThrow(/^REDIRECT:/);
  });

  it('mật khẩu mới quá ngắn, trùng mật khẩu cũ, hoặc bỏ trống đều bị từ chối', async () => {
    await register({ ...ACCOUNT, email: 'kiem-mk@example.com' });

    expect((await change('mat-khau-123', '123')).errors.newPassword).toMatch(/ít nhất 8/);
    expect((await change('mat-khau-123', 'mat-khau-123')).errors.newPassword).toMatch(/phải khác/);
    expect(Object.keys((await change('', '')).errors).sort()).toEqual([
      'currentPassword',
      'newPassword',
    ]);
  });

  it('sai mật khẩu hiện tại quá nhiều lần thì bị tạm khóa', async () => {
    await register({ ...ACCOUNT, email: 'khoa-doi-mk@example.com' });
    for (let attempt = 0; attempt < 5; attempt += 1) await change('sai', 'mat-khau-moi-456');

    const state = await change('mat-khau-123', 'mat-khau-moi-456');
    expect(state.message).toMatch(/quá nhiều lần/);
    expect(state.success).toBeUndefined();
  });
});

describe('Giới hạn tần suất', () => {
  const account = (index: number) => ({ ...ACCOUNT, email: `gioi-han-${index}@example.com` });

  it('đăng ký: quá số lượt từ một IP thì bị chặn, IP khác vẫn đăng ký được', async () => {
    const { limit } = RATE_RULES.registerIp;
    for (let index = 0; index < limit; index += 1) {
      await register(account(index));
      cookieJar.clear();
    }

    const blocked = await registerAction(EMPTY_AUTH_STATE, form(account(limit)));
    expect(blocked.message).toMatch(/quá nhiều lượt đăng ký/);
    expect(blocked.values).toEqual({ name: ACCOUNT.name, email: account(limit).email });
    expect(await getCurrentUser()).toBeNull();

    requestIp = '198.51.100.2';
    await register(account(limit));
  });

  it('đăng ký: lần báo "email đã đăng ký" cũng tính lượt — không dò email hàng loạt được', async () => {
    await register(account(0));
    cookieJar.clear();
    const { limit } = RATE_RULES.registerIp;
    for (let attempt = 1; attempt < limit; attempt += 1) {
      const state = await registerAction(EMPTY_AUTH_STATE, form(account(0)));
      expect(state.errors.email).toMatch(/đã được đăng ký/);
    }

    const state = await registerAction(EMPTY_AUTH_STATE, form(account(0)));
    expect(state.errors.email).toBeUndefined();
    expect(state.message).toMatch(/quá nhiều lượt đăng ký/);
  });

  it('đăng ký: dữ liệu sai không ăn vào số lượt', async () => {
    for (let attempt = 0; attempt < RATE_RULES.registerIp.limit + 3; attempt += 1) {
      await registerAction(EMPTY_AUTH_STATE, form({ name: '', email: 'sai', password: '1' }));
    }
    await register(account(0));
  });

  it('đăng ký: trần của cả site chặn được việc đổi IP liên tục', async () => {
    const { limit } = RATE_RULES.registerTotal;
    for (let index = 0; index < limit; index += 1) {
      requestIp = `203.0.113.${index}`;
      await register(account(index));
      cookieJar.clear();
    }

    requestIp = '203.0.113.250';
    const blocked = await registerAction(EMPTY_AUTH_STATE, form(account(limit)));
    expect(blocked.message).toMatch(/quá nhiều lượt đăng ký/);
  }, 30_000);

  it('đăng nhập: sai quá số lượt từ một IP thì chặn cả khi đổi email liên tục', async () => {
    await register(account(0));
    cookieJar.clear();
    const { limit } = RATE_RULES.loginIp;
    for (let attempt = 0; attempt < limit; attempt += 1) {
      const state = await loginAction(
        EMPTY_AUTH_STATE,
        form({ email: `khong-co-${attempt}@example.com`, password: 'sai-mat-khau' }),
      );
      expect(state.message).toBe('Email hoặc mật khẩu không đúng.');
    }

    // Cả mật khẩu ĐÚNG cũng bị chặn từ IP này…
    const blocked = await loginAction(
      EMPTY_AUTH_STATE,
      form({ email: account(0).email, password: ACCOUNT.password }),
    );
    expect(blocked.message).toMatch(/quá nhiều lần/);

    // …còn từ IP khác thì vẫn đăng nhập được
    requestIp = '198.51.100.3';
    await expect(
      loginAction(EMPTY_AUTH_STATE, form({ email: account(0).email, password: ACCOUNT.password })),
    ).rejects.toThrow(/^REDIRECT:/);
  }, 30_000);

  it('đặt đơn: quá số lượt thì từ chối, tài khoản khác không bị ảnh hưởng', async () => {
    const customer = { name: 'Lan', phone: '0901234567', address: '12 Lê Lợi', note: '' };
    const lines = [{ productSlug: 'tra-gung', variantId: '40g', quantity: 1 }];
    await register(account(0));
    const first = await getCurrentUser();
    const { limit } = RATE_RULES.orderUser;
    for (let attempt = 0; attempt < limit; attempt += 1) {
      expect(await placeOrderAction({ lines, customer })).toMatchObject({ ok: true });
    }

    expect(await placeOrderAction({ lines, customer })).toMatchObject({
      ok: false,
      code: 'rate-limited',
    });
    expect(await listOrdersByUser(first?.id ?? 0)).toHaveLength(limit);

    cookieJar.clear();
    await register(account(1));
    expect(await placeOrderAction({ lines, customer })).toMatchObject({ ok: true });
  });

  it('đặt đơn: đơn bị từ chối vì dữ liệu sai không ăn vào số lượt', async () => {
    const customer = { name: 'Lan', phone: '0901234567', address: '12 Lê Lợi', note: '' };
    await register(account(0));
    for (let attempt = 0; attempt < RATE_RULES.orderUser.limit + 5; attempt += 1) {
      await placeOrderAction({ lines: [], customer });
    }

    const lines = [{ productSlug: 'tra-gung', variantId: '40g', quantity: 1 }];
    expect(await placeOrderAction({ lines, customer })).toMatchObject({ ok: true });
  });
});

describe('safeNextPath', () => {
  it.each([
    ['/gio-hang', '/gio-hang'],
    ['/tai-khoan?x=1', '/tai-khoan?x=1'],
    ['//evil.example', '/tai-khoan'],
    ['/\\evil.example', '/tai-khoan'],
    ['https://evil.example', '/tai-khoan'],
    ['gio-hang', '/tai-khoan'],
    // Trình duyệt bỏ TAB và xuống dòng khi đọc URL: `/<TAB>/evil` thành `//evil`
    ['/\t/evil.example', '/tai-khoan'],
    ['/\n/evil.example', '/tai-khoan'],
    ['/\r/evil.example', '/tai-khoan'],
    ['/\u0000/evil.example', '/tai-khoan'],
    ['/san-pham\\..\\evil', '/tai-khoan'],
    // Chuẩn hóa như trình duyệt rồi mới trả: `/a/../..//evil` không được thành `//evil`
    ['/a/../..//evil.example', '/tai-khoan'],
    ['/san-pham/../gio-hang', '/gio-hang'],
    ['/san-pham?q=tr%C3%A0#neo', '/san-pham?q=tr%C3%A0'],
    [undefined, '/tai-khoan'],
    [['/a', '/b'], '/tai-khoan'],
  ])('%s → %s', (input, expected) => {
    expect(safeNextPath(input)).toBe(expected);
  });
});

describe('placeOrderAction', () => {
  const customer = { name: 'Lan', phone: '0901 234 567', address: '12 Lê Lợi', note: '' };
  const lines = [
    { productSlug: 'tra-gung', variantId: '40g', quantity: 2 },
    { productSlug: 'tra-dao-hoa-tan', variantId: '240g', quantity: 1 },
  ];

  it('chưa đăng nhập: từ chối, không lưu gì (FR-84)', async () => {
    const db = await openDatabase({ url: ':memory:' });
    useDatabaseForTest(db);

    expect(await placeOrderAction({ lines, customer })).toMatchObject({
      ok: false,
      code: 'unauthenticated',
    });
    expect((await db.execute('SELECT count(*) AS total FROM orders')).rows[0]?.total).toBe(0);
  });

  it('cookie phiên giả cũng bị từ chối', async () => {
    cookieJar.set(SESSION_COOKIE, 'token-tu-che');
    expect(await placeOrderAction({ lines, customer })).toMatchObject({
      ok: false,
      code: 'unauthenticated',
    });
  });

  it('đang đăng nhập: lưu đơn với giá tính ở máy chủ, bỏ qua giá trình duyệt gửi lên', async () => {
    await register();
    const user = await getCurrentUser();
    const tampered = lines.map((line) => ({ ...line, priceVnd: 1, unitPriceVnd: 1 }));
    const result = await placeOrderAction({ lines: tampered, customer, totalVnd: 2 });

    expect(result).toMatchObject({ ok: true });
    const [saved] = await listOrdersByUser(user?.id ?? 0);
    expect(saved).toMatchObject({ totalVnd: 136_000, phone: '0901234567', customerName: 'Lan' });
    expect(saved?.items.map((item) => item.unitPriceVnd)).toEqual([39_000, 58_000]);
    if (result.ok) {
      expect(result.reference).toBe(saved?.reference);
      expect(result.message).toContain(saved?.reference ?? '');
    }
  });

  it('máy chủ tự gộp dòng trùng và áp trần 99 món một dòng (BR-11)', async () => {
    await register({ ...ACCOUNT, email: 'gop-dong@example.com' });
    const user = await getCurrentUser();
    const flood = Array.from({ length: 50 }, () => ({
      productSlug: 'tra-gung',
      variantId: '40g',
      quantity: 99,
    }));

    expect(await placeOrderAction({ lines: flood, customer })).toMatchObject({ ok: true });
    const [saved] = await listOrdersByUser(user?.id ?? 0);
    expect(saved?.items).toEqual([expect.objectContaining({ quantity: 99 })]);
    expect(saved?.totalVnd).toBe(99 * 39_000);
  });

  it('dòng trỏ tới sản phẩm không tồn tại bị bỏ; không còn dòng nào thì từ chối', async () => {
    await register();
    const user = await getCurrentUser();
    const orphan = { productSlug: 'khong-co', variantId: 'x', quantity: 3 };

    const mixed = await placeOrderAction({ lines: [...lines, orphan], customer });
    expect(mixed.ok).toBe(true);
    expect((await listOrdersByUser(user?.id ?? 0))[0]?.items).toHaveLength(2);

    expect(await placeOrderAction({ lines: [orphan], customer })).toMatchObject({
      ok: false,
      code: 'invalid',
    });
    expect(await listOrdersByUser(user?.id ?? 0)).toHaveLength(1);
  });

  it.each([
    ['không phải object', 'rác'],
    ['giỏ rỗng', { lines: [], customer }],
    ['số lượng 0', { lines: [{ ...lines[0], quantity: 0 }], customer }],
    ['số lượng thập phân', { lines: [{ ...lines[0], quantity: 1.5 }], customer }],
    ['số điện thoại sai', { lines, customer: { ...customer, phone: '123' } }],
    ['thiếu họ tên', { lines, customer: { ...customer, name: ' ' } }],
  ])('từ chối dữ liệu sai: %s', async (_label, input) => {
    await register({ ...ACCOUNT, email: `sai-${Math.abs(String(_label).length)}@example.com` });
    const user = await getCurrentUser();

    expect(await placeOrderAction(input)).toMatchObject({ ok: false, code: 'invalid' });
    expect(await listOrdersByUser(user?.id ?? 0)).toEqual([]);
  });
});
