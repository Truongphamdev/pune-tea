#!/usr/bin/env node
/**
 * Chạy website Puni Tea trên máy cá nhân bằng MỘT lệnh, có sẵn tài khoản quản trị.
 *
 *   node scripts/chay-web.mjs            (hoặc bấm đúp chay-web.bat trên Windows, ./chay-web.sh trên Mac/Linux)
 *
 * Script tự làm lần lượt: kiểm phiên bản Node → cài thư viện → build → chạy web ở cổng 3010 →
 * tạo tài khoản quản trị (lần đầu) → mở trình duyệt. Chạy lại lần sau thì bỏ qua bước đã xong.
 *
 * Dữ liệu (tài khoản, đơn hàng, bài viết) nằm trong file `storage/puni-tea.db` ngay trên máy
 * này — không dùng chung với bản đã đưa lên mạng.
 *
 * Quên mật khẩu quản trị: chạy kèm --dat-lai-mat-khau để sinh mật khẩu mới.
 * Tùy chọn: --port 3020 (đổi cổng) · --db storage/khac.db (file database khác) · --no-open (không mở trình duyệt)
 */
import { spawn, spawnSync } from 'node:child_process';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(ROOT);

const MIN_NODE = [20, 11];
const PNPM_VERSION = '9.15.9';
const ADMIN_EMAIL = 'admin@punitea.vn';
const ADMIN_NAME = 'Quản trị viên';
const CREDENTIALS_FILE = 'TAI-KHOAN-ADMIN.txt';
const READY_TIMEOUT_MS = 90_000;

function option(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index > -1 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}
const PORT = option('port', '3010');
const DB_FILE = option('db', 'storage/puni-tea.db');
const OPEN_BROWSER = !process.argv.includes('--no-open');
/** Quên mật khẩu quản trị: chạy kèm cờ này để sinh mật khẩu mới. */
const RESET_PASSWORD = process.argv.includes('--dat-lai-mat-khau');
const SITE = `http://localhost:${PORT}`;

/** Web chạy bằng database FILE trên máy này, kể cả khi thư mục có sẵn .env.local trỏ đi nơi khác. */
const APP_ENV = {
  ...process.env,
  DATABASE_URL: `file:${DB_FILE}`,
  DATABASE_AUTH_TOKEN: '',
  NEXT_PUBLIC_SITE_URL: SITE,
};

const step = (text) => console.log(`\n▶ ${text}`);
const fail = (text) => {
  console.error(`\n✖ ${text}\n`);
  process.exit(1);
};

function checkNode() {
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major < MIN_NODE[0] || (major === MIN_NODE[0] && minor < MIN_NODE[1])) {
    fail(
      `Cần Node.js từ ${MIN_NODE.join('.')} trở lên (máy đang có ${process.versions.node}).\n  Tải bản LTS tại https://nodejs.org rồi chạy lại.`,
    );
  }
}

/** Dùng pnpm có sẵn trên máy; không có thì gọi qua npx — không cần cài gì thêm, không cần quyền quản trị. */
function pnpmCommand() {
  const found = spawnSync('pnpm', ['--version'], { shell: true, stdio: 'ignore' }).status === 0;
  return found ? 'pnpm' : `npx --yes pnpm@${PNPM_VERSION}`;
}

function run(command, label) {
  const result = spawnSync(command, { shell: true, stdio: 'inherit', env: APP_ENV });
  if (result.status !== 0) fail(`${label} thất bại. Xem thông báo lỗi phía trên.`);
}

function newestMtime(path) {
  if (!existsSync(path)) return 0;
  const stat = statSync(path);
  if (!stat.isDirectory()) return stat.mtimeMs;
  return readdirSync(path).reduce(
    (latest, entry) => Math.max(latest, newestMtime(join(path, entry))),
    0,
  );
}

/** Tên gói nhị phân của database ứng với máy đang chạy, ví dụ `@libsql+win32-x64-msvc`. */
function nativePackagePrefix() {
  const os =
    { win32: 'win32', darwin: 'darwin', linux: 'linux' }[process.platform] ?? process.platform;
  return `@libsql+${os}-${process.arch}`;
}

/**
 * Thư mục `node_modules` có đúng là của máy NÀY không.
 *
 * Thư viện có phần nhị phân riêng cho từng hệ điều hành. Nếu cả thư mục dự án được chép hoặc nén
 * từ máy khác (kèm `node_modules` của Linux/Mac) thì trên Windows web không chạy được, và lỗi
 * hiện ra rất khó hiểu. Thấy không khớp thì xóa đi cài lại cho đúng máy.
 */
function modulesMatchThisMachine() {
  const store = 'node_modules/.pnpm';
  if (!existsSync(store)) return false;
  return readdirSync(store).some((name) => name.startsWith(nativePackagePrefix()));
}

