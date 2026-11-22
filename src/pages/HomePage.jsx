import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import {
  ArrowRight,
  CheckCircle2,
  Flame,
  MessageSquare,
  MessagesSquare,
  PlayCircle,
  Sparkles,
  Target,
  Trophy,
  ChevronUp,
} from 'lucide-react'
import QuestionCard from '../components/QuestionCard.jsx'
import { motionAllowed } from '../lib/motion.js'

const HEADLINE = ['Learn', 'GATE', 'CSE', 'the', 'smart', 'way.']

const FEATURES = [
  {
    icon: MessagesSquare,
    title: 'Community Q&A',
    text: 'Ask with images, answer step by step, and discuss with comments and reactions.',
    href: '#/questions',
  },
  {
    icon: PlayCircle,
    title: 'Video playlists',
    text: 'Learn concepts from GO Classes and NPTEL playlists. Every video is credited to its channel.',
    href: '#/learn',
  },
  {
    icon: Target,
    title: 'PYQ-style practice',
    text: 'Original questions in the style of GATE CSE 2010 to 2016, generated in your browser. Mark them solved as you go.',
    href: '#/questions',
  },
  {
    icon: Trophy,
    title: 'Points and badges',
    text: 'Earn points for asking, answering and solving. Unlock badges and climb the leaderboard.',
    href: '#/leaderboard',
  },
]

// Shown in the hero preview when there are no questions yet.
const SAMPLE_PREVIEW = [
  { id: 's1', subject: 'Algorithms', title: 'How many comparisons does merge sort need in the worst case?', votes: 24, answers: 3 },
  { id: 's2', subject: 'Data Structures', title: 'Height of a BST built from a sorted sequence?', votes: 17, answers: 2 },
  { id: 's3', subject: 'Operating Systems', title: 'When can a set of processes deadlock?', votes: 12, answers: 4 },
]

