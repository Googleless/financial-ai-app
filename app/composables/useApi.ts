export const useApi = () => {
  const { token } = useAuth()

  const fetchWithAuth = (url: string, options: any = {}) => {
    const headers = { ...options.headers }
    if (token.value) {
      headers['Authorization'] = `Bearer ${token.value}`
    }
    return $fetch(url, { ...options, headers })
  }

  return { fetchWithAuth }
}