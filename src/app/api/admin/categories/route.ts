import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

const slugify = (s: string) =>
  s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

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

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { name, icon } = await req.json();
    if (!name) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });

    const slug = slugify(name);
    const pool = await getPool();
    const dup  = await pool.request()
      .input('name', sql.NVarChar, name)
      .input('slug', sql.NVarChar, slug)
      .query('SELECT id FROM categories WHERE name = @name OR slug = @slug');
    if (dup.recordset.length) return NextResponse.json({ error: 'Ya existe una categoría con ese nombre' }, { status: 409 });

    const id = crypto.randomUUID();
    await pool.request()
      .input('id',   sql.NVarChar, id)
      .input('name', sql.NVarChar, name)
      .input('slug', sql.NVarChar, slug)
      .input('icon', sql.NVarChar, icon ?? null)
      .query(`
        INSERT INTO categories (id, name, slug, icon)
        VALUES (@id, @name, @slug, @icon)
      `);

    return NextResponse.json({ id, slug }, { status: 201 });
  } catch (err) {
    console.error('[admin/categories POST]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
