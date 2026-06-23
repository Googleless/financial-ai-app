// server/api/user/sources.get.ts
import prisma from '../../utils/prisma';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const sources = await prisma.userSource.findMany({
    where: { userId },
    select: { source: true },
  });
  return sources.map(s => s.source);
});