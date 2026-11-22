import { UserButton } from '@clerk/react'
import { LogIn, UserPlus } from 'lucide-react'
import { authUrl } from './config.js'

// Header control when Clerk is on: avatar menu (profile, manage account, sign out) or sign-in buttons.
export default function AccountMenu({ loading, user, onSignIn, onSignUp }) {
  if (loading) return <span className="auth-skeleton" aria-hidden="true" />

  if (user) {
    return (
      <>
        <span className="user-chip">
          <span className="user-name">{user.name}</span>
        </span>
        <UserButton userProfileMode="navigation" userProfileUrl={authUrl('account')} />
      </>
    )
  }

  return (
    <>
      <button type="button" className="btn btn-ghost" onClick={onSignIn}>
        <LogIn size={15} aria-hidden="true" /> Sign in
      </button>
      <button type="button" className="btn btn-accent-outline" onClick={onSignUp}>
        <UserPlus size={15} aria-hidden="true" /> Sign up
      </button>
    </>
  )
}
