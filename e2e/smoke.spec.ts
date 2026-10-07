import { expect, test, type Page, type TestInfo } from '@playwright/test';

/**
 * Mỗi ca test đóng vai một địa chỉ IP riêng (qua `x-forwarded-for`, header mà máy chủ đọc để
 * giới hạn tần suất). Không có nó, cả bộ test chung một IP và đụng trần 5 lượt đăng ký/giờ.
 */
function fakeIp(seed: string): string {
  let hash = 0;
  for (const character of seed) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return `10.${(hash >>> 16) & 255}.${(hash >>> 8) & 255}.${hash & 255}`;
}

test.beforeEach(async ({ context }, testInfo) => {
  await context.setExtraHTTPHeaders({ 'x-forwarded-for': fakeIp(testInfo.testId) });
  // Chặn mọi yêu cầu ra Facebook: bộ test chỉ cần biết tab mới mở đúng địa chỉ, không gọi ra ngoài
  await context.route(/facebook\.com/, (route) => route.fulfill({ status: 200, body: 'ok' }));
});

const PASSWORD = 'mat-khau-123';
const CUSTOMER_NAME = 'Nguyễn Thị Lan';

/**
 * Đăng ký một tài khoản mới và trả email của nó. Mỗi ca, mỗi project (desktop, mobile) một
 * email riêng — các ca chạy song song trên cùng một database.
 */
async function signUp(page: Page, testInfo: TestInfo, tag: string): Promise<string> {
  const email = `${tag}-${testInfo.project.name}@example.com`;
  await page.goto('/dang-ky');
  await page.getByLabel('Họ tên').fill(CUSTOMER_NAME);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel(/Mật khẩu/).fill(PASSWORD);
  await page.getByRole('button', { name: 'Đăng ký' }).click();
  await expect(page).toHaveURL(/\/tai-khoan$/);
  return email;
}

async function addGingerTea(page: Page): Promise<void> {
  await page.goto('/san-pham');
  // Chờ thanh đầu trang biết mình đã đăng nhập rồi mới bấm
  await expect(page.getByTestId('header-account-dot')).toBeVisible();
  const card = page.getByTestId('product-card').filter({ hasText: 'Trà Gừng' });
  await card.getByRole('button', { name: 'Thêm vào giỏ' }).click();
  await expect(page.getByTestId('header-cart-count')).toHaveText('1');
}

test('chưa đăng nhập: không thêm được vào giỏ, không vào được giỏ hàng', async ({ page }) => {
  // Bấm thêm từ thẻ sản phẩm → sang đăng nhập, mang theo nơi quay về
  await page.goto('/san-pham');
  await page
    .getByTestId('product-card')
    .filter({ hasText: 'Trà Gừng' })
    .getByRole('button', { name: 'Thêm vào giỏ' })
    .click();
  await expect(page).toHaveURL(/\/dang-nhap\?tiep=%2Fsan-pham$/);
  expect(await page.evaluate(() => window.localStorage.getItem('puni-tea:cart:v1'))).toBeNull();

  // Bấm thêm từ trang chi tiết cũng vậy
  await page.goto('/san-pham/tra-gung');
  await page.getByRole('button', { name: 'Thêm vào giỏ hàng' }).click();
  await expect(page).toHaveURL(/\/dang-nhap\?tiep=%2Fsan-pham%2Ftra-gung$/);

  // Vào thẳng trang giỏ hàng — kể cả khi tự nhét giỏ vào localStorage — vẫn bị đưa đi đăng nhập
  await page.evaluate(() => {
    const line = { productSlug: 'tra-gung', variantId: '40g', quantity: 1 };
    window.localStorage.setItem('puni-tea:cart:v1', JSON.stringify([line]));
  });
  await page.goto('/gio-hang');
  await expect(page).toHaveURL(/\/dang-nhap\?tiep=%2Fgio-hang$/);
});

test('đăng nhập từ lời mời thêm giỏ thì quay lại đúng trang sản phẩm', async ({
  page,
}, testInfo) => {
  const email = await signUp(page, testInfo, 'quay-lai');
  await page.getByRole('button', { name: 'Đăng xuất' }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.goto('/san-pham/tra-gung');
  await page.getByRole('button', { name: 'Thêm vào giỏ hàng' }).click();
  await expect(page).toHaveURL(/\/dang-nhap\?tiep=/);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Mật khẩu').fill(PASSWORD);
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page).toHaveURL(/\/san-pham\/tra-gung$/);

  await expect(page.getByTestId('header-account-dot')).toBeVisible();
  await page.getByRole('button', { name: 'Thêm vào giỏ hàng' }).click();
  await expect(page.getByTestId('header-cart-count')).toHaveText('1');
});

