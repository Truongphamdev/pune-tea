import type { Article } from '../types';
import { COLD_BREW } from './cold-brew';
import { NHAN_VANG } from './nhan-vang';
import { O_LONG_DUA_HAU } from './o-long-dua-hau';
import { PHAN_BIET } from './phan-biet';
import { SAM_BI_DAO } from './sam-bi-dao';

/** Mọi bài viết của site (FR-62). Thêm bài: tạo file cạnh đây rồi thêm vào mảng này. */
export const ARTICLES: readonly Article[] = [
  NHAN_VANG,
  O_LONG_DUA_HAU,
  SAM_BI_DAO,
  COLD_BREW,
  PHAN_BIET,
];
