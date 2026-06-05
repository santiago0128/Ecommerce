import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getPool, sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/users â€” list all admin users
export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const pool   = await getPool();
    const result = await pool.request().query(`
      SELECT id, name, email, role, active,
             FORMAT(created_at, 'yyyy-MM-dd') AS created_at
      FROM admin_users
      ORDER BY created_at DESC
    `);
    return NextResponse.json({ users: result.recordset });
  } catch (err) {
    console.error('[admin/users GET]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// POST /api/admin/users â€” create admin user
export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  // Only admins can create users
  if (auth.payload!.role !== 'admin') return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });

  try {
    const { name, email, password, role } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nombre, email y contraseÃ±a son requeridos' }, { status: 400 });
    }
    const validRoles = ['admin', 'editor', 'viewer'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Rol invÃ¡lido' }, { status: 400 });
    }

    const pool = await getPool();

    // Check duplicate
    const dup = await pool.request()
      .input('email', sql.NVarChar, email.toLowerCase().trim())
      .query('SELECT id FROM admin_users WHERE email = @email');
    if (dup.recordset.length > 0) {
      return NextResponse.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.request()
      .input('name',  sql.NVarChar, name.trim())
      .input('email', sql.NVarChar, email.toLowerCase().trim())
      .input('hash',  sql.NVarChar, hash)
      .input('role',  sql.NVarChar,  role)
      .query(`
        INSERT INTO admin_users (name, email, password_hash, role, active)
        OUTPUT INSERTED.id, INSERTED.name, INSERTED.email, INSERTED.role, INSERTED.active
        VALUES (@name, @email, @hash, @role, 1)
      `);

    return NextResponse.json({ user: result.recordset[0] }, { status: 201 });
  } catch (err) {
    console.error('[admin/users POST]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
