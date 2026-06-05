import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/settings â€” returns all settings as { key: value } map
export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const pool   = await getPool();
    const result = await pool.request().query('SELECT [key], value FROM settings');

    const settings: Record<string, string> = {};
    for (const row of result.recordset) settings[row.key] = row.value;

    return NextResponse.json({ settings });
  } catch (err) {
    console.error('[admin/settings GET]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// PUT /api/admin/settings â€” upsert one or more settings
export async function PUT(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (auth.payload!.role !== 'admin') return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });

  try {
    const body: Record<string, string> = await req.json();
    const pool = await getPool();

    for (const [key, value] of Object.entries(body)) {
      await pool.request()
        .input('k', sql.NVarChar, key)
        .input('v', sql.NVarChar, String(value))
        .query(`
          IF EXISTS (SELECT 1 FROM settings WHERE [key] = @k)
            UPDATE settings SET value = @v, updated_at = GETDATE() WHERE [key] = @k
          ELSE
            INSERT INTO settings ([key], value) VALUES (@k, @v)
        `);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/settings PUT]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
