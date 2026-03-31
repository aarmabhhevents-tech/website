export function getAdminToken() {
  return localStorage.getItem('admin_token') || ''
}

export async function apiFetch(path, options = {}) {
  const token = getAdminToken()
  const headers = new Headers(options.headers || {})
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (options.body) headers.set('Content-Type', 'application/json')

  const res = await fetch(path, { ...options, headers })

  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => '')

  if (!res.ok) {
    const msg =
      (body && typeof body === 'object' && (body.error || body.message)) ||
      (typeof body === 'string' && body) ||
      `Request failed (${res.status})`
    throw new Error(msg)
  }

  return body
}

