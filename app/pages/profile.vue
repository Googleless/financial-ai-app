<template>
  <div class="min-h-screen flex flex-col bg-bg-light font-sans">
    <!-- Шапка -->
    <header class="bg-primary py-4 shadow-md flex justify-between items-center px-6">
      <div>
        <h1 class="text-2xl font-medium text-white lowercase">finassist</h1>
        <p class="text-xs font-light text-white">Ваш финансовый помощник</p>
      </div>
      <div class="flex items-center gap-4">
        <NuxtLink to="/" class="text-white/80 hover:text-white transition">На главную</NuxtLink>
        <button @click="logout" class="text-white/80 hover:text-white transition">Выйти</button>
      </div>
    </header>

    <!-- Основной контент -->
    <div class="flex-1 flex p-6 gap-6">
      <!-- Боковое меню -->
      <aside class="w-64 bg-light-green rounded-[30px] p-4 shadow-card flex flex-col gap-3">
        <button
          @click="currentTab = 'profile'"
          class="flex items-center gap-3 px-5 py-3 rounded-full transition-colors duration-200"
          :class="currentTab === 'profile' ? 'bg-primary text-white shadow' : 'bg-white text-gray-800'"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span class="font-medium">Профиль</span>
        </button>
        <button
          @click="currentTab = 'settings'"
          class="flex items-center gap-3 px-5 py-3 rounded-full transition-colors duration-200"
          :class="currentTab === 'settings' ? 'bg-primary text-white shadow' : 'bg-white text-gray-800'"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <span class="font-medium">Настройки</span>
        </button>
        <button
          @click="currentTab = 'support'"
          class="flex items-center gap-3 px-5 py-3 rounded-full transition-colors duration-200"
          :class="currentTab === 'support' ? 'bg-primary text-white shadow' : 'bg-white text-gray-800'"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span class="font-medium">Поддержка</span>
        </button>
      </aside>

      <!-- Панель контента -->
      <main class="flex-1 bg-light-green rounded-[30px] p-8 shadow-card">

        <!-- Профиль -->
        <div v-if="currentTab === 'profile'">
          <h2 class="text-3xl font-semibold text-gray-800 text-center mb-8">Информация об аккаунте</h2>
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <p class="text-lg"><span class="font-medium">Почтовый ящик:</span> {{ userData?.email || '—' }}</p>
            </div>
            <div class="flex items-center justify-between">
              <p class="text-lg"><span class="font-medium">Пароль:</span> ********</p>
            </div>
            <p class="text-lg"><span class="font-medium">Количество запросов:</span> {{ userData?.queryCount ?? 0 }}</p>
          </div>

          <div class="mt-10">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-semibold text-gray-800">История запросов</h3>
              <div class="flex gap-2">
                <button @click="clearHistory" class="text-red-600 hover:underline text-sm">Очистить историю</button>
                <button @click="loadHistory" class="text-primary hover:underline text-sm">Обновить</button>
              </div>
            </div>
            <div class="space-y-3 max-h-96 overflow-y-auto">
              <div v-for="item in history" :key="item.id" class="bg-white rounded-2xl p-4 shadow-sm">
                <p class="text-sm font-medium">{{ item.text }}</p>
                <p class="text-xs text-gray-500">{{ new Date(item.createdAt).toLocaleString() }}</p>
                <p class="text-sm text-gray-700 truncate">{{ item.response?.substring(0, 100) }}</p>
              </div>
              <p v-if="history.length === 0" class="text-gray-500 text-center py-4">История пока пуста</p>
            </div>
          </div>

          <div class="flex justify-between mt-10">
            <button class="px-8 py-3 rounded-full bg-danger text-white font-medium shadow hover:bg-danger/90 transition-colors">
              Удалить аккаунт
            </button>
            <button @click="logout" class="px-8 py-3 rounded-full bg-primary text-white font-medium shadow hover:bg-primary/90 transition-colors">
              Выйти из аккаунта
            </button>
          </div>
        </div>

        <!-- Настройки -->
        <div v-if="currentTab === 'settings'">
          <h2 class="text-3xl font-semibold text-gray-800 text-center mb-8">Настройки</h2>
          <div class="max-w-md mx-auto space-y-6">
            <!-- Смена email -->
            <div>
              <h3 class="text-xl font-medium mb-3">Изменить email</h3>
              <div class="space-y-3">
                <input v-model="emailForm.currentPassword" type="password" class="w-full h-[48px] px-4 rounded-full border border-gray-300 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Текущий пароль" />
                <input v-model="emailForm.newEmail" type="email" class="w-full h-[48px] px-4 rounded-full border border-gray-300 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Новый email" />
                <button @click="changeEmail" class="w-full h-[48px] bg-primary text-white font-medium rounded-full shadow-card hover:bg-primary/90 transition-colors">
                  Сохранить email
                </button>
              </div>
              <p v-if="emailMessage" class="text-sm mt-2" :class="emailError ? 'text-red-600' : 'text-green-600'">{{ emailMessage }}</p>
            </div>

            <!-- Смена пароля -->
            <div>
              <h3 class="text-xl font-medium mb-3">Изменить пароль</h3>
              <div class="space-y-3">
                <input v-model="passwordForm.currentPassword" type="password" class="w-full h-[48px] px-4 rounded-full border border-gray-300 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Текущий пароль" />
                <input v-model="passwordForm.newPassword" type="password" class="w-full h-[48px] px-4 rounded-full border border-gray-300 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Новый пароль" />
                <input v-model="passwordForm.confirmNewPassword" type="password" class="w-full h-[48px] px-4 rounded-full border border-gray-300 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Повторите новый пароль" />
                <button @click="changePassword" class="w-full h-[48px] bg-primary text-white font-medium rounded-full shadow-card hover:bg-primary/90 transition-colors">
                  Сменить пароль
                </button>
              </div>
              <p v-if="passwordMessage" class="text-sm mt-2" :class="passwordError ? 'text-red-600' : 'text-green-600'">{{ passwordMessage }}</p>
            </div>

            <!-- Выбор источников новостей -->
            <div>
              <h3 class="text-xl font-medium mb-3">Источники новостей</h3>
              <p class="text-sm text-gray-600 mb-3">Выберите желаемые источники для поиска новостей</p>
              <div class="space-y-2">
                <label v-for="source in availableSources" :key="source.value" class="flex items-center gap-2">
                  <input type="checkbox" :value="source.value" v-model="selectedSources" class="rounded" />
                  <span>{{ source.label }}</span>
                </label>
              </div>
              <button @click="saveSources" class="mt-3 w-full h-[48px] bg-primary text-white font-medium rounded-full shadow-card hover:bg-primary/90 transition-colors">
                Сохранить источники
              </button>
              <p v-if="sourcesMessage" class="text-sm mt-2 text-green-600">{{ sourcesMessage }}</p>
            </div>
          </div>
        </div>

        <!-- Поддержка -->
        <div v-if="currentTab === 'support'">
          <h2 class="text-3xl font-semibold text-gray-800 text-center mb-8">Поддержка</h2>
          <div class="max-w-md mx-auto text-gray-700 space-y-4">
            <p>Если у вас возникли вопросы или проблемы, свяжитесь с нами:</p>
            <p><span class="font-medium">Email:</span> support@finassist.ru</p>
            <p><span class="font-medium">Max:</span> @finassist_support</p>
            <p class="text-sm text-gray-500 mt-8">Время работы: Пн–Пт, 09:00–18:00 МСК</p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { logout } = useAuth()