test('tham số tiep không đưa được người dùng ra khỏi site', async ({ page }, testInfo) => {
  await signUp(page, testInfo, 'chuyen-huong');
  const origin = new URL(page.url()).origin;

  // Đã đăng nhập mà mở trang đăng nhập/đăng ký thì bị chuyển đi ngay — đích phải ở trong site
  const attacks = [
    '%2F%2Fevil.example',
    // TAB và xuống dòng: trình duyệt bỏ chúng khi đọc URL, `/<TAB>/evil` thành `//evil`
    '%2F%09%2Fevil.example',
    '%2F%0A%2Fevil.example',
    '%2F%0D%2Fevil.example',
    '%2F%5Cevil.example',
    'https%3A%2F%2Fevil.example',
  ];
  for (const path of ['/dang-nhap', '/dang-ky']) {
    for (const attack of attacks) {
      const response = await page.goto(`${path}?tiep=${attack}`);
      expect(response?.status(), `${path}?tiep=${attack}`).toBeLessThan(400);
      expect(new URL(page.url()).origin).toBe(origin);
      await expect(page).toHaveURL(/\/tai-khoan$/);
    }
  }

  // Đích nội bộ hợp lệ thì vẫn được tôn trọng
  await page.goto('/dang-nhap?tiep=%2Fsan-pham%2Ftra-gung');
  await expect(page).toHaveURL(/\/san-pham\/tra-gung$/);
});

test('một địa chỉ IP chỉ đăng ký được 5 tài khoản mỗi giờ', async ({ page }, testInfo) => {
  for (let index = 0; index < 5; index += 1) {
    await signUp(page, testInfo, `gioi-han-${index}`);
    await page.getByRole('button', { name: 'Đăng xuất' }).click();
    await expect(page).toHaveURL(/\/$/);
  }

  await page.goto('/dang-ky');
  await page.getByLabel('Họ tên').fill('Người Thứ Sáu');
  await page.getByLabel('Email').fill(`gioi-han-6-${testInfo.project.name}@example.com`);
  await page.getByLabel(/Mật khẩu/).fill(PASSWORD);
  await page.getByRole('button', { name: 'Đăng ký' }).click();
  await expect(page.getByText(/quá nhiều lượt đăng ký/)).toBeVisible();
  await expect(page).toHaveURL(/\/dang-ky$/);
});

test('từ trang chủ tới hộp thoại đặt hàng', async ({ page }, testInfo) => {
  await signUp(page, testInfo, 'dat-hang');
  await page.goto('/');
  await page.getByRole('link', { name: 'Xem sản phẩm' }).first().click();
  await expect(page).toHaveURL(/\/san-pham$/);
  await expect(page.getByTestId('product-card')).toHaveCount(15);

  // Sản phẩm nhiều biến thể: chọn loại ở trang chi tiết, giá đổi theo
  await page
    .getByTestId('product-card')
    .filter({ hasText: 'Trà Đào Hòa Tan' })
    .getByRole('link', { name: 'Chọn loại' })
    .click();
  await page.locator('label', { hasText: '240g (16 gói × 15g)' }).click();
  await expect(page.getByTestId('price')).toHaveText('58.000 ₫');
  await expect(page.getByTestId('header-account-dot')).toBeVisible();
  await page.getByRole('button', { name: 'Thêm vào giỏ hàng' }).click();
  await page.getByRole('link', { name: /Xem giỏ hàng/ }).click();

  await expect(page.getByTestId('cart-row')).toHaveCount(1);
  await expect(page.getByTestId('cart-total')).toHaveText('58.000 ₫');
  // Họ tên điền sẵn từ tài khoản
  await expect(page.getByLabel('Họ tên')).toHaveValue(CUSTOMER_NAME);

  // Thiếu số điện thoại và địa chỉ thì không đặt được
  await page.getByRole('button', { name: 'Đặt hàng qua Facebook' }).click();
  await expect(page.getByText('Vui lòng nhập địa chỉ nhận hàng.')).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await page.getByLabel('Số điện thoại').fill('0901234567');
  await page.getByLabel('Địa chỉ nhận hàng').fill('12 Lê Lợi, Biên Hòa');
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Đặt hàng qua Facebook' }).click();
  expect((await popupPromise).url()).toContain('facebook.com');

  const dialog = page.getByRole('dialog');
  await expect(dialog.getByLabel('Nội dung đơn hàng')).toHaveValue(/Tổng cộng: 58\.000 ₫/);
  await expect(dialog.getByLabel('Nội dung đơn hàng')).toHaveValue(/PT-\d{6}-\d{4}/);
  await expect(dialog.getByTestId('order-saved')).toBeVisible();

  /*
   * Bấm THẬT, không `force`: Playwright từ chối bấm nếu có phần tử khác (header, footer, nút
   * nổi) nằm đè lên nút. Đây là thứ canh lỗi hộp thoại bị nhốt dưới khung trang.
   */
  await dialog.getByRole('button', { name: 'Sao chép lại' }).click();
  await dialog.getByRole('button', { name: 'Xóa giỏ hàng' }).click();
  await expect(page.getByTestId('cart-empty')).toBeVisible();
  await expect(page.getByTestId('header-cart-count')).toHaveCount(0);
});

