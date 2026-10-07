import 'server-only';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

/**
 * Băm mật khẩu bằng scrypt có sẵn trong Node — không thêm thư viện, không lưu mật khẩu gốc.
 *
 * Chuỗi lưu trong database tự mang tham số (`scrypt$N$r$p$salt$hash`), nên sau này tăng độ khó
 * thì mật khẩu cũ vẫn kiểm được bằng đúng tham số lúc nó được tạo.
 */
const COST = 16_384;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

function derive(password: string, salt: Buffer, n: number, r: number, p: number): Buffer {
  return scryptSync(password, salt, KEY_LENGTH, { N: n, r, p });
}

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const hash = derive(password, salt, COST, BLOCK_SIZE, PARALLELIZATION);

  return [
    'scrypt',
    COST,
    BLOCK_SIZE,
    PARALLELIZATION,
    salt.toString('hex'),
    hash.toString('hex'),
  ].join('$');
}

/** So mật khẩu với chuỗi đã lưu. Chuỗi sai định dạng trả `false`, không ném lỗi. */
export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, n, r, p, saltHex, hashHex] = stored.split('$');
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false;

  const expected = Buffer.from(hashHex, 'hex');
  if (expected.length !== KEY_LENGTH) return false;

  const actual = derive(password, Buffer.from(saltHex, 'hex'), Number(n), Number(r), Number(p));
  // So sánh thời gian hằng: không để thời gian trả lời lộ ra đúng được bao nhiêu byte đầu
  return timingSafeEqual(actual, expected);
}

/**
 * Băm giả dùng khi email không tồn tại, để lần đăng nhập đó tốn thời gian ngang với lần sai mật
 * khẩu — thời gian trả lời không cho biết email nào đã đăng ký.
 */
export const DUMMY_PASSWORD_HASH = hashPassword('mat-khau-gia-khong-ai-dung');
