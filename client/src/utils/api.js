import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
})

// Endpoints where a 401 is the expected answer to bad input, not a signal that
// the session died. Redirecting on these reloaded the page and wiped the form.
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register']

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

function normaliseError(err) {
  if (!err.response) {
    // Timeout, offline, or DNS failure — there is no server message to show.
    const offline = typeof navigator !== 'undefined' && !navigator.onLine
    err.userMessage = offline
      ? 'You appear to be offline. Check your connection and try again.'
      : "Couldn't reach the server. Please try again."
    return err
  }

  err.userMessage =
    err.response.data?.error ||
    (err.response.status === 500
      ? 'Something went wrong on our end. Please try again.'
      : `Request failed (${err.response.status}).`)
  return err
}

// Handle 401 globally, but only for genuinely expired/invalid sessions.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    const url = err.config?.url || ''
    const isAuthFlow = AUTH_ENDPOINTS.some((path) => url.includes(path))

    if (status === 401 && !isAuthFlow) {
      localStorage.removeItem('wc_token')
      // AuthContext listens for this and clears the user, which lets React Router
      // redirect in-app — no window.location assignment, so no full page reload.
      window.dispatchEvent(new Event('wc:unauthorised'))
    }

    return Promise.reject(normaliseError(err))
  }
)

export default api
