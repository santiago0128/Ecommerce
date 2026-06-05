import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const search = req.nextUrl.searchParams.get('search') ?? '';
  const sort   = req.nextUrl.searchParams.get('sort')   ?? 'spent';

  try {
    const pool    = await getPool();
    const request = pool.request();
    let where     = '';
    if (search) {
      where = 'WHERE c.name LIKE @q OR c.email LIKE @q';
      request.input('q', sql.NVarChar, `%${search}%`);
    }

    const orderBy = sort === 'orders' ? 'order_count DESC' : sort === 'name' ? 'c.name ASC' : 'total_spent DESC';

    const result = await request.query(`
      SELECT c.id, c.name, c.email, c.phone,
             FORMAT(c.created_at, 'yyyy-MM-dd') AS joined_at,
             COUNT(o.id)       AS order_count,
             ISNULL(SUM(o.total), 0) AS total_spent,
             MAX(FORMAT(o.created_at, 'yyyy-MM-dd')) AS last_order
      FROM customers c
      LEFT JOIN orders o ON o.customer_id = c.id AND o.status != 'cancelled'
      ${where}
      GROUP BY c.id, c.name, c.email, c.phone, c.created_at
      ORDER BY ${orderBy}
    `);

    return NextResponse.json({ customers: result.recordset });
  } catch (err) {
    console.error('[admin/customers GET]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
