import axios from 'axios'

export function createHttp(
  baseURL?: string,
  header = 'Authorization',
  getToken?: () => string | null,
) {
  const client = axios.create({ baseURL: baseURL ?? '' })
  client.interceptors.request.use((r) => {
    const t = getToken?.()
    if (t) r.headers[header] = `Bearer ${t}`
    return r
  })
  return client
}
