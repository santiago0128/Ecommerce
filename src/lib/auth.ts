import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const SECRET = process.env.JWT_SECRET ?? 'ecoshop_jwt_dev_secret';

export interface JwtPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '8h' });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest): JwtPayload | null {
  const auth   = req.headers.get('authorization') ?? '';
  const cookie = req.cookies.get('ecoshop_token')?.value ?? '';
  const token  = auth.startsWith('Bearer ') ? auth.slice(7) : cookie;
  if (!token) return null;
  return verifyToken(token);
}

export function requireAdmin(req: NextRequest) {
  const payload = getTokenFromRequest(req);
  if (!payload) return { error: 'No autenticado', status: 401 };
  if (!['admin', 'editor'].includes(payload.role)) return { error: 'Sin permisos', status: 403 };
  return { payload };
}
