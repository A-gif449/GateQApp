import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { motionAllowed } from '../lib/motion.js'

const INTERACTIVE = 'a, button, select, input, textarea, .card-modern'

// A small dot that follows the pointer exactly, and a ring that trails behind it.
// The ring grows over interactive elements and shrinks when pressed.
export default function CursorFx() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring || !motionAllowed() || window.matchMedia('(pointer: coarse)').matches) return

    const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' })
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' })
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3.out' })
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3.out' })

    const onMove = (e) => {
      dotX(e.clientX)
      dotY(e.clientY)
      ringX(e.clientX)
      ringY(e.clientY)
    }
    const onOver = (e) => {
      if (e.target instanceof Element && e.target.closest(INTERACTIVE)) {
        gsap.to(ring, { scale: 1.8, duration: 0.3, ease: 'power2.out' })
      }
    }
    const onOut = (e) => {
      if (e.target instanceof Element && e.target.closest(INTERACTIVE)) {
        gsap.to(ring, { scale: 1, duration: 0.3, ease: 'power2.out' })
      }
    }
    const onDown = () => gsap.to(ring, { scale: 0.7, duration: 0.15 })
    const onUp = () => gsap.to(ring, { scale: 1, duration: 0.35, ease: 'elastic.out(1, 0.5)' })

    window.addEventListener('pointermove', onMove)
    document.addEventListener('pointerover', onOver)
    document.addEventListener('pointerout', onOut)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  return (
    <>
      <div className="cursor-ring" ref={ringRef} aria-hidden="true" />
      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />
    </>
  )
}
