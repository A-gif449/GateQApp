import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { motionAllowed } from '../lib/motion.js'

// Up/down vote control. layout="vertical" sits beside questions and answers,
// layout="horizontal" beside comments. The score takes the colour of the active vote.
export default function VoteControl({ score, myVote, onVote, layout = 'vertical', label }) {
  const scoreRef = useRef(null)
  const previous = useRef(score)

  useEffect(() => {
    if (previous.current === score) return
    const direction = score > previous.current ? 1 : -1
    previous.current = score
    if (motionAllowed() && scoreRef.current) {
      gsap.fromTo(scoreRef.current, { y: direction * 6, opacity: 0.3 }, { y: 0, opacity: 1, duration: 0.25, ease: 'power2.out' })
    }
  }, [score])

  function press(el) {
    if (motionAllowed() && el) gsap.fromTo(el, { scale: 0.88 }, { scale: 1, duration: 0.2, ease: 'power2.out' })
  }

  const size = layout === 'vertical' ? 20 : 16
  const state = myVote === 1 ? ' up-active' : myVote === -1 ? ' down-active' : ''

  return (
    <div className={`vote ${layout}${state}`} role="group" aria-label={`Votes for ${label}`}>
      <button
        type="button"
        className={`vote-btn up${myVote === 1 ? ' on-up' : ''}`}
        aria-label={`Upvote ${label}`}
        aria-pressed={myVote === 1}
        title="Upvote: this is useful"
        onClick={(e) => {
          onVote(1)
          press(e.currentTarget)
        }}
      >
        <ChevronUp size={size} strokeWidth={2.5} aria-hidden="true" />
      </button>
      <span className="vote-score" ref={scoreRef} data-testid="vote-score" aria-live="polite">
        {score}
      </span>
      <button
        type="button"
        className={`vote-btn down${myVote === -1 ? ' on-down' : ''}`}
        aria-label={`Downvote ${label}`}
        aria-pressed={myVote === -1}
        title="Downvote: this is not useful"
        onClick={(e) => {
          onVote(-1)
          press(e.currentTarget)
        }}
      >
        <ChevronDown size={size} strokeWidth={2.5} aria-hidden="true" />
      </button>
    </div>
  )
}
