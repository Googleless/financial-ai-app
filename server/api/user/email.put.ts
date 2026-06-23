// server/api/user/email.put.ts
import prisma from '../../utils/prisma';
import { requireAuth, comparePassword } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const { currentPassword, newEmail } = await readBody(event);

  if (!currentPassword || !newEmail) {
    throw createError({ statusCode: 400, message: 'Текущий пароль и новый email обязательны' });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw createError({ statusCode: 404, message: 'Пользователь не найден' });

  const valid = await comparePassword(currentPassword, user.password);
  if (!valid) throw createError({ statusCode: 401, message: 'Неверный текущий пароль' });

  // Проверяем, не занят ли email
  const existing = await prisma.user.findUnique({ where: { email: newEmail } });
  if (existing && existing.id !== userId) {
    throw createError({ statusCode: 409, message: 'Этот email уже используется' });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { email: newEmail },
  });

  return { email: newEmail };
});