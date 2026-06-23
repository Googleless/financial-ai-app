// server/api/query/ask.post.ts
import prisma from '../../utils/prisma';
import { requireAuth } from '../../utils/auth';
import OpenAI from 'openai';
import Parser from 'rss-parser';

const rssParser = new Parser();

// ======================== ЗАГОТОВКИ НОВОСТЕЙ ========================
const russianTestNews: Record<string, string> = {
  'газпром': '- «Газпром» нарастит поставки газа в Китай до 38 млрд куб. м (Интерфакс)\n- Акции «Газпрома» выросли на 2,3% после рекомендации дивидендов (РБК)\n- Совет директоров «Газпрома» рекомендовал дивиденды за 2024 год (Ведомости)',
  'сбер': '- Сбербанк отчитался о рекордной чистой прибыли за 2025 год (Интерфакс)\n- Сбер запустил новый сервис для инвесторов с ИИ-аналитикой (РБК)\n- Акции Сбера обновили исторический максимум на фоне отчетности (Ведомости)',
  'нефть': '- Цена Brent превысила $85 за баррель после решения ОПЕК+ (ТАСС)\n- Россия снизила экспорт нефти в марте на 5% (Коммерсантъ)\n- Минэнерго США повысило прогноз цен на нефть до $88 (Reuters)',
  'рубль': '- Курс доллара опустился ниже 90 рублей впервые за месяц (РБК)\n- ЦБ РФ заявил о стабилизации валютного рынка (Интерфакс)\n- Минфин увеличит продажи юаней для поддержки рубля (ТАСС)',
};

const russianDefaultNews = '- Индекс МосБиржи вырос на 1,2% на фоне подорожания нефти (РБК)\n- ЦБ РФ сохранил ключевую ставку на уровне 14% (Интерфакс)\n- Объем торгов на МосБирже достиг рекордных значений в 2025 году (ТАСС)';

const globalTestNews: Record<string, string> = {
  'apple': '- Apple представила новый MacBook Pro с чипом M5 (Bloomberg)\n- Продажи iPhone 16 выросли на 15% в Китае (Reuters)\n- Акции Apple достигли исторического максимума после отчёта (CNBC)',
  'tesla': '- Tesla начала поставки Cybertruck в Европу (Electrek)\n- Акции Tesla выросли на 8% после новостей о роботакси (Reuters)\n- Илон Маск анонсировал новую модель Tesla за $25 000 (Forbes)',
};

const globalDefaultNews = '- S&P 500 обновил исторический максимум на фоне снижения ставки ФРС (CNBC)\n- Европейский центробанк намекнул на смягчение политики в следующем квартале (Bloomberg)\n- Акции технологического сектора лидируют по темпам роста в 2025 году (Reuters)';

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
function isRussianQuery(keywords: string[]): boolean {
  const russianMarkers = ['газпром', 'сбер', 'роснефть', 'лукойл', 'рубль', 'мосбиржа', 'ртс', 'ммвб', 'цб', 'нефть', 'российский'];
  const lower = keywords.map(k => k.toLowerCase());
  return lower.some(k => russianMarkers.some(m => k.includes(m) || m.includes(k)));
}

function getRelevantNews(keywords: string[], isRussian: boolean): string {
  const lower = keywords.map(k => k.toLowerCase());

  if (isRussian) {
    for (const key of Object.keys(russianTestNews)) {
      if (lower.some(k => k.includes(key) || key.includes(k))) {
        return russianTestNews[key];
      }
    }
    return russianDefaultNews;
  } else {
    for (const key of Object.keys(globalTestNews)) {
      if (lower.some(k => k.includes(key) || key.includes(k))) {
        return globalTestNews[key];
      }
    }
    return globalDefaultNews;
  }
}

function getMainKeyword(keywords: string[]): string | null {
  if (keywords.length === 0) return null;
  const sorted = [...keywords].sort((a, b) => b.length - a.length);
  return sorted[0].toLowerCase();
}

// ==================== ИЗВЛЕЧЕНИЕ КЛЮЧЕВЫХ СЛОВ ====================
async function extractKeywords(prompt: string): Promise<string[]> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.warn('DEEPSEEK_API_KEY не задан, вернём базовые ключевые слова');
    return prompt.split(/\s+/).filter(w => w.length > 2).slice(0, 5);
  }

  const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey,
  });

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Извлеки из запроса пользователя ключевые слова для поиска финансовых новостей. Верни ТОЛЬКО список ключевых слов через запятую, без дополнительных слов. Максимум 5 слов. На русском или английском, в зависимости от запроса.',
        },
        { role: 'user', content: prompt },
      ],
      model: 'deepseek-chat',
      stream: false,
      // @ts-ignore
      response_format: { type: 'text' },
    });

    const text = completion.choices?.[0]?.message?.content || '';
    const keywords = text.split(/[,;\n]/).map(k => k.trim()).filter(k => k.length > 0);
    console.log('Извлечённые ключевые слова:', keywords);
    return keywords.length > 0 ? keywords.slice(0, 5) : prompt.split(/\s+/).slice(0, 5);
  } catch (e) {
    console.error('Ошибка извлечения ключевых слов:', e);
    return prompt.split(/\s+/).slice(0, 5);
  }
}

