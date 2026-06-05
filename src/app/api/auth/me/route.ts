import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest } from '@/lib/auth';
import { getPool, sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  const payload = getTokenFromRequest(req);
  if (!payload) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  try {
    const pool   = await getPool();
    const result = await pool.request()
      .input('id', sql.NVarChar, payload.id)
      .query('SELECT id, name, email, role, active FROM admin_users WHERE id = @id');

    const user = result.recordset[0];
    if (!user || !user.active) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    return NextResponse.json({ user });
  } catch (err) {
    console.error('[auth/me]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
