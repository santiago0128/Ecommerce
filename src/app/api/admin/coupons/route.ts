import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const pool   = await getPool();
    const result = await pool.request().query(`
      SELECT id, code, type, value, min_order, max_uses, used_count, active,
             FORMAT(expires_at, 'yyyy-MM-dd') AS expires_at,
             FORMAT(created_at, 'yyyy-MM-dd') AS created_at
      FROM coupons ORDER BY created_at DESC
    `);
    return NextResponse.json({ coupons: result.recordset.map(c => ({ ...c, active: !!c.active })) });
  } catch (err) {
    console.error('[admin/coupons GET]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { code, type, value, min_order, max_uses, active, expires_at } = await req.json();
    if (!code || !type || value === undefined) return NextResponse.json({ error: 'Código, tipo y valor requeridos' }, { status: 400 });

    const pool = await getPool();
    const dup  = await pool.request().input('code', sql.NVarChar, code.toUpperCase()).query('SELECT id FROM coupons WHERE code = @code');
    if (dup.recordset.length) return NextResponse.json({ error: 'Ya existe un cupón con ese código' }, { status: 409 });

    const id = crypto.randomUUID();
    await pool.request()
      .input('id',         sql.NVarChar, id)
      .input('code',       sql.NVarChar, code.toUpperCase())
      .input('type',       sql.NVarChar, type)
      .input('value',      sql.Decimal,  parseFloat(value))
      .input('min_order',  sql.Decimal,  min_order  ?? null)
      .input('max_uses',   sql.Int,      max_uses   ?? null)
      .input('active',     sql.Bit,      active ? 1 : 0)
      .input('expires_at', sql.DateTime, expires_at ? new Date(expires_at) : null)
      .query(`
        INSERT INTO coupons (id, code, type, value, min_order, max_uses, active, expires_at)
        VALUES (@id, @code, @type, @value, @min_order, @max_uses, @active, @expires_at)
      `);

    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error('[admin/coupons POST]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
