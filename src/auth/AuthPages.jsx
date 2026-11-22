import { SignIn, SignUp, UserProfile } from '@clerk/react'
import { BookOpenCheck, Flame, ListChecks, LoaderCircle, ShieldCheck, Trophy } from 'lucide-react'
import { afterAuthUrl, authUrl, rememberReturnTo } from './config.js'
import { openAuthPage } from '../lib/route.js'
import './auth.css'

const PERKS = [
  { icon: ListChecks, title: 'Previous-year questions', text: 'Practise GATE CSE papers by subject and year, with worked answers.' },
  { icon: Flame, title: 'Streaks and points', text: 'Mark questions solved, earn points and keep your daily streak alive.' },
  { icon: Trophy, title: 'Leaderboard', text: 'See how your progress compares with the rest of the community.' },
]

function Hero({ mode }) {
  const signUp = mode === 'sign-up'
  return (
    <div className="auth-hero">
      <span className="auth-eyebrow">
        <BookOpenCheck size={14} aria-hidden="true" /> GATE CSE preparation
      </span>
      <h1>
        {signUp ? 'Start your ' : 'Welcome back to '}
        <span className="auth-grad">{signUp ? 'GATE journey' : 'GateQ'}</span>
      </h1>
      <p className="auth-lede">
        {signUp
          ? 'Create a free account to ask questions, answer others and track every question you solve.'
          : 'Sign in to pick up where you left off: your solved questions, streak and rank are waiting.'}
      </p>
      <ul className="auth-perks">
        {PERKS.map(({ icon: Icon, title, text }) => (
          <li key={title}>
            <span className="auth-perk-icon" aria-hidden="true">
              <Icon size={18} />
            </span>
            <span>
              <strong>{title}</strong>
              <span className="muted">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function AuthFrame({ mode, children }) {
  return (
    <section className="auth-page" aria-label={mode === 'sign-up' ? 'Create your account' : 'Sign in'}>
      <Hero mode={mode} />
      <div className="auth-card-wrap">{children}</div>
    </section>
  )
}

function Loading({ label }) {
  return (
    <div className="auth-loading" role="status">
      <LoaderCircle size={22} className="spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

function AlreadySignedIn({ user }) {
  return (
    <div className="auth-done">
      <ShieldCheck size={26} aria-hidden="true" />
      <h2>You're signed in as {user.name}</h2>
      <div className="auth-done-actions">
        <a className="btn btn-primary" href="#/questions">
          Browse questions
        </a>
        <a className="btn btn-ghost" href={authUrl('account')}>
          Manage account
        </a>
      </div>
    </div>
  )
}

export function SignInPage({ auth }) {
  return (
    <AuthFrame mode="sign-in">
      {!auth.loaded ? (
        <Loading label="Loading sign-in" />
      ) : auth.user ? (
        <AlreadySignedIn user={auth.user} />
      ) : (
        <SignIn
          fallback={<Loading label="Loading sign-in" />}
          routing="hash"
          signInUrl={authUrl('sign-in')}
          signUpUrl={authUrl('sign-up')}
          forceRedirectUrl={afterAuthUrl()}
        />
      )}
    </AuthFrame>
  )
}

export function SignUpPage({ auth }) {
  return (
    <AuthFrame mode="sign-up">
      {!auth.loaded ? (
        <Loading label="Loading sign-up" />
      ) : auth.user ? (
        <AlreadySignedIn user={auth.user} />
      ) : (
        <SignUp
          fallback={<Loading label="Loading sign-up" />}
          routing="hash"
          signInUrl={authUrl('sign-in')}
          signUpUrl={authUrl('sign-up')}
          forceRedirectUrl={afterAuthUrl()}
        />
      )}
    </AuthFrame>
  )
}

// Clerk's UserProfile: name, photo, email, password, connected accounts, active devices.
export function AccountPage({ auth }) {
  if (!auth.loaded) return <Loading label="Loading your account" />
  if (!auth.user) {
    return (
      <AuthGate
        title="Sign in to manage your account"
        text="Update your name, photo, email and password once you are signed in."
      />
    )
  }
  return (
    <section className="account-page">
      <header className="account-head">
        <h1>Account</h1>
        <p className="muted">Manage how you sign in and what appears on your GateQ profile.</p>
        <a className="link-btn small" href={`#/u/${encodeURIComponent(auth.user.name)}`}>
          View public profile
        </a>
      </header>
      <UserProfile fallback={<Loading label="Loading your account" />} routing="hash" />
    </section>
  )
}

// Shown in place of a page that needs a signed-in user.
export function AuthGate({ title, text, loading = false }) {
  if (loading) return <Loading label="Checking your session" />
  const go = (path) => () => {
    rememberReturnTo()
    openAuthPage(path)
  }
  return (
    <div className="empty-state auth-gate">
      <ShieldCheck size={28} aria-hidden="true" />
      <h2>{title}</h2>
      <p className="muted">{text}</p>
      <div className="auth-done-actions">
        <button type="button" className="btn btn-primary" onClick={go('sign-in')}>
          Sign in
        </button>
        <button type="button" className="btn btn-ghost" onClick={go('sign-up')}>
          Create account
        </button>
      </div>
    </div>
  )
}