test('giỏ hàng còn nguyên sau khi tải lại và không tin giá trong localStorage', async ({
  page,
}, testInfo) => {
  await signUp(page, testInfo, 'gia');
  await addGingerTea(page);
  await page.goto('/gio-hang');
  await expect(page.getByTestId('cart-total')).toHaveText('39.000 ₫');

  await page.evaluate(() => {
    const key = 'puni-tea:cart:v1';
    const lines = JSON.parse(window.localStorage.getItem(key) ?? '[]') as object[];
    const tampered = lines.map((line) => ({ ...line, priceVnd: 1 }));
    const orphan = { productSlug: 'khong-co', variantId: 'x', quantity: 12 };
    window.localStorage.setItem(key, JSON.stringify([...tampered, orphan]));
  });
  await page.reload();

  await expect(page.getByTestId('cart-row')).toHaveCount(1);
  await expect(page.getByTestId('cart-total')).toHaveText('39.000 ₫');
  // Số trên header không đếm dòng trỏ tới sản phẩm không tồn tại
  await expect(page.getByTestId('header-cart-count')).toHaveText('1');
});

test('ảnh phóng to đóng được bằng nút Đóng', async ({ page }) => {
  await page.goto('/san-pham/tra-gung');
  await page.getByTestId('gallery-main').click();
  const lightbox = page.getByRole('dialog');
  await expect(lightbox).toBeVisible();

  // Bấm thật: nút bị thanh đầu trang che là lỗi
  await lightbox.getByRole('button', { name: /Đóng/ }).click();
  await expect(lightbox).toHaveCount(0);
});

