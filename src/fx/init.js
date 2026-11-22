import { gsap } from 'gsap'
import { motionAllowed } from '../lib/motion.js'
import { initReveal, initScrollProgress } from './reveal.js'

// Global mouse effects, attached once at startup:
// - magnetic pull on primary buttons and icon buttons
// - a ripple wherever a button is pressed
export function initFx() {
  if (!motionAllowed()) return

  initScrollProgress()
  initReveal()

  const MAGNETIC = '.btn-primary, .icon-btn, .page-btn'
  let current = null

  function reset(el) {
    gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' })
  }

  document.addEventListener('pointermove', (e) => {
    const el = e.target instanceof Element ? e.target.closest(MAGNETIC) : null
    if (current && current !== el) {
      reset(current)
      current = null
    }
    if (!el || el.disabled) return
    current = el
    const r = el.getBoundingClientRect()
    gsap.to(el, {
      x: (e.clientX - (r.left + r.width / 2)) * 0.25,
      y: (e.clientY - (r.top + r.height / 2)) * 0.3,
      duration: 0.4,
      ease: 'power3.out',
    })
  })

  document.addEventListener('pointerdown', (e) => {
    const el = e.target instanceof Element ? e.target.closest('.btn, .icon-btn, .vote-btn, .page-btn') : null
    if (!el) return
    const r = el.getBoundingClientRect()
    const dot = document.createElement('span')
    dot.className = 'ripple'
    dot.style.left = `${e.clientX - r.left}px`
    dot.style.top = `${e.clientY - r.top}px`
    el.appendChild(dot)
    gsap.fromTo(
      dot,
      { scale: 0, opacity: 0.35 },
      { scale: 1, opacity: 0, duration: 0.7, ease: 'power2.out', onComplete: () => dot.remove() },
    )
  })
}
