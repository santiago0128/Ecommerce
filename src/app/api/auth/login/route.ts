import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getPool, sql } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseÃ±a requeridos' }, { status: 400 });
    }

    const pool   = await getPool();
    const result = await pool.request()
      .input('email', sql.NVarChar, email.toLowerCase().trim())
      .query(`
        SELECT id, name, email, password_hash, role, active
        FROM admin_users
        WHERE email = @email
      `);

    const user = result.recordset[0];
    if (!user) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }
    if (!user.active) {
      return NextResponse.json({ error: 'Cuenta desactivada' }, { status: 403 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }

    const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });

    const res = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    });
    res.cookies.set('ecoshop_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8h
      path: '/',
    });
    return res;
  } catch (err) {
    console.error('[auth/login]', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
