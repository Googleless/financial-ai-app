import prisma from '../../utils/prisma';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const { tickers } = await readBody(event);

  if (!Array.isArray(tickers)) {
    throw createError({ statusCode: 400, message: 'tickers должен быть массивом' });
  }

  await prisma.preference.deleteMany({ where: { userId } });
  if (tickers.length > 0) {
    await prisma.preference.createMany({
      data: tickers.map(ticker => ({ userId, ticker })),
    });
  }

  return { tickers };
});