import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_FACEBOOK_PAGE_URL,
  NAV_LINKS,
  SITE_NAME,
  facebookPageUrl,
  defaultSiteUrl,
  siteUrl,
} from '@/config/site';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('thông tin shop', () => {
  it('tên shop theo BA FR-71', () => {
    expect(SITE_NAME).toBe('Puni Tea');
  });

  it('menu đúng thứ tự FR-01 và trỏ đúng route §6', () => {
    expect(NAV_LINKS.map((link) => [link.label, link.href])).toEqual([
      ['Trang chủ', '/'],
      ['Sản phẩm', '/san-pham'],
      ['Bài viết', '/bai-viet'],
      ['Giới thiệu', '/gioi-thieu'],
      ['Liên hệ', '/lien-he'],
    ]);
  });
});

describe('siteUrl', () => {
  it('mặc định trỏ về máy chạy dev ở cổng 3010', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    expect(siteUrl()).toBe('http://localhost:3010');
  });

  it('trên Vercel chưa khai biến thì dùng tên miền production Vercel cấp', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'pune-tea.vercel.app');
    expect(siteUrl()).toBe('https://pune-tea.vercel.app');
    expect(defaultSiteUrl({})).toBe('http://localhost:3010');
  });

  it('lấy URL từ NEXT_PUBLIC_SITE_URL và bỏ dấu / thừa ở cuối', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://puni-tea.example/');
    expect(siteUrl()).toBe('https://puni-tea.example');
  });

  it('URL sai định dạng thì báo lỗi nêu rõ tên biến (R-M0-05)', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'puni-tea.vn');
    expect(() => siteUrl()).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  it('chỉ nhận http/https', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'ftp://puni-tea.vn');
    expect(() => siteUrl()).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });
});

describe('facebookPageUrl', () => {
  it('mặc định là link page khách đã xác nhận (BA §7.6)', () => {
    vi.stubEnv('NEXT_PUBLIC_FACEBOOK_PAGE_URL', '');
    expect(facebookPageUrl()).toBe('https://www.facebook.com/share/19fniaMu8F/?mibextid=wwXIfr');
    expect(facebookPageUrl()).toBe(DEFAULT_FACEBOOK_PAGE_URL);
  });

  it('ghi đè được bằng NEXT_PUBLIC_FACEBOOK_PAGE_URL', () => {
    vi.stubEnv('NEXT_PUBLIC_FACEBOOK_PAGE_URL', 'https://www.facebook.com/puniteabienhoa');
    expect(facebookPageUrl()).toBe('https://www.facebook.com/puniteabienhoa');
  });

  it('link không phải https thì báo lỗi nêu rõ tên biến', () => {
    vi.stubEnv('NEXT_PUBLIC_FACEBOOK_PAGE_URL', 'javascript:alert(1)');
    expect(() => facebookPageUrl()).toThrow(/NEXT_PUBLIC_FACEBOOK_PAGE_URL/);
  });
});
