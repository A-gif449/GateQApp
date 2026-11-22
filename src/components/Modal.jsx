import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { X } from 'lucide-react'
import { motionAllowed } from '../lib/motion.js'

export default function Modal({ title, onClose, children }) {
  const panelRef = useRef(null)

  // Close on Escape.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Entrance animation.
  useEffect(() => {
    if (!motionAllowed() || !panelRef.current) return
    const tween = gsap.fromTo(
      panelRef.current,
      { y: 20, opacity: 0, scale: 0.97 },
      { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' },
    )
    return () => tween.kill()
  }, [])

  return (
    <div
      className="overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={panelRef}>
        <div className="modal-head">
          <h2 id="modal-title">{title}</h2>
          <button type="button" className="icon-btn" aria-label="Close dialog" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
