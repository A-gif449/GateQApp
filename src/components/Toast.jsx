import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { CheckCircle2 } from 'lucide-react'
import { motionAllowed } from '../lib/motion.js'

export default function Toast({ message }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!motionAllowed() || !ref.current) return
    const tween = gsap.fromTo(
      ref.current,
      { x: 40, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.6)' },
    )
    return () => tween.kill()
  }, [])

  return (
    <div className="toast" role="status" ref={ref}>
      <CheckCircle2 size={18} aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}
