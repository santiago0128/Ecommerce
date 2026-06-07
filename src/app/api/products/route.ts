import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

function tryParse<T>(v: unknown, fallback: T): T {
  if (!v) return fallback;
  try { return JSON.parse(v as string) as T; } catch { return fallback; }
}

const PLACEHOLDER_IMAGE = '/product-placeholder.svg';
const withFallback = (url: unknown) => (typeof url === 'string' && url.trim() ? url : PLACEHOLDER_IMAGE);

// ─── GET /api/products ────────────────────────────────────────
// Public catalog feed for the storefront — only active products.
export async function GET() {
  try {
    const pool   = await getPool();
    const result = await pool.request().query(`
      SELECT p.id, p.name, p.description, p.price, p.original_price,
             p.image, p.images, p.stock, p.sku, p.brand, p.rating, p.review_count,
             p.featured, p.tags, p.variants, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.active = 1
      ORDER BY p.created_at DESC
    `);

    const products = result.recordset.map(p => {
      const image  = withFallback(p.image);
      const images = tryParse<string[]>(p.images, [p.image]).map(withFallback);
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        price: Number(p.price),
        originalPrice: p.original_price != null ? Number(p.original_price) : undefined,
        image,
        images: images.length ? images : [image],
        category: p.category_slug ?? '',
        rating: Number(p.rating),
        reviews: p.review_count,
        stock: p.stock,
        tags: tryParse<string[]>(p.tags, []),
        featured: !!p.featured,
        variants: tryParse(p.variants, undefined),
        brand: p.brand ?? undefined,
        sku: p.sku ?? undefined,
      };
    });

    return NextResponse.json({ products });
  } catch (err) {
    console.error('[products GET]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
