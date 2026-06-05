import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const pool = await getPool();

    const [orders, products, customers, revenue, recentOrders] = await Promise.all([
      pool.request().query(`
        SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN status = 'pending'    THEN 1 ELSE 0 END) AS pending,
          SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) AS processing,
          SUM(CASE WHEN status = 'shipped'    THEN 1 ELSE 0 END) AS shipped,
          SUM(CASE WHEN status = 'delivered'  THEN 1 ELSE 0 END) AS delivered
        FROM orders
      `),
      pool.request().query(`
        SELECT COUNT(*) AS total,
               SUM(CASE WHEN stock <= 5 THEN 1 ELSE 0 END) AS low_stock
        FROM products WHERE active = 1
      `),
      pool.request().query('SELECT COUNT(*) AS total FROM customers'),
      pool.request().query(`
        SELECT
          ISNULL(SUM(total), 0) AS total_revenue,
          ISNULL(SUM(CASE WHEN CAST(created_at AS DATE) = CAST(GETDATE() AS DATE) THEN total ELSE 0 END), 0) AS today,
          ISNULL(SUM(CASE WHEN created_at >= DATEADD(day,-7,GETDATE()) THEN total ELSE 0 END), 0) AS last_7_days,
          ISNULL(SUM(CASE WHEN created_at >= DATEADD(day,-30,GETDATE()) THEN total ELSE 0 END), 0) AS last_30_days
        FROM orders WHERE status != 'cancelled'
      `),
      pool.request().query(`
        SELECT TOP 5
          o.id, o.number, o.total, o.status,
          ISNULL(c.name, o.guest_name) AS customer_name,
          FORMAT(o.created_at, 'yyyy-MM-dd HH:mm') AS created_at
        FROM orders o
        LEFT JOIN customers c ON c.id = o.customer_id
        ORDER BY o.created_at DESC
      `),
    ]);

    return NextResponse.json({
      orders:        orders.recordset[0],
      products:      products.recordset[0],
      customers:     customers.recordset[0],
      revenue:       revenue.recordset[0],
      recentOrders:  recentOrders.recordset,
    });
  } catch (err) {
    console.error('[admin/dashboard GET]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
