import prisma from '../../utils/prisma';
import { comparePassword, generateToken } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event);

  if (!email || !password) {
    throw createError({ statusCode: 400, message: 'Email и пароль обязательны' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw createError({ statusCode: 401, message: 'Неверные учетные данные' });
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    throw createError({ statusCode: 401, message: 'Неверные учетные данные' });
  }

  const token = generateToken(user.id);
  return { token, user: { id: user.id, email: user.email } };
});