// ==================== ПОЛУЧЕНИЕ НОВОСТЕЙ (RSS + фильтрация + заготовки) ====================
async function fetchFinancialNews(keywords: string[], enabledSources: string[]): Promise<string> {
  const rssFeeds = [
    { url: 'https://www.kommersant.ru/rss/news.xml', name: 'kommersant' },
    { url: 'https://tass.ru/rss/v2.xml', name: 'tass' },
    { url: 'https://lenta.ru/rss', name: 'lenta' },
  ];

  // Фильтр по пользовательским настройкам
  const feedsToUse = enabledSources.length > 0
    ? rssFeeds.filter(f => enabledSources.includes(f.name))
    : rssFeeds;

  const allItems: { title: string; source: string }[] = [];

  // 1. RSS
  for (const feed of feedsToUse) {
    try {
      const rawXml = await $fetch(feed.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        },
        responseType: 'text',
      });
      const cleanedXml = rawXml.replace(/^[^<]*/, '');
      const parsed = await rssParser.parseString(cleanedXml);
      const items = parsed.items || [];
      items.forEach(item => {
        if (item.title) allItems.push({ title: item.title, source: feed.name });
      });
      console.log(`${feed.name}: ${items.length} заголовков`);
    } catch (e: any) {
      console.warn(`RSS ${feed.name} недоступен: ${e?.message}`);
    }
  }

  // 2. GNews API (если включён)
  const useGNews = enabledSources.length === 0 || enabledSources.includes('gnews');
  if (useGNews) {
    const apiKey = process.env.GNEWS_API_KEY;
    if (apiKey) {
      try {
        // GNews плохо ищет по длинным русским фразам, используем первые два ключевых слова
        const searchPhrase = keywords.slice(0, 2).join(' ');
        const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(searchPhrase)}&max=5&apikey=${apiKey}`;
        console.log('GNews URL:', url);
        const data = await $fetch<{ articles?: { title: string; source: { name: string } }[] }>(url);
        const articles = data?.articles || [];
        articles.forEach(a => {
          if (a.title) allItems.push({ title: a.title, source: a.source?.name || 'GNews' });
        });
        console.log(`GNews: ${articles.length} статей`);
      } catch (e: any) {
        console.warn('GNews API ошибка:', e?.message);
      }
    } else {
      console.warn('GNEWS_API_KEY не задан – GNews пропущен');
    }
  }

  // 3. Двойная фильтрация: сначала отсекаем новости без финансовой лексики,
  //    затем отбираем по ключевым словам запроса
  const financialTerms = [
    'акци', 'рынок', 'биржа', 'валюта', 'курс',
    'нефт', 'газ', 'золото', 'облигац', 'дивиденд', 'фрс',
    'центробанк', 'минфин', 'фондов', 'трейд', 'брокер',
    'котировк', 'индекс', 'мосбирж', 'ртс', 'ммвб',
    'ставк', 'инфляц', 'ввп', 'дефолт', 'прибыль',
    'выручк', 'отчёт', 'отчет', 'квартальн',
    'госдолг', 'евробонд', 'фьючерс', 'опцион',
    'шорт', 'лонг', 'крипт', 'биткоин', 'эфир',
    'майнинг', 'токен', 'defi',
    'спрос', 'предложение', 'добыч', 'экспорт', 'импорт',
    'санкц', 'эмбарго',
  ];

  // allItems уже существует – просто используем его
  let filtered = allItems.filter(item => {
    const titleLower = item.title.toLowerCase();
    return financialTerms.some(term => titleLower.includes(term));
  });

  if (filtered.length === 0) {
    const isRussian = isRussianQuery(keywords);
    const news = getRelevantNews(keywords, isRussian);
    console.log('Нет финансовых новостей, использованы заготовки');
    return news;
  }

  // Дополнительно фильтруем по ключевым словам пользователя
  const stopWords = ['новости', 'последние', 'новость', 'события', 'сегодня', 'главные'];
  const significant = keywords.filter(k => k.length > 3 && !stopWords.includes(k.toLowerCase()));
  const filterKeys = significant.length > 0 ? significant : keywords;
  const lowerKeys = filterKeys.map(k => k.toLowerCase());

  const keywordFiltered = filtered.filter(item => {
    const titleLower = item.title.toLowerCase();
    return lowerKeys.some(kw => titleLower.includes(kw));
  });

  if (keywordFiltered.length > 0) {
    keywordFiltered.sort((a, b) => {
      const scoreA = lowerKeys.filter(kw => a.title.toLowerCase().includes(kw)).length;
      const scoreB = lowerKeys.filter(kw => b.title.toLowerCase().includes(kw)).length;
      return scoreB - scoreA;
    });
    const headlines = keywordFiltered
      .slice(0, 5)
      .map(item => `- ${item.title} (${item.source})`)
      .join('\n');
    console.log(`Отфильтровано по финансам и ключам: ${keywordFiltered.length} заголовков`);
    return headlines;
  }

  // Если по ключевым словам ничего не найдено – покажем последние финансовые (до 5)
  const fallbackHeadlines = filtered
    .slice(0, 5)
    .map(item => `- ${item.title} (${item.source})`)
    .join('\n');
  console.log(`Ключевые слова не найдены в финансах, показаны последние финансовые: ${filtered.length}`);
  return fallbackHeadlines;

  // 4. Fallback на заготовки
  const isRussian = isRussianQuery(keywords);
  const news = getRelevantNews(keywords, isRussian);
  console.log('Использованы заготовки новостей');
  return news;
}

// Получение новостей через GNews API (JSON)
async function fetchGNews(keywords: string[]): Promise<{ title: string; source: string }[]> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    console.warn('GNEWS_API_KEY не задан');
    return [];
  }

  const query = keywords.join(' ');
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=ru&country=ru&max=5&apikey=${apiKey}`;

  try {
    const data = await $fetch<{ articles?: { title: string; source: { name: string } }[] }>(url);
    const articles = data?.articles || [];
    console.log(`GNews: ${articles.length} статей`);
    return articles.map(a => ({ title: a.title, source: a.source?.name || 'GNews' }));
  } catch (e: any) {
    console.warn('GNews API ошибка:', e?.message);
    return [];
  }
}

// ==================== ФИНАЛЬНЫЙ ОТВЕТ ИИ ====================
async function askDeepSeek(prompt: string, news: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return 'Ошибка: не задан ключ DeepSeek.';

  const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey,
  });

  const useThinking = process.env.DEEPSEEK_THINKING === 'true';

  // Базовые параметры запроса
  const params: any = {
    messages: [
      {
        role: 'system',
        content: `Ты — опытный финансовый аналитик в 2026 году. Отвечай строго на русском языке, без Markdown‑разметки. Используй предоставленные новости, если они относятся к финансам, указанной теме, и могут быть полезны. Если новостей недостаточно, опирайся на свои знания о рынке и дай общий обзор или рекомендации по финансовому направлению. Не пиши фразы вроде "единственная информация" – просто излагай суть. Не пиши много "воды" или текста и не старайся казаться исключительно заумным. Сохраняй официально-деловой стиль речи. \nНовости:\n${news}`,
      },
      { role: 'user', content: prompt },
    ],
    model: 'deepseek-v4-pro',
    stream: false,
  };

  // Добавляем thinking, если он включён
  if (useThinking) {
    params.reasoning_effort = 'high';
    params.extra_body = {
      thinking: { type: 'enabled' },
    };
  }

  try {
    const completion = await openai.chat.completions.create(params);
    const content = completion.choices?.[0]?.message?.content || 'Нет ответа.';
    return content;
  } catch (e: any) {
    console.error('Ошибка DeepSeek:', e);
    return 'Произошла ошибка при обращении к ИИ.';
  }
}
// ==================== ОСНОВНОЙ ОБРАБОТЧИК ====================
export default defineEventHandler(async (event) => {
  const userId = requireAuth(event);
  const { query } = await readBody(event);

  if (!query || typeof query !== 'string') {
    throw createError({ statusCode: 400, message: 'Запрос не может быть пустым' });
  }

  console.log('Запрос пользователя:', query);

  // Получаем сохранённые источники пользователя
  const userSources = await prisma.userSource.findMany({
    where: { userId },
    select: { source: true },
  });
  const enabledSources = userSources.map(s => s.source);

  const keywords = await extractKeywords(query);
  const news = await fetchFinancialNews(keywords, enabledSources);
  const aiResponse = await askDeepSeek(query, news);

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