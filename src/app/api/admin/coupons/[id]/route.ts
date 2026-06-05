import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  const auth = requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await ctx.params;
  try {
    const body = await req.json();
    const pool = await getPool();
    const sets: string[] = [];
    const request = pool.request().input('id', sql.NVarChar, id);

    if ('code'       in body) { sets.push('code = @code');             request.input('code',       sql.NVarChar,  body.code.toUpperCase()); }
    if ('type'       in body) { sets.push('type = @type');             request.input('type',       sql.NVarChar,  body.type); }
    if ('value'      in body) { sets.push('value = @value');           request.input('value',      sql.Decimal,   parseFloat(body.value)); }
    if ('min_order'  in body) { sets.push('min_order = @min_order');   request.input('min_order',  sql.Decimal,   body.min_order ?? null); }
    if ('max_uses'   in body) { sets.push('max_uses = @max_uses');     request.input('max_uses',   sql.Int,       body.max_uses ?? null); }
    if ('active'     in body) { sets.push('active = @active');         request.input('active',     sql.Bit,       body.active ? 1 : 0); }
    if ('expires_at' in body) { sets.push('expires_at = @expires_at'); request.input('expires_at', sql.DateTime,  body.expires_at ? new Date(body.expires_at) : null); }

    if (!sets.length) return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });
    await request.query(`UPDATE coupons SET ${sets.join(', ')} WHERE id = @id`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/coupons/:id PUT]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const auth = requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await ctx.params;
  try {
    const pool = await getPool();
    await pool.request().input('id', sql.NVarChar, id).query('DELETE FROM coupons WHERE id = @id');
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/coupons/:id DELETE]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
