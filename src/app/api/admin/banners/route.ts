import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const pool   = await getPool();
    const result = await pool.request().query('SELECT id, title, subtitle, image, link, bg_color, active, sort_order FROM banners ORDER BY sort_order ASC');
    return NextResponse.json({ banners: result.recordset.map(b => ({ ...b, active: !!b.active })) });
  } catch (err) {
    console.error('[admin/banners GET]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { title, subtitle, image, link, bg_color, active, sort_order } = await req.json();
    if (!title) return NextResponse.json({ error: 'Título requerido' }, { status: 400 });

    const pool = await getPool();
    const id   = crypto.randomUUID();
    await pool.request()
      .input('id',         sql.NVarChar, id)
      .input('title',      sql.NVarChar, title.trim())
      .input('subtitle',   sql.NVarChar, subtitle ?? null)
      .input('image',      sql.NVarChar, image ?? null)
      .input('link',       sql.NVarChar, link ?? null)
      .input('bg_color',   sql.NVarChar, bg_color ?? null)
      .input('active',     sql.Bit,      active ? 1 : 0)
      .input('sort_order', sql.Int,      sort_order ?? 99)
      .query('INSERT INTO banners (id, title, subtitle, image, link, bg_color, active, sort_order) VALUES (@id, @title, @subtitle, @image, @link, @bg_color, @active, @sort_order)');

    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error('[admin/banners POST]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
