import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, CheckCircle2, Circle, Eye, Link2, Share2 } from 'lucide-react'
import { avatarColor, initials, LIMITS } from '../lib/store.js'
import Timestamp from './Timestamp.jsx'
import VoteControl from './VoteControl.jsx'
import ReactionButton from './ReactionButton.jsx'
import CommentThread from './CommentThread.jsx'
import ImagePicker from './ImagePicker.jsx'

export default function QuestionDetail({
  question: q,
  user,
  readonly = false,
  solved = false,
  onToggleSolved,
  onView,
  onVote,
  onReact,
  onAddAnswer,
  onAddComment,
}) {
  const [answerDraft, setAnswerDraft] = useState('')
  const [answerImages, setAnswerImages] = useState([])
  const [answerError, setAnswerError] = useState('')
  const [shareNote, setShareNote] = useState('')

  // Count one view per question id, not on every re-render caused by votes or comments.
  const countedFor = useRef(null)
  useEffect(() => {
    if (q && countedFor.current !== q.id) {
      countedFor.current = q.id
      onView(q.id)
    }
  }, [q, onView])

  if (!q) return null

  const myVoteOn = (voters) => (user ? voters?.[user.name] || 0 : 0)

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareNote('Link copied to clipboard.')
    } catch {
      setShareNote('Copy the address bar link to share this question.')
    }
  }

  function submitAnswer(e) {
    e.preventDefault()
    const body = answerDraft.trim()
    if (body.length < 10) {
      setAnswerError('An answer needs at least 10 characters.')
      return
    }
    if (onAddAnswer(q.id, body, answerImages)) {
      setAnswerDraft('')
      setAnswerImages([])
      setAnswerError('')
    }
  }

  return (
    <article className="detail">
      <a className="back-link" href="#/questions">
        <ArrowLeft size={15} aria-hidden="true" /> All questions
      </a>

      <header className="detail-head">
        {q.year !== undefined && (
          <p className="detail-ref">
            GATE CSE {q.year}
            {q.number ? ` · Question ${q.number}` : ''}
            {q.marks ? ` · ${q.marks} ${q.marks === 1 ? 'mark' : 'marks'}` : ''}
            {q.kind ? ` · ${q.kind === 'MCQ' ? 'Multiple choice' : q.kind}` : ''}
          </p>
        )}
        <h1>{q.title}</h1>
        <div className="detail-meta">
          <span className="meta-item">
            Asked <Timestamp value={q.createdAt} ago /> by <strong>{q.author}</strong>
          </span>
          <span className="meta-item">
            <Eye size={14} aria-hidden="true" /> {q.views} views
          </span>
          <span className="tag subject-tag">{q.subject}</span>
        </div>
        {q.tags.length > 0 && (
          <ul className="tag-row">
            {q.tags.map((t) => (
              <li className="tag" key={t}>
                #{t}
              </li>
            ))}
          </ul>
        )}
      </header>

      <section className="post">
        <VoteControl
          label="question"
          score={q.votes}
          myVote={myVoteOn(q.voters)}
          onVote={(dir) => onVote({ kind: 'question', id: q.id, questionId: q.id }, dir)}
        />

        <div className="post-body">
          {q.body && <div className="prose">{q.body}</div>}
          {q.options?.length > 0 && (
            <ol className="options" aria-label="Answer choices">
              {q.options.map((o) => (
                <li key={o.key}>
                  <span className="opt-key">{o.key}</span>
                  <span className="opt-text">{o.text}</span>
                </li>
              ))}
            </ol>
          )}
          <Gallery images={q.images} alt={`Image attached to ${q.title}`} />

          <footer className="post-actions">
            <ReactionButton
              label="question"
              reactions={q.reactions}
              user={user}
              onReact={(type) => onReact({ kind: 'question', id: q.id, questionId: q.id }, type)}
            />
            <button type="button" className="btn btn-ghost small-btn" onClick={share}>
              <Share2 size={14} aria-hidden="true" /> Share
            </button>
            <button type="button" className="btn btn-ghost small-btn" onClick={() => navigator.clipboard?.writeText(window.location.href).catch(() => {})}>
              <Link2 size={14} aria-hidden="true" /> Copy link
            </button>
            <span className="post-author">
              <span className="avatar sm" style={{ background: avatarColor(q.author) }} aria-hidden="true">
                {initials(q.author)}
              </span>
              <strong>{q.author}</strong>
            </span>
          </footer>

          {shareNote && (
            <p className="muted small" role="status">
              {shareNote}
            </p>
          )}

          <CommentThread
            comments={q.comments}
            user={user}
            emptyText="No comments on this question yet."
            onVote={(commentId, dir) => onVote({ kind: 'comment', id: commentId, questionId: q.id }, dir)}
            onAdd={(body) => onAddComment(q.id, null, body)}
          />
        </div>
      </section>

      <section className="answers">
        <h2 className="section-heading">
          {q.answers.length} {q.answers.length === 1 ? 'answer' : 'answers'}
        </h2>

        {q.answers.map((a) => (
          <article className="post answer" key={a.id}>
            <VoteControl
              label="answer"
              score={a.votes}
              myVote={myVoteOn(a.voters)}
              onVote={(dir) => onVote({ kind: 'answer', id: a.id, questionId: q.id }, dir)}
            />
            <div className="post-body">
              <AnswerBody body={a.body} />
              <Gallery images={a.images} alt={`Image attached to an answer by ${a.author}`} />
              <footer className="post-actions">
                <ReactionButton
                  label="answer"
                  reactions={a.reactions}
                  user={user}
                  onReact={(type) => onReact({ kind: 'answer', id: a.id, questionId: q.id }, type)}
                />
                <span className="post-author">
                  <span className="avatar sm" style={{ background: avatarColor(a.author) }} aria-hidden="true">
                    {initials(a.author)}
                  </span>
                  <strong>{a.author}</strong>
                  <span className="muted">answered <Timestamp value={a.createdAt} /></span>
                </span>
              </footer>
              <CommentThread
                comments={a.comments}
                user={user}
                emptyText="No comments on this answer yet."
                onVote={(commentId, dir) =>
                  onVote({ kind: 'comment', id: commentId, questionId: q.id, answerId: a.id }, dir)
                }
                onAdd={(body) => onAddComment(q.id, a.id, body)}
              />
            </div>
          </article>
        ))}
      </section>

      {readonly ? (
        <div className="practice-bar">
          <p className="muted small note">
            Practice questions are read-only. To discuss one, post your own question on the Ask page.
          </p>
          <button
            type="button"
            className={`btn btn-ghost solved-btn${solved ? ' on' : ''}`}
            aria-pressed={solved}
            onClick={() => onToggleSolved?.(q.id)}
          >
            {solved ? <CheckCircle2 size={15} aria-hidden="true" /> : <Circle size={15} aria-hidden="true" />}
            {solved ? 'Solved' : 'Mark as solved'}
          </button>
        </div>
      ) : (
        <section className="answer-composer">
          <h2 className="section-heading">Your answer</h2>
          {!user && <p className="muted small">You need to sign in before posting an answer.</p>}
          <form onSubmit={submitAnswer} noValidate className="form">
            <label className="field">
              <span className="field-label">Answer</span>
              <textarea
                rows={6}
                value={answerDraft}
                placeholder="Explain your reasoning step by step. Attach a photo of your working if that helps."
                onChange={(e) => {
                  setAnswerDraft(e.target.value)
                  setAnswerError('')
                }}
                maxLength={LIMITS.bodyMax}
              />
            </label>
            <ImagePicker
              images={answerImages}
              onChange={setAnswerImages}
              max={LIMITS.answerImages}
              label="Attach images to your answer"
            />
            {answerError && (
              <p className="form-error" role="alert">
                {answerError}
              </p>
            )}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Post answer
              </button>
            </div>
          </form>
        </section>
      )}
    </article>
  )
}

// Answer keys start with a line such as "Answer: (B) 6". Show that line as the verdict.
function AnswerBody({ body }) {
  const [head, ...rest] = body.split('\n\n')
  if (!/^Answer:/.test(head) || rest.length === 0) return <div className="prose">{body}</div>
  return (
    <>
      <p className="answer-verdict">{head}</p>
      <div className="prose">{rest.join('\n\n')}</div>
    </>
  )
}

function Gallery({ images, alt }) {
  if (!images?.length) return null
  return (
    <ul className="gallery">
      {images.map((src, i) => (
        <li key={i}>
          <a href={src} target="_blank" rel="noreferrer" aria-label={`Open ${alt} ${i + 1} in a new tab`}>
            <img src={src} alt={`${alt} (${i + 1})`} />
          </a>
        </li>
      ))}
    </ul>
  )
}