function removeDir(path) {
  if (!existsSync(path)) return;
  rmSync(path, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
}

/** `true` khi phải cài thư viện. Dọn luôn bản cài và bản build của máy khác nếu có. */
function needsInstall() {
  const marker = 'node_modules/.modules.yaml';
  if (existsSync('node_modules') && !modulesMatchThisMachine()) {
    step('Thư mục thư viện có sẵn là của máy khác — xóa để cài lại cho đúng máy này…');
    removeDir('node_modules');
    removeDir('.next');
    return true;
  }
  return !existsSync(marker) || statSync('pnpm-lock.yaml').mtimeMs > statSync(marker).mtimeMs;
}

/** Build lại khi chưa có bản build, hoặc mã nguồn đã đổi sau lần build trước. */
function needsBuild() {
  const marker = '.next/BUILD_ID';
  if (!existsSync(marker)) return true;
  const sources = ['src', 'public', 'package.json', 'next.config.ts'].map(newestMtime);
  return Math.max(...sources) > statSync(marker).mtimeMs;
}

/** Cổng đang bị chương trình khác dùng thì dừng ngay với lời giải thích, không chờ rồi nhận nhầm web của ai khác. */
function assertPortFree() {
  return new Promise((done) => {
    const probe = createServer();
    probe.once('error', () =>
      fail(
        `Cổng ${PORT} đang được chương trình khác dùng (có thể web đã chạy sẵn ở cửa sổ khác).\n  Đóng cửa sổ đó, hoặc chạy với cổng khác: node scripts/chay-web.mjs --port 3020`,
      ),
    );
    probe.once('listening', () => probe.close(done));
    probe.listen(Number(PORT));
  });
}

async function waitUntilReady() {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      // Gọi endpoint này cũng làm web mở database và tự tạo bảng
      const response = await fetch(`${SITE}/api/suc-khoe`);
      if (response.ok) return;
    } catch {
      // web chưa lên — thử lại
    }
    await new Promise((done) => setTimeout(done, 700));
  }
  fail(`Web không khởi động được trong ${READY_TIMEOUT_MS / 1000} giây.`);
}

/** Băm mật khẩu ĐÚNG định dạng của ứng dụng (src/server/password.ts): scrypt$N$r$p$salt$hash. */
function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return ['scrypt', 16384, 8, 1, salt.toString('hex'), hash.toString('hex')].join('$');
}

/** Mật khẩu có khớp chuỗi băm đang lưu không (cùng cách kiểm của ứng dụng). */
function passwordMatches(password, stored) {
  const [scheme, n, r, p, saltHex, hashHex] = String(stored).split('$');
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  });
  return timingSafeEqual(actual, expected);
}

function savedPassword() {
  if (!existsSync(CREDENTIALS_FILE)) return null;
  return /Mật khẩu\s*:\s*(\S+)/.exec(readFileSync(CREDENTIALS_FILE, 'utf8'))?.[1] ?? null;
}

function writeCredentials(email, password) {
  writeFileSync(
    CREDENTIALS_FILE,
    [
      'TÀI KHOẢN QUẢN TRỊ — website Puni Tea chạy trên máy này',
      '',
      `Trang đăng nhập : ${SITE}/dang-nhap`,
      `Email           : ${email}`,
      `Mật khẩu        : ${password}`,
      '',
      'Sau khi đăng nhập: Tài khoản → Quản trị bài viết để viết bài SEO.',
      'Nếu bạn đổi mật khẩu trên web thì mật khẩu ghi ở đây không còn dùng được.',
      'Quên mật khẩu: chạy lại kèm --dat-lai-mat-khau để nhận mật khẩu mới.',
      'File này chỉ nằm trên máy bạn, đừng gửi cho người khác.',
      '',
    ].join('\n'),
  );
}

/**
 * Bảo đảm có tài khoản quản trị.
 *
 * - Lần chạy đầu: tạo tài khoản với mật khẩu sinh NGẪU NHIÊN cho riêng máy này (không có mật
 *   khẩu mặc định nào nằm trong mã nguồn) và ghi ra file TAI-KHOAN-ADMIN.txt.
 * - Các lần sau: KHÔNG đụng vào tài khoản — mật khẩu đã đổi trên web vẫn giữ nguyên.
 * - Chỉ khi chạy kèm --dat-lai-mat-khau mới sinh mật khẩu mới (dùng khi quên).
 */
