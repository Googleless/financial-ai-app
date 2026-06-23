<template>
  <div class="min-h-screen flex flex-col bg-bg-light font-sans">
    <!-- Шапка -->
    <header class="bg-primary py-4 shadow-md">
      <div class="text-center">
        <h1 class="text-3xl font-medium text-white tracking-tight lowercase">finassist</h1>
        <p class="text-sm font-light text-white mt-1">Ваш финансовый помощник</p>
      </div>
    </header>

    <!-- Карточка -->
    <div class="flex-1 flex items-center justify-center p-4">
      <div class="bg-white shadow-card-elevated w-full max-w-[578px] min-h-[578px] rounded-[50px] overflow-hidden flex flex-col">
        <!-- Зелёная верхняя панель с вкладками -->
        <div class="bg-primary h-[115px] flex items-center justify-center px-6">
          <div class="bg-primary rounded-full flex w-full max-w-[400px]">
            <button
              @click="switchMode('register')"
              class="flex-1 py-3 text-center font-medium transition-colors duration-200 rounded-full"
              :class="mode === 'register'
                ? 'bg-white text-primary shadow-md'
                : 'bg-transparent text-white/60'"
            >
              Регистрация
            </button>
            <button
              @click="switchMode('login')"
              class="flex-1 py-3 text-center font-medium transition-colors duration-200 rounded-full"
              :class="mode === 'login'
                ? 'bg-white text-primary shadow-md'
                : 'bg-transparent text-white/60'"
            >
              Логин
            </button>
          </div>
        </div>

        <!-- Форма с анимацией -->
        <div class="flex-1 flex flex-col p-6 overflow-hidden">
          <Transition :name="transitionName" mode="out-in">
            <form @submit.prevent="handleSubmit" class="flex flex-col flex-1" :key="mode">
              <div class="space-y-6 flex-1">
                <!-- Email -->
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                  <input
                    v-model="email"
                    type="email"
                    required
                    class="w-full h-[56px] pl-10 pr-4 rounded-full border border-gray-300 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder=" "
                  />
                </div>

                <!-- Пароль -->
                <input
                  v-model="password"
                  type="password"
                  required
                  class="w-full h-[56px] px-6 rounded-full border border-gray-300 bg-white shadow-inner placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Введите пароль"
                />

                <!-- Повтор пароля (регистрация) -->
                <Transition name="fade">
                  <input
                    v-if="mode === 'register'"
                    v-model="passwordConfirm"
                    type="password"
                    required
                    class="w-full h-[56px] px-6 rounded-full border border-gray-300 bg-white shadow-inner placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Повторите пароль"
                  />
                </Transition>

                <p v-if="error" class="text-red-600 text-sm text-center">{{ error }}</p>
              </div>

              <button
                type="submit"
                class="w-full h-[56px] bg-primary text-white font-medium rounded-full shadow-card hover:bg-primary/90 transition-colors mt-auto mb-3"
              >
                {{ mode === 'register' ? 'Создать аккаунт' : 'Войти в аккаунт' }}
              </button>
            </form>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { login, register, isAuthenticated } = useAuth()
const router = useRouter()

const mode = ref<'login' | 'register'>('register')
const transitionName = ref('slide-right')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const error = ref('')

if (isAuthenticated.value) {
  router.push('/')
}

const switchMode = (newMode: 'login' | 'register') => {
  if (newMode === mode.value) return
  transitionName.value = newMode === 'register' ? 'slide-left' : 'slide-right'
  mode.value = newMode
}

const handleSubmit = async () => {
  error.value = ''

  if (mode.value === 'register') {
    if (password.value !== passwordConfirm.value) {
      error.value = 'Пароли не совпадают'
      return
    }
    try {
      await register(email.value, password.value)
      router.push('/')
    } catch (err: any) {
      error.value = err?.data?.message || 'Ошибка регистрации'
    }
  } else {
    try {
      await login(email.value, password.value)
      router.push('/')
    } catch (err: any) {
      error.value = err?.data?.message || 'Неверные учетные данные'
    }
  }
}
</script>

<style>
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.35s ease, opacity 0.35s ease;
}
.slide-left-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-left-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
.slide-right-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-right-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>