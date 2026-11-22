import { useMemo, useState } from 'react'
import { CalendarDays, CheckCircle2, Lock, MessageSquare, Star, ThumbsUp } from 'lucide-react'
import { avatarColor, initials } from '../lib/store.js'
import Timestamp from '../components/Timestamp.jsx'
import { navigate } from '../lib/route.js'
import {
  computeBadges,
  computePoints,
  computeUserStats,
  getDays,
  getSolved,
  levelFor,
} from '../lib/gamify.js'

export default function ProfilePage({ name, user, questions, profile, solved, days, onSaveBio }) {
  const isOwn = user?.name === name
  const solvedFor = isOwn ? solved : getSolved(name)
  const daysFor = isOwn ? days : getDays(name)

  const stats = useMemo(
    () => computeUserStats(questions, name, solvedFor, daysFor),
    [questions, name, solvedFor, daysFor],
  )
  const points = computePoints(stats)
  const level = levelFor(points)
  const badges = computeBadges(stats, points)

  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState(profile?.bio || '')

  const activity = useMemo(() => {
    const items = []
    for (const q of questions) {
      if (q.year === undefined && q.author === name) {
        items.push({ kind: 'asked', id: q.id, title: q.title, at: q.createdAt })
      }
      for (const a of q.answers) {
        if (a.author === name) items.push({ kind: 'answered', id: q.id, title: q.title, at: a.createdAt })
      }
    }
    return items.sort((a, b) => b.at - a.at).slice(0, 12)
  }, [questions, name])

  const joined = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'Not yet'

  return (
    <section className="page profile">
      <header className="profile-hero">
        <span className="profile-avatar" style={{ background: avatarColor(name) }} aria-hidden="true">
          {initials(name)}
        </span>
        <div className="profile-id">
          <p className="eyebrow">{level.name}</p>
          <h1>{name}</h1>
          <p className="muted small meta-line">
            <CalendarDays size={14} aria-hidden="true" /> Joined {joined}
          </p>
          {!editing ? (
            <p className="bio">{profile?.bio || (isOwn ? 'Add a short bio so others know what you are studying.' : 'No bio yet.')}</p>
          ) : (
            <form
              className="bio-form"
              onSubmit={(e) => {
                e.preventDefault()
                onSaveBio(name, bio.trim().slice(0, 200))
                setEditing(false)
              }}
            >
              <textarea rows={3} value={bio} maxLength={200} onChange={(e) => setBio(e.target.value)} aria-label="Bio" />
              <div className="form-actions">
                <button type="button" className="btn btn-ghost small-btn" onClick={() => setEditing(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary small-btn">
                  Save bio
                </button>
              </div>
            </form>
          )}
          {isOwn && !editing && (
            <button type="button" className="btn btn-ghost small-btn" onClick={() => setEditing(true)}>
              Edit bio
            </button>
          )}
        </div>
        <div className="profile-points">
          <span className="big-num">{points}</span>
          <span className="muted small">points</span>
          <span className="meter"><span style={{ transform: `scaleX(${level.progress})` }} /></span>
          <span className="muted small">
            {level.next ? `${level.next.min - points} to ${level.next.name}` : 'Top level reached'}
          </span>
        </div>
      </header>

      <div className="kpi-grid compact">
        <div className="kpi"><span className="kpi-value">{stats.asked}</span><span className="kpi-label">questions</span></div>
        <div className="kpi"><span className="kpi-value">{stats.answers}</span><span className="kpi-label">answers</span></div>
        <div className="kpi"><span className="kpi-value">{stats.comments}</span><span className="kpi-label">comments</span></div>
        <div className="kpi"><span className="kpi-value">{stats.upvotes}</span><span className="kpi-label">upvotes received</span></div>
        <div className="kpi"><span className="kpi-value">{stats.solved}</span><span className="kpi-label">practice solved</span></div>
      </div>

      <div className="two-col">
        <section className="panel">
          <h2>
            <Star size={16} aria-hidden="true" /> Badges
          </h2>
          <ul className="badge-grid">
            {badges.map((b) => {
              const Icon = b.icon
              return (
                <li key={b.id} className={`badge${b.unlocked ? ' unlocked' : ''}`}>
                  <span className="badge-icon">
                    {b.unlocked ? <Icon size={20} aria-hidden="true" /> : <Lock size={18} aria-hidden="true" />}
                  </span>
                  <span className="badge-title">{b.title}</span>
                  <span className="badge-desc">{b.description}</span>
                  {b.unlocked && <CheckCircle2 size={14} className="badge-check" aria-label="Earned" />}
                </li>
              )
            })}
          </ul>
        </section>

        <section className="panel">
          <h2>
            <MessageSquare size={16} aria-hidden="true" /> Recent activity
          </h2>
          {activity.length === 0 ? (
            <p className="muted small">No community activity yet.</p>
          ) : (
            <ul className="activity">
              {activity.map((item) => (
                <li key={`${item.kind}-${item.id}-${item.at}`}>
                  <span className={`activity-kind ${item.kind}`}>
                    {item.kind === 'asked' ? <ThumbsUp size={12} aria-hidden="true" /> : <MessageSquare size={12} aria-hidden="true" />}
                    {item.kind === 'asked' ? 'Asked' : 'Answered'}
                  </span>
                  <a
                    href={`#/q/${item.id}`}
                    onClick={(e) => {
                      e.preventDefault()
                      navigate(`/q/${item.id}`)
                    }}
                  >
                    {item.title}
                  </a>
                  <Timestamp className="muted small" value={item.at} />
                </li>
              ))}
            </ul>
          )}
          {isOwn && <p className="muted small">Active on {stats.activeDays} day{stats.activeDays === 1 ? '' : 's'} so far.</p>}
        </section>
      </div>
    </section>
  )
}