async function ensureAdmin() {
  const { createClient } = await import('@libsql/client');
  const db = createClient({ url: `file:${DB_FILE}` });
  await db.execute('PRAGMA busy_timeout = 5000');

  try {
    const admins = await db.execute(
      "SELECT email, password_hash FROM users WHERE role = 'admin' ORDER BY id LIMIT 1",
    );
    const current = admins.rows[0];
    if (current && !RESET_PASSWORD) {
      const password = savedPassword();
      const stillValid = password !== null && passwordMatches(password, current.password_hash);
      return {
        status: stillValid ? 'unchanged' : 'changed-on-web',
        email: String(current.email),
        password,
      };
    }

    const email = current ? String(current.email) : ADMIN_EMAIL;
    const password = randomBytes(9).toString('base64url');
    const hash = hashPassword(password);
    const existing = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email],
    });
    if (existing.rows.length > 0) {
      await db.execute({
        sql: "UPDATE users SET role = 'admin', password_hash = ? WHERE email = ?",
        args: [hash, email],
      });
      // Mật khẩu vừa đổi thì các phiên đăng nhập cũ không còn hợp lệ
      await db.execute({
        sql: 'DELETE FROM sessions WHERE user_id = ?',
        args: [existing.rows[0].id],
      });
    } else {
      await db.execute({
        sql: "INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, 'admin')",
        args: [email, ADMIN_NAME, hash],
      });
    }
    writeCredentials(email, password);
    return { status: current ? 'reset' : 'created', email, password };
  } finally {
    db.close();
  }
}

function openBrowser(url) {
  const command =
    process.platform === 'win32'
      ? `start "" "${url}"`
      : process.platform === 'darwin'
        ? `open "${url}"`
        : `xdg-open "${url}"`;
  spawn(command, { shell: true, stdio: 'ignore', detached: true }).unref();
}

function announce(admin) {
  const notes = {
    created: `(tài khoản vừa tạo — đã lưu vào file ${CREDENTIALS_FILE})`,
    reset: `(mật khẩu vừa được đặt lại — đã lưu vào file ${CREDENTIALS_FILE})`,
    unchanged: `(giữ nguyên từ lần trước — xem file ${CREDENTIALS_FILE})`,
    'changed-on-web': '(bạn đã đổi mật khẩu trên web — dùng mật khẩu bạn đã đặt)',
  };
  const password = admin.status === 'changed-on-web' ? '••••••••' : admin.password;

  console.log('\n══════════════════════════════════════════════════════');
  console.log(`  Website đang chạy:   ${SITE}`);
  console.log(`  Đăng nhập quản trị:  ${SITE}/dang-nhap`);
  console.log(`    Email:    ${admin.email}`);
  console.log(`    Mật khẩu: ${password}`);
  console.log(`    ${notes[admin.status]}`);
  if (admin.status === 'changed-on-web') {
    console.log('    Quên mật khẩu? Chạy lại kèm:  --dat-lai-mat-khau');
  }
  console.log('  Quản trị bài viết:   Tài khoản → Quản trị bài viết');
  console.log('  Dừng web: bấm Ctrl + C trong cửa sổ này.');
  console.log('══════════════════════════════════════════════════════\n');
}

checkNode();
const pnpm = pnpmCommand();

if (needsInstall()) {
  step('Cài thư viện (lần đầu mất vài phút, cần mạng)…');
  run(`${pnpm} install --frozen-lockfile`, 'Cài thư viện');
}
if (needsBuild()) {
  step('Build website (khoảng 1 phút, cần mạng để tải phông chữ)…');
  run(`${pnpm} exec next build`, 'Build');
}

await assertPortFree();
step(`Khởi động web ở cổng ${PORT}…`);
const WINDOWS = process.platform === 'win32';
/*
 * Web chạy qua shell → pnpm → next: ba tiến trình lồng nhau. Trên Mac/Linux cho chúng một nhóm
 * tiến trình riêng để khi dừng thì dừng CẢ NHÓM; chỉ tắt tiến trình ngoài cùng thì web vẫn
 * chạy ngầm và chiếm cổng cho lần sau.
 */
const server = spawn(`${pnpm} exec next start --port ${PORT}`, {
  shell: true,
  stdio: 'inherit',
  env: APP_ENV,
  detached: !WINDOWS,
});
let stopping = false;
function stop() {
  if (stopping) return;
  stopping = true;
  try {
    if (WINDOWS)
      spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' });
    else process.kill(-server.pid, 'SIGTERM');
  } catch {
    // tiến trình đã tự dừng
  }
}
server.on('exit', (code) => {
  if (code && !stopping) console.error(`\n✖ Web đã dừng (mã ${code}).`);
  process.exit(stopping ? 0 : (code ?? 0));
});
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
process.on('SIGHUP', stop);
process.on('exit', stop);

await waitUntilReady();
const admin = await ensureAdmin();
announce(admin);
if (OPEN_BROWSER) openBrowser(SITE);
