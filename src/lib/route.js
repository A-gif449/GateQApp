import { useEffect, useState } from 'react'

// Hash routes: #/ (home), #/questions, #/learn, #/ask, #/q/<id>, #/u/<name>, #/dashboard, #/leaderboard.
//
// Clerk pages (sign-in, sign-up, account) live at ?auth=<page>#/ instead of in the hash, because
// Clerk's embedded components use the hash for their own steps (#/factor-one, #/verify-email-address).
const AUTH_PAGES = ['sign-in', 'sign-up', 'account']
const ROUTE_EVENT = 'gateq-route'

// Route names that only exist when Clerk is configured.
export const AUTH_ROUTES = new Set(AUTH_PAGES)

const APP_PATH = /^\/(questions|learn|ask|import|dashboard|leaderboard|q\/|u\/)/

function authPageParam() {
  const page = new URLSearchParams(window.location.search).get('auth')
  return AUTH_PAGES.includes(page) ? page : null
}

function currentHashPath() {
  return window.location.hash.replace(/^#/, '') || '/'
}

function parseRoute() {
  const path = currentHashPath()
  const authPage = authPageParam()
  // On an auth page, only a real app route in the hash leaves it. Anything else is Clerk's own step.
  if (authPage && !APP_PATH.test(path)) return { name: authPage }
  if (path.startsWith('/q/')) return { name: 'question', id: path.slice(3) }
  if (path.startsWith('/u/')) return { name: 'profile', id: safeDecode(path.slice(3)) }
  if (path === '/questions') return { name: 'list' }
  if (path === '/learn') return { name: 'learn' }
  if (path === '/ask') return { name: 'ask' }
  if (path === '/import') return { name: 'import' }
  if (path === '/dashboard') return { name: 'dashboard' }
  if (path === '/leaderboard') return { name: 'leaderboard' }
  return { name: 'home' }
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function notify() {
  window.dispatchEvent(new Event(ROUTE_EVENT))
}

// Drop ?auth=... from the address bar once the visitor moves to a normal page.
function leaveAuthPage(path) {
  window.history.pushState(null, '', `${window.location.pathname}#${path}`)
  notify()
}

export function useRoute() {
  const [route, setRoute] = useState(parseRoute)
  useEffect(() => {
    const onChange = () => setRoute(parseRoute())
    // A link such as <a href="#/questions"> clicked on an auth page keeps ?auth=... in the URL.
    // Clean that up so the app page shows. Clicks inside Clerk's own cards are left alone.
    const onClick = (e) => {
      const link = e.target instanceof Element ? e.target.closest('a[href^="#/"]') : null
      if (!link || e.defaultPrevented || !authPageParam() || link.closest('[data-clerk-component]')) return
      e.preventDefault()
      leaveAuthPage(link.getAttribute('href').slice(1))
    }
    window.addEventListener('hashchange', onChange)
    window.addEventListener('popstate', onChange)
    window.addEventListener(ROUTE_EVENT, onChange)
    document.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('hashchange', onChange)
      window.removeEventListener('popstate', onChange)
      window.removeEventListener(ROUTE_EVENT, onChange)
      document.removeEventListener('click', onClick)
    }
  }, [])
  return route
}

export function navigate(path) {
  if (authPageParam()) leaveAuthPage(path)
  else window.location.hash = path
}

// Open one of the Clerk pages: sign-in, sign-up or account.
export function openAuthPage(page) {
  window.history.pushState(null, '', `${window.location.pathname}?auth=${page}#/`)
  notify()
}

export function onAuthPage() {
  return authPageParam() !== null
}

export function profileHref(name) {
  return `#/u/${encodeURIComponent(name)}`
}
