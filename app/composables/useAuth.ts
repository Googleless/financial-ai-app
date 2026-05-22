import { ref, computed } from 'vue'

interface User {
  id: number
  email: string
}

interface AuthResponse {
  token: string
  user: User
}

const token = ref<string | null>(process.client ? localStorage.getItem('token') : null)
const user = ref<User | null>(process.client ? JSON.parse(localStorage.getItem('user') || 'null') : null)

export const useAuth = () => {
  const isAuthenticated = computed(() => !!token.value)

  const login = async (email: string, password: string) => {
    const data = await $fetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    token.value = data.token
    user.value = data.user
    if (process.client) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
  }

  const register = async (email: string, password: string) => {
    const data = await $fetch<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: { email, password },
    })
    token.value = data.token
    user.value = data.user
    if (process.client) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    if (process.client) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    navigateTo('/login')
  }

  return { token, user, isAuthenticated, login, register, logout }
}