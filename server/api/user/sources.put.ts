// server/api/user/sources.put.ts
import prisma from '../../utils/prisma';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const { sources } = await readBody(event);

  if (!Array.isArray(sources)) {
    throw createError({ statusCode: 400, message: 'sources должен быть массивом' });
  }

  // Удаляем старые и создаём новые
  await prisma.userSource.deleteMany({ where: { userId } });
  if (sources.length > 0) {
    await prisma.userSource.createMany({
      data: sources.map(source => ({ userId, source })),
    });
  }

  return { sources };
});