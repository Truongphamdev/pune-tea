// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const cookieJar = new Map<string, string>();
const revalidated: string[] = [];

vi.mock('next/headers', () => ({
  headers: async () => ({ get: () => '198.51.100.9' }),
  cookies: async () => ({
    get: (name: string) => (cookieJar.has(name) ? { name, value: cookieJar.get(name) } : undefined),
    set: (name: string, value: string) => {
      if (value === '') cookieJar.delete(name);
      else cookieJar.set(name, value);
    },
  }),
}));
vi.mock('next/navigation', () => ({
  redirect: (path: string) => {
    throw new Error(`REDIRECT:${path}`);
  },
}));
vi.mock('next/cache', () => ({ revalidatePath: (path: string) => revalidated.push(path) }));

import sitemap from '@/app/sitemap';
import { listArticles } from '@/data/articles';
import { listCategories, listProducts } from '@/data/catalog';
import { getAnyArticleBySlug, listAllArticles } from '@/features/articles/all-articles';
import { deleteArticleAction, saveArticleAction } from '@/features/articles/article-actions';
import { EMPTY_ARTICLE_STATE } from '@/features/articles/editor-state';
import { registerAction } from '@/features/auth/actions';
import { EMPTY_AUTH_STATE } from '@/features/auth/schemas';
import { getAdmin } from '@/server/admin';
import { listStoredArticles } from '@/server/articles-store';
import { openDatabase, useDatabaseForTest, type Db } from '@/server/db';
import { resetRateLimitsForTest } from '@/server/rate-limit';
import { findCredentialsByEmail, setUserRole } from '@/server/users';
import { goodDraft } from '../features/article-markup.test';

const COVER = '/images/products/tra-gung-v2.jpg';
let db: Db;

function form(fields: Record<string, string | string[]>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    for (const item of Array.isArray(value) ? value : [value]) data.append(key, item);
  }
  return data;
}

async function signIn(email: string, admin: boolean): Promise<void> {
  cookieJar.clear();
  await expect(
    registerAction(EMPTY_AUTH_STATE, form({ name: 'Người Viết', email, password: 'mat-khau-123' })),
  ).rejects.toThrow(/^REDIRECT:/);
  if (admin) await setUserRole(email, 'admin');
}

const draftForm = (extra: Record<string, string | string[]> = {}) =>
  form({ ...goodDraft(), cover: COVER, intent: 'publish', ...extra });

const save = (data: FormData) => saveArticleAction(EMPTY_ARTICLE_STATE, data);

beforeEach(async () => {
  cookieJar.clear();
  revalidated.length = 0;
  resetRateLimitsForTest();
  db = await openDatabase({ url: ':memory:' });
  useDatabaseForTest(db);
});

describe('phân quyền quản trị', () => {
  it('tài khoản mới là người dùng thường; chỉ đổi vai trò trong database mới thành quản trị', async () => {
    await signIn('thuong@example.com', false);
    expect(await getAdmin()).toBeNull();

    expect(await setUserRole('THUONG@example.com', 'admin')).toBe(true);
    expect((await getAdmin())?.email).toBe('thuong@example.com');
    expect(await setUserRole('khong-co@example.com', 'admin')).toBe(false);
  });

  it('giá trị vai trò lạ trong database không thành quyền quản trị', async () => {
    await signIn('la@example.com', false);
    await db.execute('PRAGMA ignore_check_constraints = ON');
    await db.execute("UPDATE users SET role = 'ADMIN ' WHERE email = 'la@example.com'");

    expect((await findCredentialsByEmail('la@example.com'))?.user.role).toBe('user');
    expect(await getAdmin()).toBeNull();
  });

  it('chưa đăng nhập hoặc không phải quản trị: không lưu, không xóa được gì', async () => {
    expect(await save(draftForm())).toMatchObject({ message: 'Bạn không có quyền quản trị.' });

    await signIn('admin@example.com', true);
    await expect(save(draftForm())).rejects.toThrow('REDIRECT:/quan-tri/bai-viet');
    const [article] = await listStoredArticles();

    await signIn('khach@example.com', false);
    expect(await save(draftForm({ id: String(article?.id), title: 'Bị sửa' }))).toMatchObject({
      message: 'Bạn không có quyền quản trị.',
    });
    await deleteArticleAction(form({ id: String(article?.id) }));
    expect((await listStoredArticles()).map((item) => item.title)).toEqual([goodDraft().title]);
  });
});

