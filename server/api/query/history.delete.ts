// server/api/query/history.delete.ts
import prisma from '../../utils/prisma';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  await prisma.query.deleteMany({ where: { userId } });
  return { success: true };
});