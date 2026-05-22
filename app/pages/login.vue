<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
      <h1 class="text-2xl font-bold mb-6 text-center">Вход / Регистрация</h1>
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input v-model="email" type="email" required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">Пароль</label>
          <input v-model="password" type="password" required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div class="flex space-x-4 mb-4">
          <button type="submit" name="action" value="login"
            class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition">
            Войти
          </button>
          <button type="submit" name="action" value="register"
            class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition">
            Регистрация
          </button>
        </div>
        <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const { login, register, isAuthenticated } = useAuth()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')

if (isAuthenticated.value) {
  router.push('/')
}

const handleSubmit = async (e: any) => {
  e.preventDefault()
  error.value = ''
  const action = e.submitter?.value
  if (!action) return
  try {
    if (action === 'login') {
      await login(email.value, password.value)
    } else {
      await register(email.value, password.value)
    }
    router.push('/')
  } catch (err: any) {
    error.value = err?.data?.message || 'Ошибка'
  }
}
</script>