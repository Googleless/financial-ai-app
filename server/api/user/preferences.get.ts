import prisma from '../../utils/prisma';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const prefs = await prisma.preference.findMany({
    where: { userId },
    select: { id: true, ticker: true },
  });
  return prefs.map(p => p.ticker);
});