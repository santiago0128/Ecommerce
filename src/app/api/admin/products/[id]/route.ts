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

    const map: Record<string, [string, (v: unknown) => unknown]> = {
      name:           ['name',           v => String(v)],
      description:    ['description',    v => String(v)],
      price:          ['price',          v => parseFloat(v as string)],
      original_price: ['original_price', v => v ? parseFloat(v as string) : null],
      image:          ['image',          v => String(v)],
      category_id:    ['category_id',    v => v ?? null],
      stock:          ['stock',          v => parseInt(v as string)],
      sku:            ['sku',            v => v ?? null],
      brand:          ['brand',          v => v ?? null],
      featured:       ['featured',       v => v ? 1 : 0],
      active:         ['active',         v => v ? 1 : 0],
      tags:           ['tags',           v => JSON.stringify(v ?? [])],
    };

    for (const [key, [col, transform]] of Object.entries(map)) {
      if (key in body) {
        sets.push(`${col} = @${key}`);
        request.input(key, sql.NVarChar, transform(body[key]) as string);
      }
    }
    // price/stock need numeric types — override
    if ('price' in body)    { request.replaceInput?.('price', sql.Decimal, parseFloat(body.price)); }
    if ('original_price' in body && body.original_price) { request.replaceInput?.('original_price', sql.Decimal, parseFloat(body.original_price)); }
    if ('stock' in body)    { request.replaceInput?.('stock', sql.Int, parseInt(body.stock)); }
    if ('featured' in body) { request.replaceInput?.('featured', sql.Bit, body.featured ? 1 : 0); }
    if ('active' in body)   { request.replaceInput?.('active', sql.Bit, body.active ? 1 : 0); }

    if (sets.length === 0) return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });
    sets.push('updated_at = GETDATE()');
    await request.query(`UPDATE products SET ${sets.join(', ')} WHERE id = @id`);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/products/:id PUT]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const auth = requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await ctx.params;
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.NVarChar, id)
      .query('UPDATE products SET active = 0, updated_at = GETDATE() WHERE id = @id');
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/products/:id DELETE]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
