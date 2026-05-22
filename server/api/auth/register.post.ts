import prisma from '../../utils/prisma';
import { hashPassword, generateToken } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = body;

  if (!email || !password) {
    throw createError({ statusCode: 400, message: 'Email и пароль обязательны' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw createError({ statusCode: 409, message: 'Пользователь уже существует' });
  }

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, password: hashed },
  });

  const token = generateToken(user.id);
  return { token, user: { id: user.id, email: user.email } };
});