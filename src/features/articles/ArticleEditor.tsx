'use client';

import Image from 'next/image';
import { useActionState, useMemo, useState } from 'react';
import { Field, TextArea, TextInput } from '@/components/ui';
import type { SiteImage } from '@/data/images';
import { ArticleBody } from './ArticleBody';
import { saveArticleAction } from './article-actions';
import { EMPTY_ARTICLE_STATE, type ArticleFormState } from './editor-state';
import { parseMarkup } from './markup';
import { checkSeo, SEO_LIMITS } from './seo-check';
import { SearchPreview, SeoChecklist } from './SeoPanel';

export interface EditorValues {
  readonly id: number | null;
  readonly title: string;
  readonly description: string;
  readonly cover: string;
  readonly coverAlt: string;
  readonly body: string;
  readonly related: readonly string[];
}

export interface EditorOption {
  readonly value: string;
  readonly label: string;
}

const BODY_HINT = `## Tiêu đề mục

Một đoạn văn. Liên kết tới sản phẩm: [trà gừng](/san-pham/tra-gung).

### Tiêu đề nhỏ

- Gạch đầu dòng
1. Danh sách có số`;

function EditorMessage({ state }: { state: ArticleFormState }) {
  if (!state.message) return null;

  return (
    <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
      <p className="font-semibold">{state.message}</p>
      {state.failedChecks?.length ? (
        <ul className="mt-1 list-disc ps-5">
          {state.failedChecks.map((check) => (
            <li key={check.id}>
              {check.label}
              {check.detail ? ` — ${check.detail}` : ''}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function CoverPicker({
  images,
  value,
  onChange,
}: {
  images: readonly SiteImage[];
  value: string;
  onChange: (src: string) => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="relative size-24 shrink-0 overflow-hidden rounded-lg border border-line bg-white">
        {value ? <Image src={value} alt="" fill sizes="96px" className="object-cover" /> : null}
      </div>
      <select
        id="article-cover"
        name="cover"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 rounded-md border border-line bg-surface px-3 py-2 text-sm"
      >
        <option value="">— Chọn ảnh bìa —</option>
        {images.map((image) => (
          <option key={image.src} value={image.src}>
            {image.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function RelatedPicker({
  products,
  selected,
}: {
  products: readonly EditorOption[];
  selected: readonly string[];
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium">Sản phẩm liên quan (hiện cuối bài)</legend>
      <div className="mt-2 grid max-h-44 gap-1.5 overflow-y-auto rounded-md border border-line bg-surface p-3 sm:grid-cols-2">
        {products.map((product) => (
          <label key={product.value} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="related"
              value={product.value}
              defaultChecked={selected.includes(product.value)}
              className="size-4 accent-brand-700"
            />
            {product.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function SubmitButtons({ pending }: { pending: boolean }) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="submit"
        name="intent"
        value="publish"
        disabled={pending}
        className="rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
      >
        {pending ? 'Đang lưu…' : 'Đăng bài'}
      </button>
      <button
        type="submit"
        name="intent"
        value="draft"
        disabled={pending}
        className="rounded-full border border-line bg-raised px-6 py-3 text-sm font-semibold transition-colors hover:bg-line disabled:opacity-60"
      >
        Lưu nháp
      </button>
    </div>
  );
}

interface DraftFieldsProps {
  readonly draft: EditorValues;
  readonly state: ArticleFormState;
  readonly images: readonly SiteImage[];
  readonly set: (field: keyof EditorValues, value: string) => void;
}

function BodyField({ draft, state, set }: Omit<DraftFieldsProps, 'images'>) {
  return (
    <Field label="Nội dung" htmlFor="article-body" error={state.errors.body}>
      <TextArea
        id="article-body"
        name="body"
        rows={18}
        placeholder={BODY_HINT}
        value={draft.body}
        onChange={(event) => set('body', event.target.value)}
      />
    </Field>
  );
}

function DraftFields({ draft, state, images, set }: DraftFieldsProps) {
  return (
    <>
      <Field
        label={`Tiêu đề (tối đa ${SEO_LIMITS.titleMax} ký tự)`}
        htmlFor="article-title"
        error={state.errors.title}
      >
        <TextInput
          id="article-title"
          name="title"
          value={draft.title}
          onChange={(event) => set('title', event.target.value)}
        />
      </Field>
      <Field
        label={`Mô tả ngắn — hiện trên Google (${SEO_LIMITS.descriptionMin}–${SEO_LIMITS.descriptionMax} ký tự)`}
        htmlFor="article-description"
        error={state.errors.description}
      >
        <TextArea
          id="article-description"
          name="description"
          rows={3}
          value={draft.description}
          onChange={(event) => set('description', event.target.value)}
        />
      </Field>
      <Field label="Ảnh bìa" htmlFor="article-cover" error={state.errors.cover}>
        <CoverPicker images={images} value={draft.cover} onChange={(src) => set('cover', src)} />
      </Field>
      <Field label="Mô tả ảnh bìa (alt)" htmlFor="article-cover-alt" error={state.errors.coverAlt}>
        <TextInput
          id="article-cover-alt"
          name="coverAlt"
          value={draft.coverAlt}
          onChange={(event) => set('coverAlt', event.target.value)}
        />
      </Field>
      <BodyField draft={draft} state={state} set={set} />
    </>
  );
}

/**
 * Form soạn bài viết SEO: nhập bên trái, chấm chuẩn SEO và xem trước Google bên phải — cập nhật
 * theo từng ký tự gõ. Bấm "Đăng bài" thì máy chủ chấm lại; chưa đạt thì không đăng.
 */
export function ArticleEditor({
  initial,
  images,
  products,
  host,
}: {
  initial: EditorValues;
  images: readonly SiteImage[];
  products: readonly EditorOption[];
  host: string;
}) {
  const [state, action, pending] = useActionState(saveArticleAction, EMPTY_ARTICLE_STATE);
  const [draft, setDraft] = useState(initial);
  const set = (field: keyof EditorValues, value: string): void =>
    setDraft((current) => ({ ...current, [field]: value }));
  const checks = useMemo(() => checkSeo(draft), [draft]);
  const preview = useMemo(() => parseMarkup(draft.body), [draft.body]);

  return (
    <form action={action} noValidate className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      {draft.id !== null ? <input type="hidden" name="id" value={draft.id} /> : null}
      <div className="flex flex-col gap-5">
        <EditorMessage state={state} />
        <DraftFields draft={draft} state={state} images={images} set={set} />
        <RelatedPicker products={products} selected={initial.related} />
        <SubmitButtons pending={pending} />
        <details className="rounded-card border border-line bg-surface p-4">
          <summary className="text-sm font-semibold">Xem trước nội dung</summary>
          <div className="mt-4">
            <ArticleBody blocks={preview} />
          </div>
        </details>
      </div>

      <aside className="flex h-fit flex-col gap-6 rounded-card border border-line bg-surface p-5 lg:sticky lg:top-24">
        <SeoChecklist checks={checks} />
        <SearchPreview title={draft.title} description={draft.description} host={host} />
      </aside>
    </form>
  );
}
