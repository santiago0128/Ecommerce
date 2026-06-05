import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getPool, sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const auth = requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await ctx.params;
  try {
    const pool   = await getPool();
    const result = await pool.request()
      .input('id', sql.NVarChar, id)
      .query("SELECT id, name, email, role, active, FORMAT(created_at,'yyyy-MM-dd') AS created_at FROM admin_users WHERE id = @id");

    if (!result.recordset[0]) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json({ user: result.recordset[0] });
  } catch (err) {
    console.error('[admin/users/:id GET]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const auth = requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (auth.payload!.role !== 'admin') return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });

  const { id } = await ctx.params;
  try {
    const body = await req.json();
    const { name, email, role, active, password } = body;
    const pool  = await getPool();

    const sets: string[] = [];
    const request        = pool.request().input('id', sql.NVarChar, id);

    if (name    !== undefined) { sets.push('name = @name');     request.input('name',   sql.NVarChar, name.trim()); }
    if (email   !== undefined) { sets.push('email = @email');   request.input('email',  sql.NVarChar, email.toLowerCase().trim()); }
    if (role    !== undefined) { sets.push('role = @role');     request.input('role',   sql.NVarChar, role); }
    if (active  !== undefined) { sets.push('active = @active'); request.input('active', sql.Bit, active ? 1 : 0); }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      sets.push('password_hash = @hash');
      request.input('hash', sql.NVarChar, hash);
    }

    if (sets.length === 0) return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });

    sets.push('updated_at = GETDATE()');
    await request.query(`UPDATE admin_users SET ${sets.join(', ')} WHERE id = @id`);

    const updated = await pool.request()
      .input('id', sql.NVarChar, id)
      .query('SELECT id, name, email, role, active FROM admin_users WHERE id = @id');

    return NextResponse.json({ user: updated.recordset[0] });
  } catch (err) {
    console.error('[admin/users/:id PUT]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const auth = requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (auth.payload!.role !== 'admin') return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });

  const { id } = await ctx.params;
  if (auth.payload!.id === id) return NextResponse.json({ error: 'No puedes eliminarte a ti mismo' }, { status: 400 });

  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.NVarChar, id)
      .query('UPDATE admin_users SET active = 0, updated_at = GETDATE() WHERE id = @id');
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/users/:id DELETE]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
