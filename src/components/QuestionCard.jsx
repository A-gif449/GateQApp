import { CheckCircle2, ChevronUp, Eye, Image as ImageIcon, MessageSquare } from 'lucide-react'
import { avatarColor, initials } from '../lib/store.js'
import { profileHref } from '../lib/route.js'
import Timestamp from './Timestamp.jsx'

function excerpt(text, max = 190) {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean
}

// One row of the question board: a compact stats column, then the paper reference, the question
// text, tags, and who asked it and when.
export default function QuestionCard({ question: q }) {
  const answered = q.answers.length > 0
  const paper = q.year !== undefined

  return (
    <article className="qcard qc">
      <div className="qc-stats">
        <div className="qc-stat">
          <ChevronUp size={14} aria-hidden="true" />
          <span className="qc-num">{q.votes}</span>
          <span className="qc-label">votes</span>
        </div>
        <div className={`qc-stat${answered ? ' answered' : ''}`}>
          {answered ? <CheckCircle2 size={14} aria-hidden="true" /> : <MessageSquare size={14} aria-hidden="true" />}
          <span className="qc-num">{q.answers.length}</span>
          <span className="qc-label">{q.answers.length === 1 ? 'answer' : 'answers'}</span>
        </div>
        <div className="qc-stat quiet">
          <Eye size={14} aria-hidden="true" />
          <span className="qc-num">{q.views}</span>
          <span className="qc-label">views</span>
        </div>
      </div>

      <div className="qc-main">
        <p className="qc-ref">
          <span className="qc-subject">{q.subject}</span>
          {paper && (
            <span className="qc-paper">
              GATE CSE {q.year}
              {q.number ? `, Q.${q.number}` : ''}
              {q.marks ? `, ${q.marks} ${q.marks === 1 ? 'mark' : 'marks'}` : ''}
            </span>
          )}
        </p>

        <h2 className="qc-title">
          <a href={`#/q/${q.id}`}>{q.title}</a>
        </h2>

        {q.body && <p className="qc-excerpt">{excerpt(q.body)}</p>}

        {q.options?.length > 0 && (
          <ol className="qc-options" aria-label="Answer choices">
            {q.options.map((o) => (
              <li key={o.key}>
                <span className="qc-opt-key">{o.key}</span>
                {o.text}
              </li>
            ))}
          </ol>
        )}

        <div className="qc-foot">
          <div className="qc-tags">
            {q.tags.slice(0, 4).map((t) => (
              <span className="qc-tag" key={t}>
                {t}
              </span>
            ))}
            {q.images.length > 0 && (
              <span className="qc-tag">
                <ImageIcon size={11} aria-hidden="true" /> {q.images.length}
              </span>
            )}
          </div>
          <span className="qc-by">
            <span className="avatar xs" style={{ background: avatarColor(q.author) }} aria-hidden="true">
              {initials(q.author)}
            </span>
            <a className="cm-author" href={profileHref(q.author)}>
              {q.author}
            </a>
            <Timestamp value={q.createdAt} />
          </span>
        </div>
      </div>

      {q.images.length > 0 && <img className="qc-thumb" src={q.images[0]} alt="" />}
    </article>
  )
}
