import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { motionAllowed } from '../lib/motion.js'

// Animated aurora behind the page. The blobs drift on their own and the whole field
// shifts slightly with the pointer, which gives the page depth.
export default function Background() {
  const fieldRef = useRef(null)

  useEffect(() => {
    if (!motionAllowed() || !fieldRef.current) return
    const blobs = [...fieldRef.current.querySelectorAll('.aurora-blob')]
    const drift = blobs.map((blob, i) =>
      gsap.to(blob, {
        x: 'random(-140, 140)',
        y: 'random(-90, 90)',
        scale: 'random(0.9, 1.15)',
        duration: 12 + i * 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      }),
    )

    const setX = gsap.quickTo(fieldRef.current, 'x', { duration: 1.6, ease: 'power3.out' })
    const setY = gsap.quickTo(fieldRef.current, 'y', { duration: 1.6, ease: 'power3.out' })
    const onMove = (e) => {
      setX(-(e.clientX / window.innerWidth - 0.5) * 40)
      setY(-(e.clientY / window.innerHeight - 0.5) * 30)
    }
    window.addEventListener('pointermove', onMove)

    return () => {
      window.removeEventListener('pointermove', onMove)
      drift.forEach((t) => t.kill())
    }
  }, [])

  return (
    <div className="aurora" aria-hidden="true">
      <div className="aurora-field" ref={fieldRef}>
        <span className="aurora-blob" />
        <span className="aurora-blob" />
        <span className="aurora-blob" />
      </div>
    </div>
  )
}
