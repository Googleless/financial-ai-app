// server/api/query/ask.post.ts
import prisma from '../../utils/prisma';
import { requireAuth } from '../../utils/auth';
import OpenAI from 'openai';

// Инициализация DeepSeek клиента
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY!,
});


async function fetchFinancialNews(query: string, tickers: string[]): Promise<string> {
  const apiKey = process.env.NEWSAPI_KEY;
  try {
    const response = await $fetch<{ articles: { title: string; source: { name: string } }[] }>(
      `https://newsapi.org/v2/everything`,
      {
        params: {
          q: `${query} ${tickers.join(' OR ')}`,
          language: 'ru',
          sortBy: 'publishedAt',
          pageSize: 5,
          apiKey,
        },
      }
    );
    const articles = response.articles || [];
    if (articles.length === 0) return 'Новостей по запросу не найдено.';
    return articles.map((a) => `- ${a.title} (${a.source.name})`).join('\n');
  } catch {
    return 'Не удалось загрузить новости.';
  }
}

async function askDeepSeek(prompt: string, newsContext: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Ты — финансовый аналитик в 2026 году. Отвечай кратко и по делу. Используй следующие актуальные новости как контекст, если они полезны:\n${newsContext}`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'deepseek-v4-pro',
      thinking: {"type": "enabled"},
      reasoning_effort: "high",
      stream: false,
    });

    return completion.choices[0].message.content || 'Нет ответа.';
  } catch (error: any) {
    console.error('DeepSeek API error:', error);
    return 'Произошла ошибка при обращении к ИИ. Пожалуйста, попробуйте позже.';
  }
}

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const { query } = await readBody(event);

  if (!query || typeof query !== 'string') {
    throw createError({ statusCode: 400, message: 'Запрос не может быть пустым' });
  }

  // Получаем предпочтения пользователя (для контекста новостей)
  const prefs = await prisma.preference.findMany({
    where: { userId },
    select: { ticker: true },
  });
  const tickers = prefs.map((p) => p.ticker);

  // Получаем новости
  const news = await fetchFinancialNews(query, tickers);

  // Отправляем запрос в DeepSeek, передавая новости как контекст
  const aiResponse = await askDeepSeek(query, news);

  // Сохраняем в историю
  await prisma.query.create({
    data: {
      userId,
      text: query,
      response: aiResponse,
    },
  });

  return {
    response: aiResponse,
    news: news,
  };
});