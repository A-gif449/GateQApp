import { Flame, Sparkles, Trophy, TrendingUp, ArrowRight, UserPlus } from 'lucide-react'
import { avatarColor, initials } from '../lib/store.js'
import { navigate, profileHref } from '../lib/route.js'

// Right-hand column on the question board. It fills the space beside the list with
// useful, live content: the user's progress, trending questions, and the top contributors.
export default function RightRail({ user, rows, hot, onSignUp }) {
  const me = user ? rows.find((r) => r.name === user.name) : null
  const top = rows.slice(0, 5)

  return (
    <aside className="rail" aria-label="Highlights">
      {user ? (
        <section className="rail-card rail-me">
          <div className="rail-me-head">
            <span className="avatar" style={{ background: avatarColor(user.name) }} aria-hidden="true">
              {initials(user.name)}
            </span>
            <div>
              <p className="rail-me-name">Your progress</p>
              <p className="muted small">{me ? me.level.name : 'Newcomer'}</p>
            </div>
            <span className="rail-pts">
              <Sparkles size={14} aria-hidden="true" /> {me ? me.points : 0}
            </span>
          </div>
          <span className="meter" aria-hidden="true">
            <span style={{ transform: `scaleX(${me ? me.level.progress : 0})` }} />
          </span>
          <p className="muted small">
            {me?.level.next ? `${me.level.next.min - me.points} points to ${me.level.next.name}` : 'Top level reached'}
          </p>
          <div className="rail-chips">
            <span className="rail-chip">
              <Flame size={14} aria-hidden="true" /> {me?.stats.streak ?? 0} day streak
            </span>
            <span className="rail-chip">{me?.stats.solved ?? 0} solved</span>
          </div>
        </section>
      ) : (
        <section className="rail-card rail-cta">
          <h2>Level up your GATE prep</h2>
          <p className="small">Earn points, keep a streak and climb the leaderboard.</p>
          <button type="button" className="btn btn-primary" onClick={onSignUp}>
            <UserPlus size={15} aria-hidden="true" /> Create free account
          </button>
        </section>
      )}

      {hot.length > 0 && (
        <section className="rail-card">
          <h2 className="rail-title">
            <TrendingUp size={15} aria-hidden="true" /> Trending
          </h2>
          <ol className="rail-list">
            {hot.map((q, i) => (
              <li key={q.id}>
                <span className="rail-rank">{i + 1}</span>
                <a href={`#/q/${q.id}`} className="rail-link">
                  {q.title}
                  <span className="muted small">
                    {q.subject} · {q.answers.length} {q.answers.length === 1 ? 'answer' : 'answers'}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}

      {top.length > 0 && (
        <section className="rail-card">
          <h2 className="rail-title">
            <Trophy size={15} aria-hidden="true" /> Top contributors
          </h2>
          <ol className="rail-people">
            {top.map((r, i) => (
              <li key={r.name}>
                <span className="rail-rank">{i + 1}</span>
                <span className="avatar sm" style={{ background: avatarColor(r.name) }} aria-hidden="true">
                  {initials(r.name)}
                </span>
                <a href={profileHref(r.name)} className="rail-person">
                  {user && r.name === user.name ? 'You' : r.name}
                </a>
                <span className="rail-score">{r.points}</span>
              </li>
            ))}
          </ol>
          <button type="button" className="link-btn small rail-more" onClick={() => navigate('/leaderboard')}>
            Full leaderboard <ArrowRight size={13} aria-hidden="true" />
          </button>
        </section>
      )}
    </aside>
  )
}
