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

    if ('title'      in body) { sets.push('title = @title');           request.input('title',      sql.NVarChar, body.title); }
    if ('subtitle'   in body) { sets.push('subtitle = @subtitle');     request.input('subtitle',   sql.NVarChar, body.subtitle ?? null); }
    if ('image'      in body) { sets.push('image = @image');           request.input('image',      sql.NVarChar, body.image ?? null); }
    if ('link'       in body) { sets.push('link = @link');             request.input('link',       sql.NVarChar, body.link ?? null); }
    if ('bg_color'   in body) { sets.push('bg_color = @bg_color');     request.input('bg_color',   sql.NVarChar, body.bg_color ?? null); }
    if ('active'     in body) { sets.push('active = @active');         request.input('active',     sql.Bit,      body.active ? 1 : 0); }
    if ('sort_order' in body) { sets.push('sort_order = @sort_order'); request.input('sort_order', sql.Int,      body.sort_order); }

    if (!sets.length) return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });
    await request.query(`UPDATE banners SET ${sets.join(', ')} WHERE id = @id`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/banners/:id PUT]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const auth = requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await ctx.params;
  try {
    const pool = await getPool();
    await pool.request().input('id', sql.NVarChar, id).query('DELETE FROM banners WHERE id = @id');
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/banners/:id DELETE]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
