import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = req.nextUrl;
  const search    = searchParams.get('search') ?? '';
  const category  = searchParams.get('category') ?? '';
  const stock     = searchParams.get('stock') ?? 'all'; // all | low | out

  try {
    const pool = await getPool();
    const conditions: string[] = ['1=1'];
    const request = pool.request();

    if (search)   { conditions.push('(name LIKE @q OR description LIKE @q)'); request.input('q', sql.NVarChar, `%${search}%`); }
    if (category) { conditions.push('category_id = @cat'); request.input('cat', sql.NVarChar, category); }
    if (stock === 'out') conditions.push('stock = 0');
    if (stock === 'low') conditions.push('stock > 0 AND stock <= 5');

    const result = await request.query(`
      SELECT p.id, p.name, p.description, p.price, p.original_price,
             p.image, p.stock, p.sku, p.brand, p.rating, p.review_count,
             p.featured, p.active, p.tags, p.category_id,
             c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY p.created_at DESC
    `);

    const products = result.recordset.map(p => ({
      ...p,
      tags: tryParse(p.tags, []),
      featured: !!p.featured,
      active: !!p.active,
    }));

    return NextResponse.json({ products });
  } catch (err) {
    console.error('[admin/products GET]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await req.json();
    const { name, description, price, original_price, image, category_id, stock, sku, brand, featured, tags } = body;
    if (!name || !price || stock === undefined) {
      return NextResponse.json({ error: 'Nombre, precio y stock son requeridos' }, { status: 400 });
    }

    const pool = await getPool();
    const id   = crypto.randomUUID();

    await pool.request()
      .input('id',         sql.NVarChar, id)
      .input('name',       sql.NVarChar, name.trim())
      .input('desc',       sql.NVarChar, description?.trim() ?? '')
      .input('price',      sql.Decimal,  parseFloat(price))
      .input('orig',       sql.Decimal,  original_price ? parseFloat(original_price) : null)
      .input('image',      sql.NVarChar, image ?? '')
      .input('cat',        sql.NVarChar, category_id ?? null)
      .input('stock',      sql.Int,      parseInt(stock))
      .input('sku',        sql.NVarChar, sku ?? null)
      .input('brand',      sql.NVarChar, brand ?? null)
      .input('featured',   sql.Bit,      featured ? 1 : 0)
      .input('tags',       sql.NVarChar, JSON.stringify(tags ?? []))
      .query(`
        INSERT INTO products (id, name, description, price, original_price, image, category_id, stock, sku, brand, featured, active, tags)
        VALUES (@id, @name, @desc, @price, @orig, @image, @cat, @stock, @sku, @brand, @featured, 1, @tags)
      `);

    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error('[admin/products POST]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

function tryParse(v: unknown, fallback: unknown) {
  if (!v) return fallback;
  try { return JSON.parse(v as string); } catch { return fallback; }
}
