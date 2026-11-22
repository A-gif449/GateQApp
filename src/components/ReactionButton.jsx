import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { REACTIONS } from '../lib/store.js'
import { motionAllowed } from '../lib/motion.js'

// Like button with a reaction picker. Hover (or focus) opens the picker,
// clicking the main button gives a Like, and clicking the same reaction again removes it.
export default function ReactionButton({ reactions = {}, user, onReact, label }) {
  const [open, setOpen] = useState(false)
  const barRef = useRef(null)
  const timer = useRef(null)

  const mine = user ? reactions[user.name] : undefined
  const mineInfo = REACTIONS.find((r) => r.id === mine)

  const counts = {}
  for (const type of Object.values(reactions)) counts[type] = (counts[type] || 0) + 1
  const total = Object.values(reactions).length
  const top = REACTIONS.filter((r) => counts[r.id]).sort((a, b) => counts[b.id] - counts[a.id]).slice(0, 3)

  useEffect(() => {
    if (open && motionAllowed() && barRef.current) {
      gsap.fromTo(
        barRef.current.children,
        { y: 14, scale: 0.4, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.4, stagger: 0.04, ease: 'back.out(2.2)' },
      )
    }
  }, [open])

  useEffect(() => () => clearTimeout(timer.current), [])

  function show() {
    clearTimeout(timer.current)
    setOpen(true)
  }

  function hideSoon() {
    timer.current = setTimeout(() => setOpen(false), 350)
  }

  function pick(type) {
    setOpen(false)
    onReact(type)
  }

  return (
    <div className="react" onMouseEnter={show} onMouseLeave={hideSoon} onFocus={show} onBlur={hideSoon}>
      {open && (
        <div className="react-bar" role="menu" aria-label={`React to ${label}`} ref={barRef}>
          {REACTIONS.map((r) => (
            <button
              key={r.id}
              type="button"
              role="menuitem"
              className={`react-pick${mine === r.id ? ' on' : ''}`}
              aria-label={r.label}
              title={r.label}
              onClick={() => pick(r.id)}
            >
              <span aria-hidden="true">{r.emoji}</span>
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        className={`react-btn${mineInfo ? ' on' : ''}`}
        aria-label={`React to ${label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setOpen(false)
          onReact('like')
        }}
      >
        <span aria-hidden="true">{mineInfo ? mineInfo.emoji : '👍'}</span>
        <span>{mineInfo ? mineInfo.label : 'Like'}</span>
      </button>

      {total > 0 && (
        <span className="react-summary" data-testid="react-summary">
          {top.map((r) => (
            <span key={r.id} aria-hidden="true">
              {r.emoji}
            </span>
          ))}
          <span>{total}</span>
        </span>
      )}
    </div>
  )
}
