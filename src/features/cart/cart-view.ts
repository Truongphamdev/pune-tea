import { getProductBySlug } from '@/data/catalog';
import type { Product, ProductVariant } from '@/data/types';
import type { Cart, CartLine } from './cart';

/** Một dòng giỏ đã ghép với dữ liệu sản phẩm — thứ trang giỏ hàng và nội dung đơn cùng dùng. */
export interface CartRow {
  readonly line: CartLine;
  readonly product: Product;
  readonly variant: ProductVariant;
  readonly unitPriceVnd: number;
  readonly lineTotalVnd: number;
}

export interface CartView {
  readonly rows: readonly CartRow[];
  readonly totalVnd: number;
  readonly itemCount: number;
}

function toRow(line: CartLine): CartRow | null {
  const product = getProductBySlug(line.productSlug);
  const variant = product?.variants.find((item) => item.id === line.variantId);
  if (!product || !variant) return null;

  return {
    line,
    product,
    variant,
    unitPriceVnd: variant.priceVnd,
    lineTotalVnd: variant.priceVnd * line.quantity,
  };
}

/**
 * Ghép giỏ với dữ liệu sản phẩm và tính tiền (BR-10, BR-11).
 *
 * Giá lấy TẠI ĐÂY từ dữ liệu sản phẩm. Dòng trỏ tới sản phẩm hay biến thể không còn tồn tại
 * thì bị bỏ qua, không làm sập trang. Trang giỏ hàng và nội dung đơn đều đi qua hàm này nên
 * hai con số tổng không thể lệch nhau.
 */
export function buildCartView(cart: Cart): CartView {
  const rows = cart.map(toRow).filter((row): row is CartRow => row !== null);

  return {
    rows,
    totalVnd: rows.reduce((sum, row) => sum + row.lineTotalVnd, 0),
    itemCount: rows.reduce((sum, row) => sum + row.line.quantity, 0),
  };
}
