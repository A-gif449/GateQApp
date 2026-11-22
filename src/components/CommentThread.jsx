import { useId, useState } from 'react'
import { avatarColor, initials } from '../lib/store.js'
import Timestamp from './Timestamp.jsx'
import VoteControl from './VoteControl.jsx'

// Comments under a question or an answer. Each comment has a small horizontal vote control.
export default function CommentThread({ comments, user, onVote, onAdd, emptyText = 'No comments yet.' }) {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const inputId = useId()

  function submit(e) {
    e.preventDefault()
    const body = draft.trim()
    if (!body) {
      setError('Write a comment before posting.')
      return
    }
    if (onAdd(body)) {
      setDraft('')
      setError('')
    }
  }

  return (
    <div className="comments">
      {comments.length === 0 ? (
        <p className="muted small">{emptyText}</p>
      ) : (
        <ul className="comment-list">
          {comments.map((c) => (
            <li className="comment" key={c.id}>
              <VoteControl
                layout="horizontal"
                label="comment"
                score={c.votes}
                myVote={user ? c.voters?.[user.name] || 0 : 0}
                onVote={(dir) => onVote(c.id, dir)}
              />
              <div className="comment-body">
                <p>{c.body}</p>
                <p className="comment-meta">
                  <span className="avatar xs" style={{ background: avatarColor(c.author) }} aria-hidden="true">
                    {initials(c.author)}
                  </span>
                  <strong>{c.author}</strong>
                  <span aria-hidden="true">·</span>
                  <Timestamp value={c.createdAt} />
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form className="comment-form" onSubmit={submit} noValidate>
        <label className="sr-only" htmlFor={inputId}>
          Add a comment
        </label>
        <input
          id={inputId}
          value={draft}
          placeholder={user ? 'Add a comment' : 'Sign in to comment'}
          onChange={(e) => {
            setDraft(e.target.value)
            setError('')
          }}
          maxLength={500}
        />
        <button type="submit" className="btn btn-ghost small-btn">
          Comment
        </button>
      </form>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
