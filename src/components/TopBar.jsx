import { forwardRef } from 'react'
import { LogIn, LogOut, Lock, Moon, Plus, Search, Sun } from 'lucide-react'
import { avatarColor, initials } from '../lib/store.js'
import { navigate } from '../lib/route.js'
import { AUTH_ENABLED } from '../auth/config.js'
import AccountMenu from '../auth/AccountMenu.jsx'
import AccentPicker from './AccentPicker.jsx'

const NAV = [
  { href: '#/questions', label: 'Questions', routes: ['list', 'question', 'ask'] },
  { href: '#/learn', label: 'Learn', routes: ['learn'] },
  { href: '#/leaderboard', label: 'Leaderboard', routes: ['leaderboard'] },
]

const TopBar = forwardRef(function TopBar(
  {
    theme,
    onToggleTheme,
    accent = 'indigo',
    onAccent = () => {},
    route = '',
    user,
    authLoading = false,
    canSearch = true,
    query,
    onQuery,
    onSignIn,
    onSignUp,
    onSignOut,
  },
  ref,
) {
  const isDark = theme === 'dark'
  return (
    <header className="topbar">
      <a className="brand" href="#/" aria-label="GateQ home">
        <span className="brand-mark" aria-hidden="true">Q</span>
        <span className="brand-name">GateQ</span>
      </a>

      <nav className="topnav" aria-label="Main">
        {NAV.map((item) => {
          const active = item.routes.includes(route)
          return (
            <a key={item.href} href={item.href} className={active ? 'active' : undefined} aria-current={active ? 'page' : undefined}>
              {item.label}
            </a>
          )
        })}
      </nav>

      <label className={`search${canSearch ? '' : ' locked'}`}>
        <Search size={16} aria-hidden="true" />
        <input
          ref={ref}
          type="search"
          placeholder={canSearch ? 'Search questions, tags, or text' : 'Sign in to search questions'}
          aria-label="Search questions"
          value={canSearch ? query : ''}
          disabled={!canSearch}
          onChange={(e) => onQuery(e.target.value)}
        />
        {canSearch ? <kbd aria-hidden="true">/</kbd> : <Lock size={14} aria-hidden="true" />}
      </label>

      <div className="topbar-actions">
        <button type="button" className="btn btn-primary tb-ask" onClick={() => navigate('/ask')} aria-label="Ask a question">
          <Plus size={16} aria-hidden="true" />
          <span className="tb-ask-label">Ask</span>
        </button>

        <div className="tb-tools" role="group" aria-label="Appearance">
          <AccentPicker accent={accent} onChange={onAccent} />
          <button
            type="button"
            className="icon-btn"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
          </button>
        </div>

        <div className="tb-account">
        {AUTH_ENABLED ? (
          <AccountMenu loading={authLoading} user={user} onSignIn={onSignIn} onSignUp={onSignUp} />
        ) : user ? (
          <>
            <span className="user-chip">
              <span className="avatar" style={{ background: avatarColor(user.name) }} aria-hidden="true">
                {initials(user.name)}
              </span>
              <span className="user-name">{user.name}</span>
            </span>
            <button type="button" className="btn btn-ghost" onClick={onSignOut}>
              <LogOut size={15} aria-hidden="true" /> Sign out
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-ghost" onClick={onSignIn}>
            <LogIn size={15} aria-hidden="true" /> Sign in
          </button>
        )}
        </div>
      </div>
    </header>
  )
})

export default TopBar