// Homepage: the first screen new visitors see. Animations run only when motion is allowed.
export default function HomePage({ stats, subjects, topQuestions, onSubject }) {
  const root = useRef(null)

  useEffect(() => {
    if (!motionAllowed() || !root.current) return undefined
    const ctx = gsap.context(() => {
      gsap.from('.home-word', { yPercent: 110, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.07 })
      gsap.from('[data-reveal]', { y: 28, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, delay: 0.3 })
      gsap.from('.feature-card', { y: 40, opacity: 0, rotateX: -8, duration: 0.9, ease: 'expo.out', stagger: 0.09, delay: 0.6 })
      gsap.from('.stage-card', { y: 70, x: 30, opacity: 0, rotate: 4, duration: 1.1, ease: 'expo.out', stagger: 0.14, delay: 0.35 })
      gsap.from('.stage-chip', { scale: 0.4, opacity: 0, duration: 0.8, ease: 'back.out(2)', stagger: 0.12, delay: 1 })

      // Gentle float, each card on its own rhythm.
      gsap.utils.toArray('.stage-card').forEach((el, i) => {
        gsap.to(el, { y: i % 2 ? 10 : -10, duration: 3.2 + i * 0.5, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1.4 })
      })
      gsap.utils.toArray('.stage-chip').forEach((el, i) => {
        gsap.to(el, { y: i % 2 ? -8 : 8, duration: 2.6 + i * 0.4, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1.6 })
      })

      gsap.utils.toArray('.count-up').forEach((el) => {
        const counter = { v: 0 }
        gsap.to(counter, {
          v: Number(el.dataset.to),
          duration: 1.6,
          ease: 'power2.out',
          delay: 0.4,
          onUpdate: () => {
            el.textContent = String(Math.round(counter.v))
          },
        })
      })

      // The preview stack drifts with the pointer for depth.
      const stage = root.current.querySelector('.hero-stage')
      if (stage) {
        const sx = gsap.quickTo(stage, 'x', { duration: 1.2, ease: 'power3.out' })
        const sy = gsap.quickTo(stage, 'y', { duration: 1.2, ease: 'power3.out' })
        const move = (e) => {
          sx((e.clientX / window.innerWidth - 0.5) * -26)
          sy((e.clientY / window.innerHeight - 0.5) * -18)
        }
        window.addEventListener('pointermove', move)
        return () => window.removeEventListener('pointermove', move)
      }
      return undefined
    }, root)
    return () => ctx.revert()
  }, [])

  const preview = (topQuestions.length ? topQuestions : SAMPLE_PREVIEW).slice(0, 3).map((q) => ({
    id: q.id,
    subject: q.subject,
    title: q.title,
    votes: q.votes ?? 0,
    answers: Array.isArray(q.answers) ? q.answers.length : q.answers,
  }))

  const marquee = subjects.length ? subjects.map((s) => s.name) : SAMPLE_PREVIEW.map((s) => s.subject)

  return (
    <div className="home" ref={root}>
      <section className="home-hero">
        <div className="hero-glow" aria-hidden="true" />

        <div className="hero-copy">
          <p className="eyebrow pill" data-reveal>
            <Sparkles size={13} aria-hidden="true" /> GATE CSE · Questions, videos, practice
          </p>
          <h1 className="hero-title" aria-label="Learn GATE CSE the smart way.">
            {HEADLINE.map((word, i) => (
              <span className="word-wrap" key={`${word}-${i}`} aria-hidden="true">
                <span className="home-word">{word}</span>
              </span>
            ))}
          </h1>
          <p className="hero-sub" data-reveal>
            Ask a doubt with photos of your working, watch subject playlists from GO Classes and NPTEL, and test yourself
            on original PYQ-style questions.
          </p>
          <div className="hero-actions" data-reveal>
            <a className="btn btn-primary hero-cta" href="#/questions">
              Browse questions <ArrowRight size={16} aria-hidden="true" />
            </a>
            <a className="btn btn-ghost hero-cta" href="#/learn">
              <PlayCircle size={16} aria-hidden="true" /> Watch playlists
            </a>
            <a className="btn btn-ghost hero-cta" href="#/ask">
              <Sparkles size={16} aria-hidden="true" /> Ask a question
            </a>
          </div>

          <ul className="stat-strip">
            <li className="stat-tile" data-reveal>
              <span className="stat-num count-up" data-to={stats.questions}>
                {stats.questions}
              </span>
              <span className="stat-text">Questions</span>
            </li>
            <li className="stat-tile" data-reveal>
              <span className="stat-num count-up" data-to={stats.playlists}>
                {stats.playlists}
              </span>
              <span className="stat-text">Video playlists</span>
            </li>
            <li className="stat-tile" data-reveal>
              <span className="stat-num count-up" data-to={stats.subjects}>
                {stats.subjects}
              </span>
              <span className="stat-text">GATE CSE subjects</span>
            </li>
          </ul>
        </div>

        <div className="hero-stage" aria-hidden="true">
          <div className="stage-orb" />
          {preview.map((q, i) => (
            <div className={`stage-card stage-card-${i + 1}`} key={q.id}>
              <span className="stage-tag">{q.subject}</span>
              <p className="stage-title">{q.title}</p>
              <span className="stage-meta">
                <span>
                  <ChevronUp size={14} /> {q.votes}
                </span>
                <span>
                  <MessageSquare size={13} /> {q.answers}
                </span>
              </span>
            </div>
          ))}
          <span className="stage-chip stage-chip-streak">
            <Flame size={14} /> 7 day streak
          </span>
          <span className="stage-chip stage-chip-solved">
            <CheckCircle2 size={14} /> Solved +3 pts
          </span>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...marquee, ...marquee].map((name, i) => (
            <span className="marquee-item" key={`${name}-${i}`}>
              <i /> {name}
            </span>
          ))}
        </div>
      </div>

      <section className="home-section">
        <h2 className="section-title">Everything in one place</h2>
        <ul className="feature-grid">
          {FEATURES.map((f) => (
            <li key={f.title}>
              <a className="feature-card" href={f.href}>
                <span className="feature-icon">
                  <f.icon size={20} aria-hidden="true" />
                </span>
                <span className="feature-title">{f.title}</span>
                <span className="feature-text">{f.text}</span>
                <ArrowRight size={16} className="feature-arrow" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </section>

      {subjects.length > 0 && (
        <section className="home-section">
          <h2 className="section-title">Browse by subject</h2>
          <ul className="subject-cloud">
            {subjects.map((s) => (
              <li key={s.name}>
                <button type="button" className="subject-chip" onClick={() => onSubject(s.name)}>
                  {s.name}
                  <span className="subject-chip-count">{s.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {topQuestions.length > 0 && (
        <section className="home-section">
          <h2 className="section-title">Hot right now</h2>
          <div className="question-list question-grid">
            {topQuestions.map((q) => (
              <QuestionCard key={q.id} question={q} />
            ))}
          </div>
        </section>
      )}

      <section className="cta-band">
        <div>
          <h2>Ready to crack GATE CSE?</h2>
          <p>Create a free account, solve a question a day and watch your streak grow.</p>
        </div>
        <div className="cta-actions">
          <a className="btn cta-solid" href="#/sign-up">
            Create free account <ArrowRight size={16} aria-hidden="true" />
          </a>
          <a className="btn cta-line" href="#/dashboard">
            See my progress
          </a>
        </div>
      </section>
    </div>
  )
}
