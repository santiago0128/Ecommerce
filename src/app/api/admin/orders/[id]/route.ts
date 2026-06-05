import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const auth = requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await ctx.params;
  try {
    const pool = await getPool();
    const [orderRes, itemsRes] = await Promise.all([
      pool.request().input('id', sql.NVarChar, id).query(`
        SELECT o.*, ISNULL(c.name, o.guest_name) AS customer_name,
               ISNULL(c.email, o.guest_email) AS customer_email,
               FORMAT(o.created_at, 'yyyy-MM-dd HH:mm') AS created_at
        FROM orders o LEFT JOIN customers c ON c.id = o.customer_id
        WHERE o.id = @id
      `),
      pool.request().input('id', sql.NVarChar, id).query(`
        SELECT i.*, p.name AS current_name FROM order_items i
        LEFT JOIN products p ON p.id = i.product_id
        WHERE i.order_id = @id
      `),
    ]);

    if (!orderRes.recordset[0]) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    const order = {
      ...orderRes.recordset[0],
      shipping_address: tryParse(orderRes.recordset[0].shipping_address, {}),
      items: itemsRes.recordset.map(i => ({ ...i, selected_variants: tryParse(i.selected_variants, {}) })),
    };
    return NextResponse.json({ order });
  } catch (err) {
    console.error('[admin/orders/:id GET]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const auth = requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await ctx.params;
  try {
    const { status, tracking_number } = await req.json();
    const pool = await getPool();
    const sets: string[] = ['updated_at = GETDATE()'];
    const request = pool.request().input('id', sql.NVarChar, id);

    if (status)           { sets.push('status = @status');                     request.input('status',          sql.NVarChar, status); }
    if (tracking_number !== undefined) { sets.push('tracking_number = @track'); request.input('track', sql.NVarChar, tracking_number ?? null); }

    await request.query(`UPDATE orders SET ${sets.join(', ')} WHERE id = @id`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/orders/:id PUT]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

function tryParse(v: unknown, fallback: unknown) {
  if (!v) return fallback;
  try { return JSON.parse(v as string); } catch { return fallback; }
}
