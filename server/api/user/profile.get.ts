import prisma from '../../utils/prisma';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      _count: { select: { queries: true } },
    },
  });

  if (!user) throw createError({ statusCode: 404, message: 'Пользователь не найден' });

  return {
    email: user.email,
    queryCount: user._count.queries,
  };
});