import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ArrowLeft, CheckCircle2, Circle, Lightbulb } from 'lucide-react'
import { LIMITS } from '../lib/store.js'
import { motionAllowed } from '../lib/motion.js'
import TagInput from './TagInput.jsx'
import ImagePicker from './ImagePicker.jsx'

const EMPTY = { title: '', subject: '', tags: [], body: '', images: [] }

export default function AskPage({ subjects, onSubmit, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY, subject: subjects[0] || '' })
  const [errors, setErrors] = useState({})
  const previewRef = useRef(null)

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  // Entrance: the form sections and the preview fade in with a small stagger.
  useEffect(() => {
    if (!motionAllowed()) return
    const tween = gsap.from('.ask-section, .ask-preview', {
      y: 18,
      opacity: 0,
      duration: 0.55,
      stagger: 0.08,
      ease: 'power2.out',
      clearProps: 'transform,opacity',
    })
    return () => tween.kill()
  }, [])

  // The preview card nudges whenever the title changes, so the live update feels responsive.
  useEffect(() => {
    if (!motionAllowed() || !previewRef.current) return
    gsap.fromTo(previewRef.current.querySelector('.preview-title'), { opacity: 0.4 }, { opacity: 1, duration: 0.25 })
  }, [form.title])

  function validate() {
    const next = {}
    const title = form.title.trim()
    if (title.length < LIMITS.titleMin) next.title = `Write at least ${LIMITS.titleMin} characters in the title.`
    if (!form.subject) next.subject = 'Choose a subject.'
    return next
  }

  function handleSubmit(e) {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length) return
    onSubmit({
      title: form.title.trim(),
      subject: form.subject,
      tags: form.tags,
      body: form.body.trim(),
      images: form.images,
    })
  }

  const titleLength = form.title.trim().length
  const checklist = [
    { done: titleLength >= LIMITS.titleMin, text: `Title of ${LIMITS.titleMin}+ characters` },
    { done: Boolean(form.subject), text: 'Subject selected' },
    { done: form.body.trim().length > 0, text: 'Details added (optional, but helpful)' },
    { done: form.images.length > 0, text: 'Screenshot or diagram attached (optional)' },
  ]

  return (
    <div className="ask-page">
      <a className="back-link" href="#/">
        <ArrowLeft size={15} aria-hidden="true" /> Cancel and go back
      </a>
      <header className="ask-head">
        <h1>Ask a question</h1>
        <p className="muted">Clear questions get faster, better answers. Include the working and any images.</p>
      </header>

      <div className="ask-layout">
        <form className="ask-form" onSubmit={handleSubmit} noValidate>
          <section className="ask-section">
            <label className="field">
              <span className="field-label">Title</span>
              <input
                value={form.title}
                maxLength={LIMITS.titleMax}
                placeholder="Summarise the question in one line"
                aria-invalid={Boolean(errors.title)}
                onChange={(e) => {
                  set({ title: e.target.value })
                  setErrors((er) => ({ ...er, title: undefined }))
                }}
              />
              <span className="field-foot">
                {errors.title ? (
                  <span className="form-error" role="alert">
                    {errors.title}
                  </span>
                ) : (
                  <span className="muted small">Be specific and imagine you're asking another person.</span>
                )}
                <span className="muted small">
                  {titleLength}/{LIMITS.titleMax}
                </span>
              </span>
            </label>
          </section>

          <section className="ask-section">
            <label className="field">
              <span className="field-label">Subject</span>
              <select value={form.subject} onChange={(e) => set({ subject: e.target.value })} aria-invalid={Boolean(errors.subject)}>
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.subject && (
                <span className="form-error" role="alert">
                  {errors.subject}
                </span>
              )}
            </label>
          </section>

          <section className="ask-section">
            <div className="field">
              <span className="field-label">Tags</span>
              <TagInput tags={form.tags} onChange={(tags) => set({ tags })} max={LIMITS.tagsMax} />
            </div>
          </section>

          <section className="ask-section">
            <label className="field">
              <span className="field-label">Details</span>
              <textarea
                rows={9}
                value={form.body}
                maxLength={LIMITS.bodyMax}
                placeholder="Describe what you tried, the options, and where you got stuck."
                onChange={(e) => set({ body: e.target.value })}
              />
              <span className="field-foot">
                <span className="muted small" />
                <span className="muted small">
                  {form.body.length}/{LIMITS.bodyMax}
                </span>
              </span>
            </label>
          </section>

          <section className="ask-section">
            <ImagePicker
              images={form.images}
              onChange={(images) => set({ images })}
              max={LIMITS.questionImages}
              label="Images"
            />
          </section>

          <div className="ask-actions">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Post question
            </button>
          </div>
        </form>

        <aside className="ask-preview" ref={previewRef} aria-label="Preview">
          <p className="field-label">Live preview</p>
          <div className="preview-card">
            <h2 className="preview-title">{form.title.trim() || 'Your question title appears here'}</h2>
            <div className="qmeta">
              <span className="tag subject-tag">{form.subject}</span>
              {form.tags.map((t) => (
                <span className="tag" key={t}>
                  #{t}
                </span>
              ))}
            </div>
            {form.body.trim() && <div className="prose preview-body">{form.body}</div>}
            {form.images.length > 0 && (
              <ul className="thumbs">
                {form.images.map((src, i) => (
                  <li className="thumb" key={i}>
                    <img src={src} alt={`Preview attachment ${i + 1}`} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="checklist-card">
            <p className="checklist-title">
              <Lightbulb size={15} aria-hidden="true" /> Before you post
            </p>
            <ul className="checklist">
              {checklist.map((item) => (
                <li key={item.text} className={item.done ? 'done' : ''}>
                  {item.done ? <CheckCircle2 size={15} aria-hidden="true" /> : <Circle size={15} aria-hidden="true" />}
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
