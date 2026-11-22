// Constants and data helpers. Questions start empty and are saved in this browser only.

export const SUBJECTS = [
  'Algorithms',
  'Data Structures',
  'Discrete Mathematics',
  'Engineering Mathematics',
  'Digital Logic',
  'Computer Organization',
  'Programming in C',
  'Operating Systems',
  'Database Management',
  'Computer Networks',
  'Theory of Computation',
  'Compiler Design',
  'Software Engineering',
  'Web Technologies',
  'General Aptitude',
]

// "graph-theory" -> "Graph theory"
export function topicLabel(topic = '') {
  const t = topic.replace(/-/g, ' ').trim()
  return t.charAt(0).toUpperCase() + t.slice(1)
}

// Turns rows pasted or uploaded as JSON into question objects. Returns { questions, errors }.
export function parseImport(text, author, existingIds = new Set()) {
  let rows
  try {
    rows = JSON.parse(text)
  } catch {
    return { questions: [], errors: ['This is not valid JSON.'] }
  }
  if (!Array.isArray(rows)) return { questions: [], errors: ['The JSON must be an array of questions.'] }
  const questions = []
  const errors = []
  const seen = new Set(existingIds)
  rows.forEach((row, i) => {
    const at = `Row ${i + 1}`
    const title = String(row?.title || '').trim()
    const subject = String(row?.subject || '').trim()
    const year = Number(row?.year)
    const marks = Number(row?.marks)
    if (title.length < 10) return errors.push(`${at}: title is missing or too short.`)
    if (!SUBJECTS.includes(subject)) return errors.push(`${at}: subject must be one of the known subjects ("${subject}").`)
    if (!Number.isInteger(year) || year < 2007 || year > 2100) return errors.push(`${at}: year is missing or invalid.`)
    if (![1, 2].includes(marks)) return errors.push(`${at}: marks must be 1 or 2.`)
    const number = row.number ? Number(row.number) : undefined
    const id = String(row.id || `imp-${year}-${subject.slice(0, 3).toLowerCase()}-${number ?? i + 1}`).replace(/\s+/g, '-')
    if (seen.has(id)) return errors.push(`${at}: duplicate id "${id}", skipped.`)
    seen.add(id)
    const keys = ['A', 'B', 'C', 'D', 'E', 'F']
    const options = (Array.isArray(row.options) ? row.options : []).slice(0, 6).map((o, k) =>
      typeof o === 'string' ? { key: keys[k], text: o } : { key: String(o.key || keys[k]), text: String(o.text || '') },
    )
    const now = Date.now()
    const answer = String(row.answer || '').trim()
    questions.push({
      id,
      title,
      body: String(row.body || '').trim(),
      subject,
      topic: String(row.topic || '').trim().toLowerCase().replace(/\s+/g, '-') || undefined,
      tags: (Array.isArray(row.tags) ? row.tags : []).map((t) => String(t).toLowerCase()).slice(0, LIMITS.tagsMax),
      images: [],
      author,
      createdAt: now,
      votes: 0,
      voters: {},
      views: 0,
      year,
      number,
      marks,
      kind: String(row.kind || (options.length ? 'MCQ' : 'NAT')),
      options,
      answers: answer
        ? [
            {
              id: `key-${id}`,
              body: `Answer: ${answer}${row.explanation ? `\n\n${String(row.explanation).trim()}` : ''}`,
              images: [],
              author: 'GateQ answer key',
              createdAt: now,
              votes: 0,
              voters: {},
              comments: [],
            },
          ]
        : [],
      comments: [],
    })
  })
  return { questions, errors }
}

export const LIMITS = {
  titleMin: 10,
  titleMax: 160,
  bodyMax: 5000,
  tagsMax: 5,
  questionImages: 4,
  answerImages: 3,
  imageBytes: 2 * 1024 * 1024,
}

const QUESTIONS_KEY = 'gateq-questions-v2'

export function loadQuestions() {
  try {
    const raw = localStorage.getItem(QUESTIONS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// Returns false when the browser refuses to store more (for example, when the quota is full).
export function saveQuestions(questions) {
  try {
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions))
    return true
  } catch {
    return false
  }
}

export function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

// Votes are stored per user, so a user can only hold one vote on each item.
export function applyVote(item, user, direction) {
  const voters = { ...(item.voters || {}) }
  const previous = voters[user] || 0
  const next = previous === direction ? 0 : direction
  if (next) voters[user] = next
  else delete voters[user]
  return { ...item, voters, votes: (item.votes || 0) + (next - previous) }
}

// Reactions are our own set (names and emoji), styled in our own way.
export const REACTIONS = [
  { id: 'like', label: 'Like', emoji: '👍' },
  { id: 'love', label: 'Love', emoji: '❤️' },
  { id: 'haha', label: 'Haha', emoji: '😂' },
  { id: 'wow', label: 'Wow', emoji: '😮' },
  { id: 'sad', label: 'Sad', emoji: '😢' },
  { id: 'angry', label: 'Angry', emoji: '😠' },
]

// Choosing the same reaction again removes it. Choosing another one replaces it.
export function applyReaction(item, user, type) {
  const reactions = { ...(item.reactions || {}) }
  if (reactions[user] === type) delete reactions[user]
  else reactions[user] = type
  return { ...item, reactions }
}

export function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export function avatarColor(name = '') {
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % 360
  return `hsl(${hash} 42% 42%)`
}

export function initials(name = '') {
  return name.trim().slice(0, 2).toUpperCase() || '?'
}

export function timeAgo(timestamp) {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000))
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

// "10 Feb 2016, 9:42 am" in the visitor's own locale and time zone.
export function formatStamp(timestamp) {
  return new Date(timestamp).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// "Wednesday, 10 February 2016 at 9:42:00 am IST" for the hover tooltip.
export function formatFullStamp(timestamp) {
  return new Date(timestamp).toLocaleString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  })
}

// "just now", "5m ago", "3h ago", "12d ago", "4mo ago", "9y ago".
export function relativeTime(timestamp) {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000))
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(days / 365)}y ago`
}
