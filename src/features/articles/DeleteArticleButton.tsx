'use client';

import { deleteArticleAction } from './article-actions';

/** Nút xóa bài. Xóa không hoàn tác được nên hỏi lại trước khi gửi. */
export function DeleteArticleButton({ id, title }: { id: number; title: string }) {
  return (
    <form
      action={deleteArticleAction}
      onSubmit={(event) => {
        if (!window.confirm(`Xóa hẳn bài “${title}”? Thao tác này không hoàn tác được.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        aria-label={`Xóa bài ${title}`}
        className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
      >
        Xóa
      </button>
    </form>
  );
}
