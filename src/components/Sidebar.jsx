import { BarChart3, HelpCircle, Home, Layers, Trophy, Upload } from 'lucide-react'
import { topicLabel } from '../lib/store.js'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'answered', label: 'Answered' },
  { value: 'unanswered', label: 'Unanswered' },
]

const MARKS_OPTIONS = [
  { value: 'All', label: 'All' },
  { value: '1', label: '1 mark' },
  { value: '2', label: '2 marks' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'votes', label: 'Most votes' },
  { value: 'views', label: 'Most viewed' },
]

export default function Sidebar({
  route,
  filters,
  onChange,
  subjects,
  subjectCounts,
  statusCounts,
  years,
  yearCounts,
  marksCounts = {},
  topics = [],
}) {
  const showFilters = route === 'list'
  const navItem = (name, href, Icon, label) => (
    <a className={`nav-link${route === name ? ' active' : ''}`} href={href}>
      <Icon size={16} aria-hidden="true" /> {label}
    </a>
  )

  return (
    <aside className="sidebar" aria-label="Filters">
      <nav className="nav-links" aria-label="Main">
        {navItem('list', '#/', Home, 'Questions')}
        {navItem('ask', '#/ask', HelpCircle, 'Ask a question')}
        {navItem('dashboard', '#/dashboard', BarChart3, 'My progress')}
        {navItem('leaderboard', '#/leaderboard', Trophy, 'Leaderboard')}
        {navItem('import', '#/import', Upload, 'Import questions')}
      </nav>

      {showFilters && (
        <>
          <section className="side-section">
            <h2 className="side-title">Status</h2>
            <div className="segmented">
              {STATUS_OPTIONS.map((opt) => {
                const active = filters.status === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`seg-item${active ? ' active' : ''}`}
                    aria-pressed={active}
                    onClick={() => onChange({ status: opt.value })}
                  >
                    <span>{opt.label}</span>
                    <span className="count">{statusCounts[opt.value]}</span>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="side-section">
            <h2 className="side-title">Marks</h2>
            <div className="segmented">
              {MARKS_OPTIONS.map((opt) => {
                const active = filters.marks === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`seg-item${active ? ' active' : ''}`}
                    aria-pressed={active}
                    onClick={() => onChange({ marks: opt.value })}
                  >
                    <span>{opt.label}</span>
                    <span className="count">{marksCounts[opt.value] || 0}</span>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="side-section">
            <h2 className="side-title">
              <Layers size={13} aria-hidden="true" /> GATE year
            </h2>
            <ul className="subject-list">
              {['All', ...years, 'community'].map((y) => {
                const active = filters.year === String(y)
                const label = y === 'All' ? 'All' : y === 'community' ? 'Community posts' : `GATE CSE ${y}`
                return (
                  <li key={y}>
                    <button
                      type="button"
                      className={`subject-btn${active ? ' active' : ''}`}
                      aria-pressed={active}
                      onClick={() => onChange({ year: String(y) })}
                    >
                      <span>{label}</span>
                      <span className="count">{yearCounts[String(y)] || 0}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>

          <section className="side-section">
            <h2 className="side-title">Subjects</h2>
            {subjects.length === 0 ? (
              <p className="muted small">Subjects appear here once questions are available.</p>
            ) : (
              <ul className="subject-list">
                {['All', ...subjects].map((s) => {
                  const active = filters.subject === s
                  return (
                    <li key={s}>
                      <button
                        type="button"
                        className={`subject-btn${active ? ' active' : ''}`}
                        aria-pressed={active}
                        onClick={() => onChange({ subject: s })}
                      >
                        <span>{s}</span>
                        <span className="count">{subjectCounts[s] || 0}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <section className="side-section">
            <h2 className="side-title">Topics{filters.subject !== 'All' ? ` · ${filters.subject}` : ''}</h2>
            {topics.length === 0 ? (
              <p className="muted small">Topics appear here once questions have them.</p>
            ) : (
              <ul className="subject-list">
                {[{ name: 'All', count: topics.reduce((n, t) => n + t.count, 0) }, ...topics].map((t) => {
                  const active = filters.topic === t.name
                  return (
                    <li key={t.name}>
                      <button
                        type="button"
                        className={`subject-btn${active ? ' active' : ''}`}
                        aria-pressed={active}
                        onClick={() => onChange({ topic: t.name })}
                      >
                        <span>{t.name === 'All' ? 'All' : topicLabel(t.name)}</span>
                        <span className="count">{t.count}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <section className="side-section">
            <h2 className="side-title">Sort</h2>
            <select
              className="side-select"
              aria-label="Sort questions"
              value={filters.sort}
              onChange={(e) => onChange({ sort: e.target.value })}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </section>
        </>
      )}
    </aside>
  )
}
