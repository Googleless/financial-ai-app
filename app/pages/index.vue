<template>
  <div class="min-h-screen bg-bg-light font-sans">
    <header class="bg-primary py-4 shadow-md flex justify-between items-center px-6">
      <div>
        <h1 class="text-2xl font-medium text-white lowercase">finassist</h1>
        <p class="text-xs font-light text-white">Ваш финансовый помощник</p>
      </div>
      <div class="flex items-center gap-4">
        <template v-if="isAuthenticated">
          <NuxtLink to="/profile" class="text-white/80 hover:text-white transition">Профиль</NuxtLink>
          <button @click="logout" class="text-white/80 hover:text-white transition">Выйти</button>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="text-white/80 hover:text-white transition">Войти</NuxtLink>
        </template>
      </div>
    </header>

    <main class="container mx-auto p-4 max-w-4xl">
      <template v-if="isAuthenticated">
        <!-- Форма запроса -->
        <div class="bg-white rounded-[30px] shadow-card p-6 mb-6">
          <label class="block text-lg font-medium mb-2">Ваш запрос к системе</label>
          <textarea
            v-model="query"
            rows="3"
            class="w-full border border-gray-300 rounded-2xl p-4 focus:ring-2 focus:ring-primary/50"
            placeholder="Например: последние новости по акциям Газпрома"
          ></textarea>
          <button
            @click="sendQuery"
            :disabled="loading"
            class="mt-4 bg-primary text-white px-8 py-3 rounded-full font-medium shadow hover:bg-primary/90 transition disabled:bg-gray-400"
          >
            {{ loading ? 'Обработка...' : 'Отправить' }}
          </button>
        </div>

        <!-- Ответ -->
        <div v-if="result" class="bg-white rounded-[30px] shadow-card p-6 mb-6">
          <h2 class="text-lg font-semibold mb-2">Ответ</h2>
          <div class="prose max-w-none">{{ result.response }}</div>
          <div v-if="result.news" class="mt-4">
          <h3 class="font-medium text-gray-700">Связанные новости:</h3>
          <ul class="space-y-1 mt-2">
            <li v-for="(item, idx) in result.news.split('\n').filter(Boolean)" :key="idx"
                class="text-sm text-gray-600 truncate max-w-full">
              {{ item }}
            </li>
          </ul>
        </div>
      </div>

        <!-- История -->
        <div v-if="history.length" class="bg-white rounded-[30px] shadow-card p-6">
          <h2 class="text-lg font-semibold mb-2">Ваши последние запросы</h2>
          <ul class="space-y-2">
            <li v-for="item in history.slice(0, 5)" :key="item.id" class="text-sm text-gray-600">
              <span class="font-medium">{{ item.text }}</span>
              – {{ new Date(item.createdAt).toLocaleString() }}
            </li>
          </ul>
        </div>
      </template>

      <!-- Приветствие для гостей -->
      <div v-else class="text-center mt-20">
        <h2 class="text-3xl font-semibold text-gray-800 mb-4">Добро пожаловать в finassist</h2>
        <p class="text-gray-600 mb-8">Ваш персональный финансовый помощник с ИИ</p>
        <NuxtLink
          to="/login"
          class="inline-block bg-primary text-white px-8 py-3 rounded-full font-medium shadow hover:bg-primary/90 transition"
        >
          Войти / Зарегистрироваться
        </NuxtLink>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// Убрана строка definePageMeta({ middleware: 'auth' })

const { isAuthenticated, logout } = useAuth()
const { fetchWithAuth } = useApi()

const query = ref('')
const loading = ref(false)
const result = ref(null)
const history = ref<any[]>([])

const sendQuery = async () => {
  if (!query.value.trim()) return
  loading.value = true
  try {
    const data = await fetchWithAuth('/api/query/ask', {
      method: 'POST',
      body: { query: query.value },
    })
    result.value = data
    await loadHistory()
  } catch (err) {
    alert('Ошибка выполнения запроса')
  } finally {
    loading.value = false
  }
}

const loadHistory = async () => {
  if (!isAuthenticated.value) return
  try {
    history.value = await fetchWithAuth('/api/query/history')
  } catch {}
}

onMounted(() => {
  if (isAuthenticated.value) {
    loadHistory()
  }
})
</script>