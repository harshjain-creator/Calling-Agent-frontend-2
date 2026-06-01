/**
 * Fetch wrapper:
 *   - prefixes API_BASE
 *   - sends credentials (httpOnly cookies) on every request — backend reads
 *     `fristine_access` cookie set by /auth/login
 *   - on 401 → calls /auth/refresh (cookie-based), retries once
 *   - persists ONLY the user object (non-sensitive) in localStorage so SPA
 *     boots without flicker. Tokens never touch JS.
 *   - throws { status, body } on non-2xx
 */
import { API_BASE } from '@/config'

const USER_KEY = 'fristine.user'

export const tokenStore = {
  // Tokens live in httpOnly cookies — no JS access. Kept for API compatibility.
  get access()  { return '' },
  get refresh() { return '' },
  get user()    {
    try   { return JSON.parse(localStorage.getItem(USER_KEY) || 'null') }
    catch { return null }
  },
  save({ user }) {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  clear() { localStorage.removeItem(USER_KEY) },
}

let _refreshPromise = null

async function _doRefresh() {
  const r = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  })
  if (!r.ok) {
    tokenStore.clear()
    throw Object.assign(new Error('Refresh failed'), { status: r.status })
  }
  const data = await r.json()
  if (data.user) tokenStore.save({ user: data.user })
  return true
}

async function refreshAccessToken() {
  if (!_refreshPromise) {
    _refreshPromise = _doRefresh().finally(() => { _refreshPromise = null })
  }
  return _refreshPromise
}

export async function apiFetch(path, opts = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`
  const headers = new Headers(opts.headers || {})
  if (opts.body && !headers.has('Content-Type') && !(opts.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  const body = (typeof opts.body === 'object' && opts.body !== null && !(opts.body instanceof FormData))
    ? JSON.stringify(opts.body)
    : opts.body

  // credentials:'include' sends the httpOnly auth cookie cross-origin
  // (Render backend ↔ onslate.in frontend). Backend MUST set
  // Access-Control-Allow-Credentials: true AND mirror Origin (not '*').
  const fetchOpts = { ...opts, headers, body, credentials: 'include' }

  let res = await fetch(url, fetchOpts)
  if (res.status === 401 && !opts.skipAuth && !opts._retried) {
    try {
      await refreshAccessToken()
      res = await fetch(url, { ...fetchOpts, _retried: true })
    } catch {
      // fall through with original 401
    }
  }
  if (!res.ok) {
    let errBody = null
    try { errBody = await res.json() } catch { errBody = await res.text() }
    throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status, body: errBody })
  }
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return res.json()
  return res.text()
}
