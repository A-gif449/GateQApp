// Clerk is switched on by setting VITE_CLERK_PUBLISHABLE_KEY (see .env.example).
// Without a key the app falls back to the original display-name demo sign-in,
// so the project and its tests still run with no setup.
export const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || ''
export const AUTH_ENABLED = Boolean(CLERK_KEY)

// Absolute URL for one of the app's hash routes, e.g. appUrl('/questions').
// Clerk needs absolute URLs for redirects; this app routes with the URL hash.
export function appUrl(path = '/') {
  return `${window.location.origin}${window.location.pathname}#${path}`
}

// Absolute URL for a Clerk page: 'sign-in', 'sign-up' or 'account'.
export function authUrl(page) {
  return `${window.location.origin}${window.location.pathname}?auth=${page}#/`
}

const RETURN_KEY = 'gateq-return-to'

// Remember where the visitor was so sign-in can send them back there.
export function rememberReturnTo() {
  try {
    if (new URLSearchParams(window.location.search).has('auth')) return
    sessionStorage.setItem(RETURN_KEY, window.location.hash.replace(/^#/, '') || '/')
  } catch {
    /* storage unavailable; sign-in will land on the home page */
  }
}

export function afterAuthUrl() {
  try {
    return appUrl(sessionStorage.getItem(RETURN_KEY) || '/')
  } catch {
    return appUrl('/')
  }
}

export function clearReturnTo() {
  try {
    sessionStorage.removeItem(RETURN_KEY)
  } catch {
    /* ignore */
  }
}
