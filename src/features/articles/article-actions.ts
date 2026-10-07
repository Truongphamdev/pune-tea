'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getArticleBySlug } from '@/data/articles';
import { getProductBySlug } from '@/data/catalog';
import { isSiteImage } from '@/data/images';
import { slugify } from '@/lib/text';
import { getAdmin } from '@/server/admin';
import {
  createStoredArticle,
  deleteStoredArticle,
  findStoredArticleById,
  storedSlugExists,
  updateStoredArticle,
  type ArticleInput,
} from '@/server/articles-store';
import { ADMIN_ARTICLES_PATH, type ArticleField, type ArticleFormState } from './editor-state';
import { checkSeo, seoPassed } from './seo-check';

const BODY_MAX_LENGTH = 60_000;
const RELATED_MAX = 8;
const SLUG_ATTEMPTS = 50;
const NOT_FOUND = 'Không tìm thấy bài viết cần sửa.';

const articleSchema = z.object({
  title: z.string().trim().min(1, 'Vui lòng nhập tiêu đề.').max(150, 'Tiêu đề quá dài.'),
  description: z.string().trim().min(1, 'Vui lòng nhập mô tả.').max(400, 'Mô tả quá dài.'),
  cover: z.string().refine(isSiteImage, 'Hãy chọn một ảnh bìa trong danh sách.'),
  coverAlt: z.string().trim().min(1, 'Vui lòng mô tả ảnh bìa.').max(200, 'Mô tả ảnh quá dài.'),
  body: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập nội dung.')
    .max(BODY_MAX_LENGTH, 'Nội dung quá dài.'),
});

function text(form: FormData, field: string): string {
  const value = form.get(field);
  return typeof value === 'string' ? value : '';
}

/** Sản phẩm liên quan: chỉ giữ slug CÓ THẬT, bỏ trùng, có trần số lượng. */
function relatedSlugs(form: FormData): string[] {
  const slugs = form
    .getAll('related')
    .filter((value): value is string => typeof value === 'string');
  return [...new Set(slugs)]
    .filter((slug) => getProductBySlug(slug) !== null)
    .slice(0, RELATED_MAX);
}

function fieldErrors(error: z.ZodError): Partial<Record<ArticleField, string>> {
  const flat = z.flattenError(error).fieldErrors as Partial<Record<string, string[]>>;
  return Object.fromEntries(
    Object.entries(flat).flatMap(([field, messages]) =>
      messages?.[0] ? [[field, messages[0]]] : [],
    ),
  );
}

/** Đường dẫn chưa ai dùng — không trùng bài có sẵn trong mã nguồn lẫn bài trong database. */
async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || 'bai-viet';
  for (let attempt = 1; attempt <= SLUG_ATTEMPTS; attempt += 1) {
    const slug = attempt === 1 ? base : `${base}-${attempt}`;
    if (!getArticleBySlug(slug) && !(await storedSlugExists(slug))) return slug;
  }
  throw new Error('Không tìm được đường dẫn chưa dùng cho bài viết.');
}

/**
 * Làm mới MỌI trang bài viết, không riêng bài vừa đổi: trang bài nào cũng có khối "Bài viết
 * khác", nên một bài bị gỡ hay chuyển về nháp mà chỉ làm mới trang của chính nó thì các trang
 * còn lại vẫn trưng thẻ dẫn tới một trang 404 cho tới hết hạn cache.
 */
function revalidateArticlePages(): void {
  revalidatePath('/');
  revalidatePath('/bai-viet');
  revalidatePath('/bai-viet/[slug]', 'page');
  revalidatePath('/sitemap.xml');
}

/** Mã bài hợp lệ: chỉ chữ số. `Number('0x1')`, `Number(' 1 ')` hay `Number('abc')` không được lọt qua. */
function parseId(raw: string): number | null {
  if (!/^\d{1,15}$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

async function save(
  id: number | null,
  input: ArticleInput,
  authorId: number,
): Promise<string | null> {
  if (id === null) {
    const slug = await uniqueSlug(input.title);
    await createStoredArticle(slug, input, authorId);
    return slug;
  }
  const existing = await findStoredArticleById(id);
  if (!existing || !(await updateStoredArticle(id, input))) return null;
  return existing.slug;
}

/**
 * Lưu nháp hoặc đăng bài. Bản nháp lưu được ở mọi trạng thái; ĐĂNG thì bài phải đạt đủ chuẩn
 * SEO của site (BA §8.2) — chấm lại ở máy chủ bằng đúng bộ tiêu chí form đang hiển thị.
 */
export async function saveArticleAction(
  _previous: ArticleFormState,
  form: FormData,
): Promise<ArticleFormState> {
  const admin = await getAdmin();
  if (!admin) return { errors: {}, message: 'Bạn không có quyền quản trị.' };

  const parsed = articleSchema.safeParse({
    title: text(form, 'title'),
    description: text(form, 'description'),
    cover: text(form, 'cover'),
    coverAlt: text(form, 'coverAlt'),
    body: text(form, 'body'),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const publish = text(form, 'intent') === 'publish';
  const failed = checkSeo(parsed.data).filter((check) => !check.ok);
  if (publish && !seoPassed(failed)) {
    return {
      errors: {},
      message: 'Bài chưa đạt chuẩn SEO nên chưa đăng được.',
      failedChecks: failed,
    };
  }

  const rawId = text(form, 'id');
  const id = rawId === '' ? null : parseId(rawId);
  if (rawId !== '' && id === null) return { errors: {}, message: NOT_FOUND };

  const input: ArticleInput = {
    ...parsed.data,
    relatedProductSlugs: relatedSlugs(form),
    status: publish ? 'published' : 'draft',
  };
  try {
    if ((await save(id, input, admin.id)) === null) return { errors: {}, message: NOT_FOUND };
  } catch (error) {
    // Lỗi database không được làm sập trang soạn bài — người viết sẽ mất cả bài đang gõ
    console.error('Không lưu được bài viết:', error);
    return {
      errors: {},
      message: 'Máy chủ gặp lỗi nên chưa lưu được bài. Bài vẫn còn trên form — hãy thử lại.',
    };
  }

  revalidateArticlePages();
  return { errors: {}, saved: true };
}

export async function deleteArticleAction(form: FormData): Promise<void> {
  if (!(await getAdmin())) return;

  const id = parseId(text(form, 'id'));
  if (id !== null && (await deleteStoredArticle(id))) revalidateArticlePages();
  redirect(ADMIN_ARTICLES_PATH);
}
