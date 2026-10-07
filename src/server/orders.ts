import 'server-only';
import { getDb, queryAll } from './db';

export interface NewOrderItem {
  readonly productSlug: string;
  readonly productName: string;
  readonly variantLabel: string;
  readonly unitPriceVnd: number;
  readonly quantity: number;
}

export interface NewOrder {
  readonly reference: string;
  readonly userId: number;
  readonly customerName: string;
  readonly phone: string;
  readonly address: string;
  readonly note: string;
  readonly totalVnd: number;
  readonly items: readonly NewOrderItem[];
}

export interface SavedOrderItem extends NewOrderItem {
  readonly lineTotalVnd: number;
}

export interface SavedOrder {
  readonly reference: string;
  readonly customerName: string;
  readonly phone: string;
  readonly address: string;
  readonly note: string;
  readonly totalVnd: number;
  readonly createdAt: string;
  readonly items: readonly SavedOrderItem[];
}

interface OrderRow {
  id: number;
  reference: string;
  customer_name: string;
  phone: string;
  address: string;
  note: string;
  total_vnd: number;
  created_at: string;
}

interface ItemRow {
  order_id: number;
  product_slug: string;
  product_name: string;
  variant_label: string;
  unit_price_vnd: number;
  quantity: number;
}

/** Lưu đơn và các dòng hàng trong MỘT transaction — không bao giờ có đơn thiếu dòng hàng. */
export async function createOrder(order: NewOrder): Promise<void> {
  const db = await getDb();
  const tx = await db.transaction('write');
  try {
    const inserted = await tx.execute({
      sql: `INSERT INTO orders (reference, user_id, customer_name, phone, address, note, total_vnd)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        order.reference,
        order.userId,
        order.customerName,
        order.phone,
        order.address,
        order.note,
        order.totalVnd,
      ],
    });
    const orderId = Number(inserted.lastInsertRowid);
    for (const item of order.items) {
      await tx.execute({
        sql: `INSERT INTO order_items (order_id, product_slug, product_name, variant_label, unit_price_vnd, quantity)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          orderId,
          item.productSlug,
          item.productName,
          item.variantLabel,
          item.unitPriceVnd,
          item.quantity,
        ],
      });
    }
    await tx.commit();
  } catch (error) {
    await tx.rollback();
    throw error;
  }
}

function toItem(row: ItemRow): SavedOrderItem {
  const unitPriceVnd = Number(row.unit_price_vnd);
  const quantity = Number(row.quantity);
  return {
    productSlug: row.product_slug,
    productName: row.product_name,
    variantLabel: row.variant_label,
    unitPriceVnd,
    quantity,
    lineTotalVnd: unitPriceVnd * quantity,
  };
}

/**
 * Lịch sử đơn của MỘT người dùng, mới nhất trước.
 *
 * Luôn lọc theo `user_id` ngay trong câu truy vấn: không có đường nào để xem đơn của người khác
 * bằng cách đoán mã đơn. Hai truy vấn cho cả danh sách, không phải một truy vấn cho mỗi đơn.
 */
export async function listOrdersByUser(userId: number): Promise<SavedOrder[]> {
  const [orders, items] = await Promise.all([
    queryAll<OrderRow>('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC', [userId]),
    queryAll<ItemRow>(
      `SELECT order_items.* FROM order_items
       JOIN orders ON orders.id = order_items.order_id
       WHERE orders.user_id = ? ORDER BY order_items.id`,
      [userId],
    ),
  ]);

  return orders.map((order) => ({
    reference: order.reference,
    customerName: order.customer_name,
    phone: order.phone,
    address: order.address,
    note: order.note,
    totalVnd: Number(order.total_vnd),
    createdAt: order.created_at,
    items: items.filter((item) => Number(item.order_id) === Number(order.id)).map(toItem),
  }));
}
