<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow p-4 flex justify-between items-center">
      <h1 class="text-xl font-bold">Личный кабинет</h1>
      <div>
        <NuxtLink to="/" class="text-blue-600 hover:underline mr-4">На главную</NuxtLink>
        <button @click="logout" class="text-red-600 hover:underline">Выйти</button>
      </div>
    </header>
    <main class="container mx-auto p-4 max-w-4xl">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Предпочтения -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-lg font-semibold mb-4">Интересующие акции</h2>
          <div class="flex flex-wrap gap-2 mb-4">
            <span v-for="ticker in tickers" :key="ticker"
              class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              {{ ticker }}
              <button @click="removeTicker(ticker)" class="ml-1 text-red-600 font-bold">&times;</button>
            </span>
          </div>
          <div class="flex">
            <input v-model="newTicker" placeholder="Тикер (например, GAZP)"
              class="flex-1 border border-gray-300 rounded-l px-3 py-2 focus:ring-2 focus:ring-blue-300" />
            <button @click="addTicker" class="bg-blue-600 text-white px-4 rounded-r">Добавить</button>
          </div>
          <button @click="savePreferences"
            class="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Сохранить
          </button>
        </div>

        <!-- История запросов -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-lg font-semibold mb-4">История запросов</h2>
          <div class="space-y-4 max-h-96 overflow-y-auto">
            <div v-for="item in history" :key="item.id" class="border-b pb-2">
              <p class="text-sm font-medium">{{ item.text }}</p>
              <p class="text-xs text-gray-500">{{ new Date(item.createdAt).toLocaleString() }}</p>
              <p class="text-sm text-gray-700 truncate">{{ item.response?.substring(0, 100) }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { fetchWithAuth } = useApi()
const { logout } = useAuth()

const tickers = ref<string[]>([])
const newTicker = ref('')
const history = ref<any[]>([])

const loadPreferences = async () => {
  try {
    tickers.value = await fetchWithAuth('/api/user/preferences')
  } catch {}
}

const loadHistory = async () => {
  try {
    history.value = await fetchWithAuth('/api/query/history')
  } catch {}
}

const addTicker = () => {
  if (newTicker.value && !tickers.value.includes(newTicker.value.toUpperCase())) {
    tickers.value.push(newTicker.value.toUpperCase())
    newTicker.value = ''
  }
}

const removeTicker = (ticker: string) => {
  tickers.value = tickers.value.filter((t) => t !== ticker)
}

const savePreferences = async () => {
  try {
    await fetchWithAuth('/api/user/preferences', {
      method: 'PUT',
      body: { tickers: tickers.value },
    })
    alert('Предпочтения сохранены')
  } catch {
    alert('Ошибка сохранения')
  }
}

onMounted(() => {
  loadPreferences()
  loadHistory()
})
</script>