describe('saveArticleAction', () => {
  beforeEach(() => signIn('admin@example.com', true));

  it('đăng bài đạt chuẩn: có đường dẫn từ tiêu đề, hiện trên site và trong sitemap', async () => {
    await expect(
      save(draftForm({ related: ['tra-gung', 'khong-co', 'tra-gung'] })),
    ).rejects.toThrow('REDIRECT:/quan-tri/bai-viet');

    const [stored] = await listStoredArticles();
    expect(stored).toMatchObject({
      slug: 'cach-pha-tra-gung-am-bung-ngay-mua',
      status: 'published',
      relatedProductSlugs: ['tra-gung'],
    });
    expect(stored?.publishedAt).not.toBeNull();

    const article = await getAnyArticleBySlug('cach-pha-tra-gung-am-bung-ngay-mua');
    expect(article?.body[0]).toEqual({ type: 'heading', level: 2, text: 'Trà gừng là gì' });
    expect((await listAllArticles()).length).toBe(listArticles().length + 1);
    expect((await sitemap()).map((entry) => entry.url)).toContain(
      'http://localhost:3010/bai-viet/cach-pha-tra-gung-am-bung-ngay-mua',
    );
    expect(revalidated).toEqual(
      expect.arrayContaining(['/', '/bai-viet', '/bai-viet/cach-pha-tra-gung-am-bung-ngay-mua']),
    );
  });

  it('bài chưa đạt chuẩn SEO: KHÔNG đăng được, nhưng lưu nháp được', async () => {
    const weak = { body: '## Một mục\n\nNội dung quá ngắn.' };
    const state = await save(draftForm(weak));

    expect(state.message).toMatch(/chưa đạt chuẩn SEO/);
    expect(state.failedChecks?.map((check) => check.id)).toEqual(['words', 'h2', 'links']);
    expect(await listStoredArticles()).toEqual([]);

    await expect(save(draftForm({ ...weak, intent: 'draft' }))).rejects.toThrow(/^REDIRECT:/);
    expect((await listStoredArticles())[0]?.status).toBe('draft');
  });

  it('bản nháp không lộ ra mặt tiền hay sitemap', async () => {
    await expect(save(draftForm({ intent: 'draft' }))).rejects.toThrow(/^REDIRECT:/);

    expect(await getAnyArticleBySlug('cach-pha-tra-gung-am-bung-ngay-mua')).toBeNull();
    expect((await listAllArticles()).length).toBe(listArticles().length);
    expect((await sitemap()).some((entry) => entry.url.includes('cach-pha-tra-gung'))).toBe(false);
  });

  it('dữ liệu sai: báo lỗi từng ô, ảnh bìa phải thuộc kho ảnh của site', async () => {
    const state = await save(
      form({
        title: ' ',
        description: '',
        coverAlt: '',
        body: '',
        cover: 'https://evil.example/a.png',
      }),
    );
    expect(Object.keys(state.errors).sort()).toEqual([
      'body',
      'cover',
      'coverAlt',
      'description',
      'title',
    ]);
  });

  it('hai bài trùng tiêu đề nhận hai đường dẫn khác nhau; trùng bài có sẵn cũng vậy', async () => {
    await expect(save(draftForm())).rejects.toThrow(/^REDIRECT:/);
    await expect(save(draftForm())).rejects.toThrow(/^REDIRECT:/);
    // Tiêu đề này cho ra đúng đường dẫn của một bài có sẵn trong mã nguồn
    await expect(save(draftForm({ title: 'Cold brew là gì? Cách ủ trà lạnh' }))).rejects.toThrow(
      /^REDIRECT:/,
    );

    const slugs = (await listStoredArticles()).map((article) => article.slug).sort();
    expect(slugs).toEqual([
      'cach-pha-tra-gung-am-bung-ngay-mua',
      'cach-pha-tra-gung-am-bung-ngay-mua-2',
      'cold-brew-la-gi-cach-u-tra-lanh-2',
    ]);
  });

  it('sửa bài: giữ nguyên đường dẫn và ngày đăng; id lạ thì báo không tìm thấy', async () => {
    await expect(save(draftForm())).rejects.toThrow(/^REDIRECT:/);
    const [before] = await listStoredArticles();

    await expect(
      save(draftForm({ id: String(before?.id), title: 'Tiêu đề đã đổi hoàn toàn khác' })),
    ).rejects.toThrow(/^REDIRECT:/);
    const [after] = await listStoredArticles();
    expect(after).toMatchObject({
      title: 'Tiêu đề đã đổi hoàn toàn khác',
      slug: before?.slug,
      publishedAt: before?.publishedAt,
    });

    expect(await save(draftForm({ id: '9999' }))).toMatchObject({
      message: 'Không tìm thấy bài viết cần sửa.',
    });
  });

  it('xóa bài: biến mất khỏi site', async () => {
    await expect(save(draftForm())).rejects.toThrow(/^REDIRECT:/);
    const [article] = await listStoredArticles();

    await expect(deleteArticleAction(form({ id: String(article?.id) }))).rejects.toThrow(
      /^REDIRECT:/,
    );
    expect(await listStoredArticles()).toEqual([]);
    expect(await getAnyArticleBySlug(article?.slug ?? '')).toBeNull();
  });
});

