// True when GSAP animations should run: the user has not asked for reduced motion.
export function motionAllowed() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
