import { useState } from 'react'

export default function SignInForm({ onSubmit }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Enter a display name to continue.')
      return
    }
    onSubmit(name.trim())
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <p className="muted">This demo uses a display name only. Voting and asking questions require sign-in.</p>
      <label className="field">
        <span>Display name</span>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setError('')
          }}
          placeholder="e.g. Asha"
        />
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Sign in
        </button>
      </div>
    </form>
  )
}
