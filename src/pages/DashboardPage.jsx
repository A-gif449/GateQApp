import { useMemo } from 'react'
import { BookOpen, Calendar, Flame, Lightbulb, Lock, Sigma, Star, Target } from 'lucide-react'
import { PRACTICE_COUNT, PRACTICE_YEARS } from '../data/pyqMeta.js'
import { SUBJECTS } from '../lib/store.js'
import { navigate } from '../lib/route.js'
import {
  computeBadges,
  computePoints,
  computeUserStats,
  levelFor,
} from '../lib/gamify.js'

const WEEKLY_GOAL = 5
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

const FORMULAS = [
  { title: 'Spanning trees of Kₙ', text: 'nⁿ⁻² (Cayley’s formula)' },
  { title: 'Catalan numbers', text: 'Cₙ = (2n)! / ((n+1)!·n!) counts binary trees and BSTs with n keys' },
  { title: 'Full binary tree nodes', text: 'A binary tree of height h has at most 2ⁿ⁺¹ − 1 nodes (root at height 0)' },
  { title: 'Probability of a union', text: 'P(A ∪ B) = P(A) + P(B) − P(A ∩ B); equals P(A) + P(B) − P(A)P(B) when independent' },
  { title: 'Cache geometry', text: 'Sets = lines ÷ ways; offset bits = log₂(block size); index bits = log₂(sets)' },
  { title: 'Deadlock-free resources', text: 'With n processes needing at most k instances each, n(k−1) + 1 instances avoid deadlock' },
]

const TIPS = [
  'Attempt a question on paper before you open the answer.',
  'Revisit questions you got wrong after two days, then again after a week.',
  'Write the formula you need first. The arithmetic is usually the easy part.',
]

