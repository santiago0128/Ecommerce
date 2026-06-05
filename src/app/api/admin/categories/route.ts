import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const pool   = await getPool();
    const result = await pool.request().query(`
      SELECT c.id, c.name, c.slug, c.icon,
             COUNT(p.id) AS product_count,
             AVG(CAST(p.price AS FLOAT)) AS avg_price,
             SUM(CASE WHEN p.stock > 0 THEN 1 ELSE 0 END) AS in_stock
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.active = 1
      GROUP BY c.id, c.name, c.slug, c.icon
      ORDER BY c.name
    `);
    return NextResponse.json({ categories: result.recordset });
  } catch (err) {
    console.error('[admin/categories GET]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
