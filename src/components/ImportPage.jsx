import { useState } from 'react'
import { ArrowLeft, Upload } from 'lucide-react'
import { SUBJECTS } from '../lib/store.js'

const SAMPLE = `[
  {
    "year": 2019,
    "number": 3,
    "marks": 1,
    "subject": "General Aptitude",
    "topic": "verbal-ability",
    "title": "Type the full question text here",
    "options": ["First choice", "Second choice", "Third choice", "Fourth choice"],
    "answer": "B",
    "explanation": "Optional worked answer."
  }
]`

// Bulk-add questions from JSON (pasted or uploaded), for example your own copy of the real papers.
export default function ImportPage({ onImport, onCancel }) {
  const [text, setText] = useState('')
  const [errors, setErrors] = useState([])

  async function onFile(e) {
    const file = e.target.files?.[0]
    if (file) setText(await file.text())
  }

  function submit(e) {
    e.preventDefault()
    setErrors(onImport(text))
  }

  return (
    <div className="ask-page">
      <a className="back-link" href="#/questions">
        <ArrowLeft size={15} aria-hidden="true" /> Back to questions
      </a>
      <header className="ask-head">
        <h1>Import questions</h1>
        <p className="muted">
          Paste a JSON array of questions. Each needs <code>title</code>, <code>subject</code>, <code>year</code> and{' '}
          <code>marks</code> (1 or 2). <code>topic</code>, <code>number</code>, <code>options</code>, <code>answer</code> and{' '}
          <code>explanation</code> are optional. Only import questions you have the right to use.
        </p>
        <p className="muted small">Subjects: {SUBJECTS.join(', ')}</p>
      </header>
      <form className="ask-form" onSubmit={submit} noValidate>
        <label className="field">
          <span className="field-label">Questions (JSON)</span>
          <textarea rows={14} value={text} placeholder={SAMPLE} onChange={(e) => setText(e.target.value)} />
        </label>
        {errors.length > 0 && (
          <ul className="form-error" role="alert">
            {errors.slice(0, 8).map((er) => (
              <li key={er}>{er}</li>
            ))}
            {errors.length > 8 && <li>…and {errors.length - 8} more.</li>}
          </ul>
        )}
        <div className="ask-actions">
          <label className="btn btn-ghost">
            <Upload size={14} aria-hidden="true" /> Upload .json
            <input type="file" accept=".json,application/json" hidden onChange={onFile} />
          </label>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!text.trim()}>
            Import
          </button>
        </div>
      </form>
    </div>
  )
}
