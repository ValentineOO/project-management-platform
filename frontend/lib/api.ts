import axios from 'axios'

const api = axios.create({
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// Serialise concurrent CSRF initialisations into one request
let csrfPromise: Promise<void> | null = null

export async function initCsrf(): Promise<void> {
  if (!csrfPromise) {
    csrfPromise = axios
      .get('/sanctum/csrf-cookie', { withCredentials: true })
      .then(() => void 0)
      .catch((err) => {
        csrfPromise = null
        throw err
      })
  }
  return csrfPromise
}

export function resetCsrf(): void {
  csrfPromise = null
}

api.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase() ?? ''
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    await initCsrf()
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 419) {
      resetCsrf()
      await initCsrf()
      return api.request(error.config)
    }
    return Promise.reject(error)
  }
)

export default api
