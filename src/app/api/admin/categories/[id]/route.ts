import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

type Ctx = { params: Promise<{ id: string }> };

const slugify = (s: string) =>
  s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export async function PUT(req: NextRequest, ctx: Ctx) {
  const auth = requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await ctx.params;
  try {
    const body = await req.json();
    const pool = await getPool();
    const sets: string[] = [];
    const request = pool.request().input('id', sql.NVarChar, id);

    if ('name' in body) {
      sets.push('name = @name');
      request.input('name', sql.NVarChar, body.name);
      sets.push('slug = @slug');
      request.input('slug', sql.NVarChar, slugify(body.name));
    }
    if ('icon' in body) { sets.push('icon = @icon'); request.input('icon', sql.NVarChar, body.icon ?? null); }

    if (!sets.length) return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });
    await request.query(`UPDATE categories SET ${sets.join(', ')} WHERE id = @id`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/categories/:id PUT]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const auth = requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await ctx.params;
  try {
    const pool = await getPool();
    await pool.request().input('id', sql.NVarChar, id).query('DELETE FROM categories WHERE id = @id');
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/categories/:id DELETE]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
