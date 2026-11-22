import { useState } from 'react'
import { X } from 'lucide-react'

// Type a tag and press Enter or comma to add it. Backspace on an empty field removes the last tag.
export default function TagInput({ tags, onChange, max }) {
  const [draft, setDraft] = useState('')

  function addTag(raw) {
    const tag = raw.trim().toLowerCase().replace(/[^a-z0-9+#.\- ]/g, '').replace(/\s+/g, '-')
    if (!tag) return
    if (tags.includes(tag) || tags.length >= max) {
      setDraft('')
      return
    }
    onChange([...tags, tag])
    setDraft('')
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(draft)
    } else if (e.key === 'Backspace' && !draft && tags.length) {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <div className="tag-input">
      <ul className="tag-chips">
        {tags.map((t) => (
          <li className="tag-chip" key={t}>
            #{t}
            <button type="button" aria-label={`Remove tag ${t}`} onClick={() => onChange(tags.filter((x) => x !== t))}>
              <X size={12} aria-hidden="true" />
            </button>
          </li>
        ))}
        {tags.length < max && (
          <li className="tag-field">
            <input
              aria-label="Tags"
              value={draft}
              placeholder={tags.length ? '' : 'e.g. sorting, complexity'}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              onBlur={() => addTag(draft)}
            />
          </li>
        )}
      </ul>
      <p className="muted small">
        Press Enter or comma to add a tag · {tags.length}/{max}
      </p>
    </div>
  )
}
