<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow p-4 flex justify-between items-center">
      <h1 class="text-xl font-bold">FinAI Помощник</h1>
      <button @click="logout" class="text-red-600 hover:underline">Выйти</button>
    </header>
    <main class="container mx-auto p-4 max-w-4xl">
      <!-- Поле ввода запроса -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <label class="block text-lg font-medium mb-2">Ваш запрос к системе</label>
        <textarea v-model="query" rows="3"
          class="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-400"
          placeholder="Например: последние новости по акциям Газпрома"></textarea>
        <button @click="sendQuery" :disabled="loading"
          class="mt-3 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
          {{ loading ? 'Обработка...' : 'Отправить' }}
        </button>
      </div>

      <!-- Ответ -->
      <div v-if="result" class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-lg font-semibold mb-2">Ответ</h2>
        <div class="prose max-w-none">{{ result.response }}</div>
        <div v-if="result.news" class="mt-4">
          <h3 class="font-medium text-gray-700">Связанные новости:</h3>
          <pre class="text-sm bg-gray-50 p-3 rounded">{{ result.news }}</pre>
        </div>
      </div>

      <!-- История (последние 5) -->
      <div v-if="history.length" class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-semibold mb-2">Ваши последние запросы</h2>
        <ul class="space-y-2">
          <li v-for="item in history.slice(0, 5)" :key="item.id" class="text-sm text-gray-600">
            <span class="font-medium">{{ item.text }}</span>
            – {{ new Date(item.createdAt).toLocaleString() }}
          </li>
        </ul>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { fetchWithAuth } = useApi()
const { logout } = useAuth()

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
  try {
    history.value = await fetchWithAuth('/api/query/history')
  } catch {}
}

onMounted(() => {
  loadHistory()
})
</script>