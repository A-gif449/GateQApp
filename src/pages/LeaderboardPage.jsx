import { Crown, Medal, Award, Sparkles } from 'lucide-react'
import { avatarColor, initials } from '../lib/store.js'
import { profileHref } from '../lib/route.js'

const PODIUM_ICONS = [Crown, Medal, Award]

export default function LeaderboardPage({ rows, user }) {
  return (
    <section className="page leaderboard">
      <header className="page-head">
        <div>
          <p className="eyebrow">Leaderboard</p>
          <h1>Top contributors</h1>
          <p className="muted">
            Points come from questions, answers, comments, upvotes, and practice. Rankings use data saved in this browser.
          </p>
        </div>
      </header>

      {rows.length === 0 ? (
        <div className="empty-state">
          <Sparkles size={28} aria-hidden="true" />
          <h2>No contributors yet</h2>
          <p className="muted">Ask a question or post an answer to appear here.</p>
        </div>
      ) : (
        <>
          <ol className="podium">
            {rows.slice(0, 3).map((row, i) => {
              const Icon = PODIUM_ICONS[i]
              return (
                <li key={row.name} className={`podium-card place-${i + 1}`}>
                  <Icon size={20} aria-hidden="true" className="podium-icon" />
                  <span className="avatar lg" style={{ background: avatarColor(row.name) }} aria-hidden="true">
                    {initials(row.name)}
                  </span>
                  <a className="podium-name" href={profileHref(row.name)}>
                    {row.name}
                    {user?.name === row.name && <span className="you-tag">you</span>}
                  </a>
                  <span className="podium-points">{row.points} pts</span>
                  <span className="muted small">{row.level.name}</span>
                </li>
              )
            })}
          </ol>

          <div className="panel table-panel">
            <table className="rank-table">
              <thead>
                <tr>
                  <th scope="col">Rank</th>
                  <th scope="col">Contributor</th>
                  <th scope="col">Level</th>
                  <th scope="col">Badges</th>
                  <th scope="col" className="num">Points</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.name} className={user?.name === row.name ? 'me' : ''}>
                    <td>{i + 1}</td>
                    <td>
                      <a className="rank-name" href={profileHref(row.name)}>
                        <span className="avatar sm" style={{ background: avatarColor(row.name) }} aria-hidden="true">
                          {initials(row.name)}
                        </span>
                        {row.name}
                      </a>
                    </td>
                    <td>{row.level.name}</td>
                    <td>{row.badgeCount}</td>
                    <td className="num">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}