const { fetchWithAuth } = useApi()

const currentTab = ref('profile')
const userData = ref<{ email: string; queryCount: number } | null>(null)
const history = ref<any[]>([])

const emailForm = ref({ currentPassword: '', newEmail: '' })
const emailMessage = ref('')
const emailError = ref(false)

const passwordForm = ref({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
const passwordMessage = ref('')
const passwordError = ref(false)

// Источники
const availableSources = [
  { label: 'Коммерсантъ', value: 'kommersant' },
  { label: 'ТАСС', value: 'tass' },
  { label: 'Лента.ру', value: 'lenta' },
  { label: 'GNews', value: 'gnews' },
];
const selectedSources = ref<string[]>([]);
const sourcesMessage = ref('');

const loadProfile = async () => {
  try {
    userData.value = await fetchWithAuth('/api/user/profile');
  } catch { userData.value = null; }
};
const loadHistory = async () => {
  try {
    history.value = await fetchWithAuth('/api/query/history');
  } catch { history.value = []; }
};

const loadSources = async () => {
  try {
    selectedSources.value = await fetchWithAuth('/api/user/sources');
  } catch { selectedSources.value = []; }
};

const clearHistory = async () => {
  try {
    await fetchWithAuth('/api/query/history', { method: 'DELETE' });
    history.value = [];
  } catch { alert('Ошибка при очистке истории'); }
};

const changeEmail = async () => {
  emailError.value = false;
  if (!emailForm.value.currentPassword || !emailForm.value.newEmail) {
    emailError.value = true;
    emailMessage.value = 'Заполните все поля';
    return;
  }
  try {
    await fetchWithAuth('/api/user/email', {
      method: 'PUT',
      body: emailForm.value,
    });
    emailError.value = false;
    emailMessage.value = 'Email успешно изменён';
    await loadProfile(); // обновить отображаемый email
  } catch (err: any) {
    emailError.value = true;
    emailMessage.value = err?.data?.message || 'Ошибка смены email';
  }
};

const changePassword = async () => {
  passwordError.value = false;
  if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword || !passwordForm.value.confirmNewPassword) {
    passwordError.value = true;
    passwordMessage.value = 'Заполните все поля';
    return;
  }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmNewPassword) {
    passwordError.value = true;
    passwordMessage.value = 'Новые пароли не совпадают';
    return;
  }
  passwordError.value = false;
  passwordMessage.value = 'Функция смены пароля появится в ближайшее время';
};

const saveSources = async () => {
  try {
    await fetchWithAuth('/api/user/sources', {
      method: 'PUT',
      body: { sources: selectedSources.value },
    });
    sourcesMessage.value = 'Источники сохранены';
    setTimeout(() => { sourcesMessage.value = ''; }, 3000);
  } catch { sourcesMessage.value = 'Ошибка сохранения'; }
};

onMounted(() => {
  loadProfile();
  loadHistory();
  loadSources();
});
</script>