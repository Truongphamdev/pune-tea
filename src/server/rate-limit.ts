import 'server-only';

/**
 * Giới hạn tần suất dùng chung cho đăng nhập, đăng ký và đặt đơn.
 *
 * Mỗi luật: tối đa `limit` lượt trong `windowMs`. `sliding` thì mỗi lượt mới đẩy lùi thời điểm
 * mở khóa — dùng cho việc dò mật khẩu, để kẻ dò không chỉ việc chờ hết cửa sổ tính từ lần đầu.
 */
export interface RateRule {
  readonly limit: number;
  readonly windowMs: number;
  readonly sliding?: boolean;
}

const MINUTE_MS = 60 * 1000;

export const RATE_RULES = {
  /** Sai mật khẩu với MỘT email (đăng nhập và đổi mật khẩu đếm chung) — BA FR-81, FR-85. */
  loginEmail: { limit: 5, windowMs: 15 * MINUTE_MS, sliding: true },
  /** Sai mật khẩu từ MỘT địa chỉ IP, bất kể email nào — chặn việc thử một mật khẩu trên nhiều email. */
  loginIp: { limit: 20, windowMs: 15 * MINUTE_MS, sliding: true },
  /** Số lần đăng ký từ một địa chỉ IP. */
  registerIp: { limit: 5, windowMs: 60 * MINUTE_MS },
  /**
   * Số lần đăng ký của CẢ SITE. Địa chỉ IP đọc từ header `x-forwarded-for` — thứ máy khách tự
   * đặt được khi site không đứng sau proxy tin cậy — nên giới hạn theo IP một mình thì vòng qua
   * được. Trần chung này là lớp chặn không phụ thuộc IP cho việc tạo tài khoản hàng loạt.
   */
  registerTotal: { limit: 60, windowMs: 60 * MINUTE_MS },
  /** Số đơn một tài khoản đặt được — khóa theo id tài khoản nên không giả mạo được. */
  orderUser: { limit: 10, windowMs: 10 * MINUTE_MS },
} as const satisfies Record<string, RateRule>;

export type RateScope = keyof typeof RATE_RULES;

interface Bucket {
  readonly hits: number;
  readonly resetAt: number;
}

/*
 * Đếm trong bộ nhớ tiến trình — đủ cho một website đồ án chạy một tiến trình. Khởi động lại là
 * mất bộ đếm; hệ thống thật nhiều máy chủ thì phải đếm ở kho dùng chung.
 *
 * Bộ đếm treo trên `globalThis`, KHÔNG phải biến cấp module: Next có thể đóng gói module này
 * vào nhiều chunk (trang đăng nhập một bản, trang tài khoản một bản), mỗi bản một `Map` riêng —
 * khi đó sai mật khẩu ở form đổi mật khẩu không tính vào giới hạn của đăng nhập và ngược lại.
 */
const globalStore = globalThis as typeof globalThis & {
  __puniTeaRateLimits?: Map<string, Bucket>;
};
const buckets = (globalStore.__puniTeaRateLimits ??= new Map<string, Bucket>());

function bucketKey(scope: RateScope, key: string): string {
  return `${scope}:${key}`;
}

/** Dọn các mục đã hết hạn để `Map` không lớn mãi theo số khóa từng được đếm. */
function prune(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

function current(scope: RateScope, key: string, now: number): Bucket | null {
  const bucket = buckets.get(bucketKey(scope, key));
  return bucket && bucket.resetAt > now ? bucket : null;
}

/** `true` khi khóa này đã dùng hết số lượt của luật và chưa tới lúc mở lại. */
export function isRateLimited(scope: RateScope, key: string, now: number = Date.now()): boolean {
  return (current(scope, key, now)?.hits ?? 0) >= RATE_RULES[scope].limit;
}

/** Ghi nhận một lượt. */
export function recordHit(scope: RateScope, key: string, now: number = Date.now()): void {
  prune(now);
  const rule: RateRule = RATE_RULES[scope];
  const bucket = current(scope, key, now);
  const resetAt = rule.sliding || !bucket ? now + rule.windowMs : bucket.resetAt;

  buckets.set(bucketKey(scope, key), { hits: (bucket?.hits ?? 0) + 1, resetAt });
}

/** Còn lượt thì ghi nhận và trả `true`; hết lượt thì trả `false` mà không ghi thêm. */
export function consume(scope: RateScope, key: string, now: number = Date.now()): boolean {
  if (isRateLimited(scope, key, now)) return false;
  recordHit(scope, key, now);
  return true;
}

export function clearHits(scope: RateScope, key: string): void {
  buckets.delete(bucketKey(scope, key));
}

/** Chỉ dùng trong test: xóa sạch mọi bộ đếm. */
export function resetRateLimitsForTest(): void {
  buckets.clear();
}
