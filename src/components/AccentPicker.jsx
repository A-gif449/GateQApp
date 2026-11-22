import { useEffect, useRef, useState } from 'react'
import { Check, Palette } from 'lucide-react'
import { ACCENTS } from './accents.js'

// A small popover that lets visitors pick the accent colour of the whole site.
export default function AccentPicker({ accent, onChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="accent-picker" ref={rootRef}>
      <button
        type="button"
        className="icon-btn"
        aria-label="Accent colour"
        aria-haspopup="true"
        aria-expanded={open}
        title="Accent colour"
        onClick={() => setOpen((o) => !o)}
      >
        <Palette size={17} aria-hidden="true" />
      </button>
      {open && (
        <div className="accent-pop" role="group" aria-label="Choose accent colour">
          <p className="accent-pop-title">Accent colour</p>
          <div className="accent-swatches">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                type="button"
                className={`swatch${accent === a.id ? ' active' : ''}`}
                style={{ background: `linear-gradient(135deg, ${a.colors[0]}, ${a.colors[1]})` }}
                aria-label={`${a.label} accent`}
                aria-pressed={accent === a.id}
                title={a.label}
                onClick={() => {
                  onChange(a.id)
                  setOpen(false)
                }}
              >
                {accent === a.id && <Check size={14} aria-hidden="true" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
