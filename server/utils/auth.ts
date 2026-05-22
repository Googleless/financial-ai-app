import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createError } from 'h3';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const TOKEN_EXPIRY = '7d';

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): { userId: number } {
  return jwt.verify(token, JWT_SECRET) as { userId: number };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function requireAuth(event: any): number {
  const token = event.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Требуется авторизация' });
  }
  try {
    const decoded = verifyToken(token);
    return decoded.userId;
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Недействительный токен' });
  }
}