export default function DashboardPage({ user, solved, days, practice = [], onSignIn, onOpenQuestion }) {
  const PRACTICE_QUESTIONS = practice
  const name = user?.name || ''
  const stats = useMemo(
    () => (user ? computeUserStats([], name, solved, days) : null),
    [user, name, solved, days],
  )
  // Practice-only stats: points come from solved questions, so pass the solved map through.
  const points = stats ? computePoints(stats) : 0
  const level = levelFor(points)
  const badges = computeBadges(stats || { solved: 0, streak: 0, asked: 0, answers: 0 }, points)
  const unlocked = badges.filter((b) => b.unlocked).length

  const solvedIds = new Set(Object.keys(user ? solved : {}))
  const weekCount = Object.values(user ? solved : {}).filter((t) => Date.now() - t < WEEK_MS).length
  const weekPct = Math.min(100, Math.round((weekCount / WEEKLY_GOAL) * 100))

  const byYear = PRACTICE_YEARS.map((y) => {
    const items = PRACTICE_QUESTIONS.filter((q) => q.year === y)
    return { year: y, done: items.filter((q) => solvedIds.has(q.id)).length, total: items.length }
  })

  const bySubject = SUBJECTS.map((s) => {
    const items = PRACTICE_QUESTIONS.filter((q) => q.subject === s)
    return { subject: s, done: items.filter((q) => solvedIds.has(q.id)).length, total: items.length }
  }).filter((row) => row.total > 0)

  const suggestion = useMemo(() => {
    const weakest = [...bySubject].sort((a, b) => a.done / a.total - b.done / b.total)[0]
    if (!weakest) return null
    const next = PRACTICE_QUESTIONS.find((q) => q.subject === weakest.subject && !solvedIds.has(q.id))
    return next ? { question: next, subject: weakest.subject } : null
    // solvedIds is rebuilt each render; the key input is the solved map.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solved, user, practice])

  const totalSolved = Object.keys(user ? solved : {}).length

  return (
    <section className="page dashboard">
      <header className="page-head">
        <div>
          <p className="eyebrow">Your progress</p>
          <h1>{user ? `Hi, ${user.name}` : 'Track your progress'}</h1>
          <p className="muted">Points, streaks, and practice progress are saved in this browser.</p>
        </div>
        {!user && (
          <button type="button" className="btn btn-primary" onClick={onSignIn}>
            Sign in to start tracking
          </button>
        )}
      </header>

      <div className="kpi-grid">
        <div className="kpi">
          <span className="kpi-icon"><Star size={18} aria-hidden="true" /></span>
          <span className="kpi-value">{points}</span>
          <span className="kpi-label">points</span>
        </div>
        <div className="kpi">
          <span className="kpi-icon"><Target size={18} aria-hidden="true" /></span>
          <span className="kpi-value">{level.name}</span>
          <span className="kpi-label">
            {level.next ? `${level.next.min - points} points to ${level.next.name}` : 'Top level reached'}
          </span>
          <span className="meter"><span style={{ transform: `scaleX(${level.progress})` }} /></span>
        </div>
        <div className="kpi">
          <span className="kpi-icon"><Flame size={18} aria-hidden="true" /></span>
          <span className="kpi-value">{stats?.streak ?? 0}</span>
          <span className="kpi-label">day streak</span>
        </div>
        <div className="kpi">
          <span className="kpi-icon"><Calendar size={18} aria-hidden="true" /></span>
          <span className="kpi-value">{unlocked}/{badges.length}</span>
          <span className="kpi-label">badges earned</span>
        </div>
      </div>

      <div className="two-col">
        <section className="panel">
          <h2>Weekly practice goal</h2>
          <p className="muted small">
            {weekCount} of {WEEKLY_GOAL} practice questions solved this week
          </p>
          <div className="meter big"><span style={{ transform: `scaleX(${weekPct / 100})` }} /></div>
          <p className="small">
            {weekPct >= 100 ? 'Goal reached. Keep going!' : `Solve ${Math.max(0, WEEKLY_GOAL - weekCount)} more to finish the week.`}
          </p>
          <p className="muted small">Total practice solved: {totalSolved} of {PRACTICE_QUESTIONS.length || PRACTICE_COUNT}</p>
        </section>

        <section className="panel">
          <h2>
            <Lightbulb size={16} aria-hidden="true" /> Suggested next
          </h2>
          {suggestion ? (
            <>
              <p className="muted small">Your weakest subject right now: {suggestion.subject}</p>
              <a
                className="suggest-link"
                href={`#/q/${suggestion.question.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  onOpenQuestion(suggestion.question.id)
                }}
              >
                {suggestion.question.title}
              </a>
            </>
          ) : (
            <p className="muted small">Nothing left to suggest. Nice work.</p>
          )}
        </section>
      </div>

      <div className="two-col">
        <section className="panel">
          <h2>
            <BookOpen size={16} aria-hidden="true" /> GATE CSE 2010–2016 practice
          </h2>
          <ul className="bar-list">
            {byYear.map((row) => (
              <li key={row.year}>
                <span className="bar-label">{row.year}</span>
                <span className="meter"><span style={{ transform: `scaleX(${row.total ? row.done / row.total : 0})` }} /></span>
                <span className="bar-count">{row.done}/{row.total}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2>By subject</h2>
          <ul className="bar-list">
            {bySubject.map((row) => (
              <li key={row.subject}>
                <span className="bar-label wide">{row.subject}</span>
                <span className="meter"><span style={{ transform: `scaleX(${row.done / row.total})` }} /></span>
                <span className="bar-count">{row.done}/{row.total}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="two-col">
        <section className="panel">
          <h2>
            <Sigma size={16} aria-hidden="true" /> Quick formulas
          </h2>
          <ul className="formula-list">
            {FORMULAS.map((f) => (
              <li key={f.title}>
                <strong>{f.title}</strong>
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2>Badges</h2>
          <ul className="badge-mini">
            {badges.map((b) => {
              const Icon = b.icon
              return (
                <li key={b.id} className={b.unlocked ? 'on' : ''} title={b.description}>
                  {b.unlocked ? <Icon size={16} aria-hidden="true" /> : <Lock size={14} aria-hidden="true" />}
                  <span>{b.title}</span>
                </li>
              )
            })}
          </ul>
          <h3 className="tips-title">Study tips</h3>
          <ul className="tips">
            {TIPS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <button type="button" className="btn btn-ghost small-btn" onClick={() => navigate('/')}>
            Browse all questions
          </button>
        </section>
      </div>
    </section>
  )
}
