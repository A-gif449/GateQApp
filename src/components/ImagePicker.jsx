import { useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { LIMITS, readImage } from '../lib/store.js'

// Attaches images as data URLs (stored in this browser). Supports click and drag-and-drop.
export default function ImagePicker({ images, onChange, max, label = 'Images' }) {
  const inputRef = useRef(null)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)

  async function addFiles(fileList) {
    const files = [...(fileList || [])]
    if (files.length === 0) return
    setError('')
    const room = max - images.length
    if (room <= 0) {
      setError(`You can attach up to ${max} images.`)
      return
    }

    const accepted = []
    let problem = ''
    for (const file of files.slice(0, room)) {
      if (!file.type.startsWith('image/')) {
        problem = 'Only image files can be attached.'
        continue
      }
      if (file.size > LIMITS.imageBytes) {
        problem = 'Each image must be 2 MB or smaller.'
        continue
      }
      accepted.push(await readImage(file))
    }
    if (files.length > room) problem = `Only ${room} more image${room === 1 ? '' : 's'} fit. The rest were skipped.`
    if (problem) setError(problem)
    if (accepted.length) onChange([...images, ...accepted])
    if (inputRef.current) inputRef.current.value = ''
  }

  function removeAt(index) {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="picker">
      <div className="picker-head">
        <span className="field-label">{label}</span>
        <span className="muted small">
          {images.length}/{max}
        </span>
      </div>

      <div
        className={`dropzone${dragging ? ' dragging' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          addFiles(e.dataTransfer.files)
        }}
      >
        <ImagePlus size={22} aria-hidden="true" />
        <div>
          <button type="button" className="link-btn" onClick={() => inputRef.current?.click()}>
            Choose images
          </button>
          <span className="muted"> or drag them here · PNG, JPG, GIF · up to 2 MB each</span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          aria-label={label}
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {images.length > 0 && (
        <ul className="thumbs">
          {images.map((src, i) => (
            <li className="thumb" key={i}>
              <img src={src} alt={`Attachment ${i + 1}`} />
              <button type="button" className="thumb-remove" aria-label={`Remove attachment ${i + 1}`} onClick={() => removeAt(i)}>
                <X size={13} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
