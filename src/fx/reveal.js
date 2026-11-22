import { gsap } from 'gsap'
import { motionAllowed } from '../lib/motion.js'

// Elements that fade and rise into view as they scroll on screen.
const TARGETS = '.panel, .kpi, .rail-card, .playlist-card, .podium-card, .profile-hero, .cta-band, .marquee'

// Scroll reveal: watches the page (including content added when the route changes)
// and eases each matching element in the first time it becomes visible.
export function initReveal() {
  if (!motionAllowed() || typeof IntersectionObserver === 'undefined' || typeof MutationObserver === 'undefined') return

  const prepared = new WeakSet()

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        io.unobserve(entry.target)
        gsap.to(entry.target, {
          y: 0,
          opacity: 1,
          duration: 0.75,
          ease: 'power3.out',
          delay: Number(entry.target.dataset.rvDelay || 0),
          clearProps: 'transform,opacity',
        })
      }
    },
    { threshold: 0.06, rootMargin: '0px 0px -5% 0px' },
  )

  function prepare(el) {
    if (prepared.has(el)) return
    prepared.add(el)
    const index = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0
    el.dataset.rvDelay = String(Math.min(Math.max(index, 0), 6) * 0.06)
    gsap.set(el, { opacity: 0, y: 28 })
    io.observe(el)
  }

  function scan(node) {
    if (node.nodeType !== 1) return
    if (node.matches(TARGETS)) prepare(node)
    node.querySelectorAll(TARGETS).forEach(prepare)
  }

  scan(document.body)
  new MutationObserver((mutations) => {
    for (const m of mutations) m.addedNodes.forEach(scan)
  }).observe(document.body, { childList: true, subtree: true })
}

// A thin gradient line at the top of the window that fills as you scroll down the page.
export function initScrollProgress() {
  if (typeof document === 'undefined') return
  const bar = document.createElement('div')
  bar.className = 'scroll-progress'
  bar.setAttribute('aria-hidden', 'true')
  document.body.appendChild(bar)
  const set = gsap.quickSetter(bar, 'scaleX')
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    set(max > 0 ? Math.min(1, window.scrollY / max) : 0)
  }
  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update)
  update()
}