describe('sitemap (SEO-03)', () => {
  it('sinh từ dữ liệu: đủ trang tĩnh, danh mục, sản phẩm, bài viết; không có trang riêng tư', async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    const expected = 5 + listCategories().length + listProducts().length + listArticles().length;

    expect(urls).toHaveLength(expected);
    expect(new Set(urls).size).toBe(expected);
    expect(urls).toContain('http://localhost:3010');
    expect(urls).toContain('http://localhost:3010/san-pham/tra-gung');
    expect(urls.some((url) => /gio-hang|quan-tri|tai-khoan|dang-nhap/.test(url))).toBe(false);
  });

  it('database hỏng thì vẫn liệt kê các bài có sẵn', async () => {
    const broken = await openDatabase({ url: ':memory:' });
    broken.execute = async () => {
      throw new Error('mất kết nối');
    };
    useDatabaseForTest(broken);
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect((await listAllArticles()).length).toBe(listArticles().length);
    quiet.mockRestore();
  });
});

describe('nâng cấp database cũ', () => {
  it('bảng users chưa có cột role thì được thêm, tài khoản cũ thành người dùng thường', async () => {
    const { createClient } = await import('@libsql/client');
    const path = `file:storage/test-migrate-${Date.now()}.db`;
    const old = createClient({ url: path });
    await old.execute(
      "CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')))",
    );
    await old.execute(
      "INSERT INTO users (email, name, password_hash) VALUES ('cu@example.com', 'Cũ', 'x')",
    );
    old.close();

    const upgraded = await openDatabase({ url: path });
    useDatabaseForTest(upgraded);
    expect((await findCredentialsByEmail('cu@example.com'))?.user.role).toBe('user');
    // Chạy lại lần nữa không lỗi
    await expect(openDatabase({ url: path })).resolves.toBeDefined();

    const { rmSync } = await import('node:fs');
    for (const suffix of ['', '-shm', '-wal']) rmSync(`${path.slice(5)}${suffix}`, { force: true });
  });
});
