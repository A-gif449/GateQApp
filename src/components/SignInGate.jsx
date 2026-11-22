import { LoaderCircle, LockKeyhole } from 'lucide-react'

// Shown in place of anything that holds questions while the visitor is not signed in.
export default function SignInGate({ title, text, loading = false, onSignIn, onSignUp }) {
  if (loading) {
    return (
      <div className="auth-loading" role="status">
        <LoaderCircle size={22} className="spin" aria-hidden="true" />
        <span>Checking your session</span>
      </div>
    )
  }
  return (
    <div className="empty-state auth-gate sign-in-gate">
      <LockKeyhole size={28} aria-hidden="true" />
      <h2>{title}</h2>
      <p className="muted">{text}</p>
      <div className="auth-done-actions">
        <button type="button" className="btn btn-primary" onClick={onSignIn}>
          Sign in to continue
        </button>
        <button type="button" className="btn btn-ghost" onClick={onSignUp}>
          Create account
        </button>
      </div>
    </div>
  )
}