test('hộp thoại xóa cả giỏ bấm được và trả tiêu điểm', async ({ page }, testInfo) => {
  await signUp(page, testInfo, 'xoa-gio');
  await addGingerTea(page);
  await page.goto('/gio-hang');
  await page.getByRole('button', { name: 'Xóa cả giỏ' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Hủy' }).click();

  await expect(page.getByRole('button', { name: 'Xóa cả giỏ' })).toBeFocused();
  await expect(page.getByTestId('cart-row')).toHaveCount(1);
});

test('đặt hàng được lưu vào lịch sử; đăng xuất xóa giỏ; đăng nhập lại; đổi mật khẩu', async ({
  page,
}, testInfo) => {
  // Chưa đăng nhập mà vào trang tài khoản thì bị đưa sang đăng nhập
  await page.goto('/tai-khoan');
  await expect(page).toHaveURL(/\/dang-nhap\?tiep=%2Ftai-khoan$/);

  // Đăng ký: không có bước xác minh email, xong là vào thẳng trang tài khoản
  const email = await signUp(page, testInfo, 'lich-su');
  await expect(page.getByRole('heading', { name: CUSTOMER_NAME })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Lịch sử đơn hàng (0)' })).toBeVisible();

  // Đặt một đơn
  await addGingerTea(page);
  await page.goto('/gio-hang');
  await page.getByLabel('Số điện thoại').fill('0901234567');
  await page.getByLabel('Địa chỉ nhận hàng').fill('12 Lê Lợi, Biên Hòa');
  await page.getByRole('button', { name: 'Đặt hàng qua Facebook' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByTestId('order-saved')).toBeVisible();
  const message = await dialog.getByLabel('Nội dung đơn hàng').inputValue();
  const reference = /PT-\d{6}-\d{4}/.exec(message)?.[0] ?? '';
  expect(reference).not.toBe('');
  await dialog.getByRole('button', { name: 'Giữ giỏ hàng' }).click();

  // Đơn hiện trong lịch sử với đúng mã và tổng tiền
  await page.goto('/tai-khoan');
  const card = page.getByTestId('order-card');
  await expect(card).toHaveCount(1);
  await expect(card.getByRole('heading', { name: reference })).toBeVisible();
  await expect(card).toContainText('Trà Gừng — 40g (20 túi) × 1');
  await expect(card).toContainText('39.000 ₫');

  // Đăng xuất: mất phiên thật, giỏ hàng trong trình duyệt bị xóa, trang tài khoản lại đòi đăng nhập
  await page.getByRole('button', { name: 'Đăng xuất' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByTestId('header-cart-count')).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem('puni-tea:cart:v1'))).toBe('[]');
  await page.goto('/tai-khoan');
  await expect(page).toHaveURL(/\/dang-nhap/);

  // Sai mật khẩu thì báo lỗi chung; đúng thì vào lại và đơn vẫn còn
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Mật khẩu').fill('sai-mat-khau');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page.getByText('Email hoặc mật khẩu không đúng.')).toBeVisible();
  await page.getByLabel('Mật khẩu').fill(PASSWORD);
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page).toHaveURL(/\/tai-khoan$/);
  await expect(page.getByTestId('order-card')).toHaveCount(1);

  // Đổi mật khẩu: sai mật khẩu hiện tại thì báo lỗi, đúng thì đổi được và vẫn đang đăng nhập
  const newPassword = 'mat-khau-moi-456';
  await page.getByLabel('Mật khẩu hiện tại').fill('khong-dung');
  await page.getByLabel(/Mật khẩu mới/).fill(newPassword);
  await page.getByRole('button', { name: 'Đổi mật khẩu' }).click();
  await expect(page.getByText('Mật khẩu hiện tại không đúng.')).toBeVisible();
  await page.getByLabel('Mật khẩu hiện tại').fill(PASSWORD);
  await page.getByLabel(/Mật khẩu mới/).fill(newPassword);
  await page.getByRole('button', { name: 'Đổi mật khẩu' }).click();
  await expect(page.getByTestId('password-message')).toContainText('Đã đổi mật khẩu');
  await expect(page.getByLabel('Mật khẩu hiện tại')).toHaveValue('');
  await page.reload();
  await expect(page.getByRole('heading', { name: CUSTOMER_NAME })).toBeVisible();

  // Mật khẩu cũ hết dùng, mật khẩu mới đăng nhập được
  await page.getByRole('button', { name: 'Đăng xuất' }).click();
  await page.goto('/dang-nhap');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Mật khẩu').fill(PASSWORD);
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page.getByText('Email hoặc mật khẩu không đúng.')).toBeVisible();
  await page.getByLabel('Mật khẩu').fill(newPassword);
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page).toHaveURL(/\/tai-khoan$/);

  // Email đã dùng thì không đăng ký lại được
  await page.getByRole('button', { name: 'Đăng xuất' }).click();
  await page.goto('/dang-ky');
  await page.getByLabel('Họ tên').fill('Người Khác');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel(/Mật khẩu/).fill('mat-khau-khac-456');
  await page.getByRole('button', { name: 'Đăng ký' }).click();
  await expect(page.getByText(/đã được đăng ký/)).toBeVisible();
});

const PAGES = [
  '/',
  '/san-pham',
  '/san-pham/tra-dao-hoa-tan',
  '/danh-muc/tra-roi',
  '/gio-hang',
  '/bai-viet',
  '/bai-viet/cold-brew-la-gi-cach-u-tra-lanh',
  '/gioi-thieu',
  '/lien-he',
  '/dang-nhap',
  '/dang-ky',
];

for (const path of PAGES) {
  test(`${path}: không tràn ngang, một H1, không nhảy cấp tiêu đề, ảnh có alt, có ảnh chia sẻ`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(path, { waitUntil: 'networkidle' });

    const facts = await page.evaluate(() => {
      const levels = [...document.querySelectorAll('h1, h2, h3, h4')].map((heading) =>
        Number(heading.tagName[1]),
      );
      return {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        h1: levels.filter((level) => level === 1).length,
        skipped: levels.some((level, index) => index > 0 && level - (levels[index - 1] ?? 0) > 1),
        emptyAlt: [...document.images].filter((image) => !image.alt.trim()).length,
        brokenImages: [...document.images].filter(
          (image) => image.complete && image.naturalWidth === 0,
        ).length,
        ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content'),
        twitterImage: document.querySelector('meta[name="twitter:image"]')?.getAttribute('content'),
      };
    });

    expect(facts.overflow).toBeLessThanOrEqual(0);
    expect(facts.h1).toBe(1);
    expect(facts.skipped).toBe(false);
    expect(facts.emptyAlt).toBe(0);
    expect(facts.brokenImages).toBe(0);
    expect(facts.ogImage).toBeTruthy();
    expect(facts.twitterImage).toBeTruthy();
    expect(errors).toEqual([]);
  });
}
