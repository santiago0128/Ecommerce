import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = req.nextUrl;
  const status  = searchParams.get('status');
  const search  = searchParams.get('search');
  const page    = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const perPage = 20;
  const offset  = (page - 1) * perPage;

  try {
    const pool    = await getPool();
    const request = pool.request()
      .input('offset',  sql.Int, offset)
      .input('perPage', sql.Int, perPage);

    const conditions: string[] = [];
    if (status)  { conditions.push('o.status = @status');                         request.input('status',  sql.NVarChar, status); }
    if (search)  { conditions.push('(o.number LIKE @q OR ISNULL(c.name, o.guest_name) LIKE @q)'); request.input('q', sql.NVarChar, `%${search}%`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows, countRes] = await Promise.all([
      request.query(`
        SELECT o.id, o.number, o.status, o.total, o.payment_method,
               ISNULL(c.name, o.guest_name) AS customer_name,
               ISNULL(c.email, o.guest_email) AS customer_email,
               o.tracking_number,
               FORMAT(o.created_at, 'yyyy-MM-dd HH:mm') AS created_at
        FROM orders o
        LEFT JOIN customers c ON c.id = o.customer_id
        ${where}
        ORDER BY o.created_at DESC
        OFFSET @offset ROWS FETCH NEXT @perPage ROWS ONLY
      `),
      pool.request().query(`
        SELECT COUNT(*) AS total FROM orders o
        LEFT JOIN customers c ON c.id = o.customer_id
        ${where.replace('@status', `'${status ?? ''}'`).replace('@q', `'%${search ?? ''}%'`)}
      `),
    ]);

    return NextResponse.json({
      orders: rows.recordset,
      total:  countRes.recordset[0].total,
      page,
      perPage,
    });
  } catch (err) {
    console.error('[admin/orders GET]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
