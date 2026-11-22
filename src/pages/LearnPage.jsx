import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ExternalLink, PlayCircle, X } from 'lucide-react'
import { PLAYLISTS, PROVIDERS, playlistEmbedUrl } from '../data/playlists.js'
import { motionAllowed } from '../lib/motion.js'

// Learn section: embedded YouTube playlists, with credit to each channel.
export default function LearnPage() {
  const [provider, setProvider] = useState('all')
  const [subject, setSubject] = useState('All')
  const [activeId, setActiveId] = useState(null)
  const gridRef = useRef(null)
  const playerRef = useRef(null)

  const subjects = useMemo(() => ['All', ...new Set(PLAYLISTS.map((p) => p.subject))], [])

  const counts = { all: PLAYLISTS.length }
  for (const key of Object.keys(PROVIDERS)) counts[key] = PLAYLISTS.filter((p) => p.provider === key).length

  const list = PLAYLISTS.filter(
    (p) => (provider === 'all' || p.provider === provider) && (subject === 'All' || p.subject === subject),
  )
  const active = PLAYLISTS.find((p) => p.id === activeId) || null

  useEffect(() => {
    if (!motionAllowed() || !gridRef.current) return
    gsap.from(gridRef.current.children, { y: 22, opacity: 0, duration: 0.6, stagger: 0.04, ease: 'power3.out' })
  }, [provider, subject])

  useEffect(() => {
    if (activeId && motionAllowed() && playerRef.current) {
      gsap.from(playerRef.current, { y: -12, opacity: 0, duration: 0.5, ease: 'power2.out' })
    }
  }, [activeId])

  return (
    <section className="page learn-page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Video learning</p>
          <h1>Learn with video playlists</h1>
          <p className="muted">
            Playlists from GO Classes and NPTEL. Each card credits the channel that made the videos.
          </p>
        </div>
      </header>

      <div className="learn-filters">
        <div className="segmented" role="group" aria-label="Channel">
          <button type="button" className={`seg-item${provider === 'all' ? ' active' : ''}`} aria-pressed={provider === 'all'} onClick={() => setProvider('all')}>
            All channels <span className="count">{counts.all}</span>
          </button>
          {Object.entries(PROVIDERS).map(([key, info]) => (
            <button
              key={key}
              type="button"
              className={`seg-item${provider === key ? ' active' : ''}`}
              aria-pressed={provider === key}
              onClick={() => setProvider(key)}
            >
              {info.name} <span className="count">{counts[key]}</span>
            </button>
          ))}
        </div>

        <label className="field learn-subject">
          <span className="field-label">Subject</span>
          <select value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Subject">
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      {active && (
        <div className="player-panel" ref={playerRef}>
          <div className="player-frame">
            <iframe
              src={playlistEmbedUrl(active.playlistId)}
              title={`${active.title} playlist by ${PROVIDERS[active.provider].name}`}
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          <div className="player-credit">
            <span>
              <strong>{active.title}</strong> · Videos by <strong>{PROVIDERS[active.provider].name}</strong>
            </span>
            <span className="credit-links">
              <a href={active.url} target="_blank" rel="noreferrer">
                Open on YouTube <ExternalLink size={13} aria-hidden="true" />
              </a>
              <a href={PROVIDERS[active.provider].channelUrl} target="_blank" rel="noreferrer">
                {PROVIDERS[active.provider].name} channel <ExternalLink size={13} aria-hidden="true" />
              </a>
              <button type="button" className="btn btn-ghost small-btn" onClick={() => setActiveId(null)}>
                <X size={14} aria-hidden="true" /> Close player
              </button>
            </span>
          </div>
        </div>
      )}

      {list.length === 0 ? (
        <div className="empty-state">
          <PlayCircle size={28} aria-hidden="true" />
          <h2>No playlists here yet</h2>
          <p className="muted">
            {provider === 'nptel'
              ? 'NPTEL playlists will appear here once they are added. Each one will be credited to NPTEL.'
              : 'No playlists match these filters.'}
          </p>
        </div>
      ) : (
        <ul className="playlist-grid" ref={gridRef}>
          {list.map((p) => {
            const info = PROVIDERS[p.provider]
            return (
              <li key={p.id}>
                <article className={`playlist-card ${p.provider}${activeId === p.id ? ' playing' : ''}`}>
                  <span className="provider-badge">{info.name}</span>
                  <h3>{p.title}</h3>
                  <p className="muted small">{p.subject}</p>
                  <p className="credit small">
                    Credit: <a href={info.channelUrl} target="_blank" rel="noreferrer">{info.name}</a>
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary small-btn"
                    aria-pressed={activeId === p.id}
                    onClick={() => setActiveId(p.id)}
                  >
                    <PlayCircle size={15} aria-hidden="true" /> Watch here
                  </button>
                </article>
              </li>
            )
          })}
        </ul>
      )}

      <p className="muted small note">
        Videos are played through YouTube's embedded player. GateQ does not host or download them.
      </p>
    </section>
  )
}
