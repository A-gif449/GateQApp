// Profiles, points, levels, badges, streaks, and practice progress.
// Everything is computed from data saved in this browser (localStorage). Nothing is sent anywhere.
import {
  Award,
  Flame,
  GraduationCap,
  HelpCircle,
  Image as ImageIcon,
  MessageCircle,
  MessageSquare,
  Star,
  Target,
  ThumbsUp,
  Trophy,
  Zap,
} from 'lucide-react'

const PROFILES_KEY = 'gateq-profiles'
const SOLVED_KEY = 'gateq-solved'
const DAYS_KEY = 'gateq-active-days'
const DAY_MS = 24 * 60 * 60 * 1000
const SYSTEM_AUTHORS = ['GateQ practice', 'GateQ answer key']

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/* ---------- Profiles ---------- */

export function getProfiles() {
  return read(PROFILES_KEY, {})
}

export function ensureProfile(name) {
  const all = getProfiles()
  if (!all[name]) {
    all[name] = { bio: '', createdAt: Date.now() }
    write(PROFILES_KEY, all)
  }
  return all[name]
}

export function updateProfile(name, patch) {
  const all = getProfiles()
  all[name] = { bio: '', createdAt: Date.now(), ...(all[name] || {}), ...patch }
  write(PROFILES_KEY, all)
  return all[name]
}

/* ---------- Practice progress (per user, stores the time each question was solved) ---------- */

export function getSolved(user) {
  return read(SOLVED_KEY, {})[user] || {}
}

export function toggleSolved(user, id) {
  const all = read(SOLVED_KEY, {})
  const mine = { ...(all[user] || {}) }
  if (mine[id]) delete mine[id]
  else mine[id] = Date.now()
  all[user] = mine
  write(SOLVED_KEY, all)
  return mine
}

/* ---------- Active days and streaks ---------- */

export function dayKey(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getDays(user) {
  return read(DAYS_KEY, {})[user] || []
}

export function recordActiveDay(user) {
  const all = read(DAYS_KEY, {})
  const days = new Set(all[user] || [])
  days.add(dayKey(Date.now()))
  all[user] = [...days].sort()
  write(DAYS_KEY, all)
  return all[user]
}

export function currentStreak(days, now = Date.now()) {
  const set = new Set(days)
  let streak = 0
  let t = now
  while (set.has(dayKey(t))) {
    streak += 1
    t -= DAY_MS
  }
  return streak
}

/* ---------- Stats, points, levels ---------- */

// Community activity only. Practice questions and their answer keys are excluded.
export function computeUserStats(questions, name, solved = {}, days = []) {
  const s = { asked: 0, answers: 0, comments: 0, upvotes: 0, images: 0, helpful: 0, solved: Object.keys(solved).length }
  for (const q of questions) {
    const community = q.year === undefined
    if (community && q.author === name) {
      s.asked += 1
      s.upvotes += Math.max(0, q.votes || 0)
      s.images += q.images.length
    }
    for (const c of q.comments) if (c.author === name) s.comments += 1
    for (const a of q.answers) {
      if (a.author === name) {
        s.answers += 1
        s.upvotes += Math.max(0, a.votes || 0)
        s.images += a.images.length
        if (a.votes >= 3) s.helpful += 1
      }
      for (const c of a.comments) if (c.author === name) s.comments += 1
    }
  }
  s.streak = currentStreak(days)
  s.activeDays = days.length
  return s
}

export function computePoints(s) {
  return s.asked * 5 + s.answers * 10 + s.comments * 2 + s.upvotes * 2 + s.solved * 3
}

export const LEVELS = [
  { min: 0, name: 'Newcomer' },
  { min: 50, name: 'Learner' },
  { min: 150, name: 'Contributor' },
  { min: 400, name: 'Expert' },
  { min: 1000, name: 'Master' },
]

export function levelFor(points) {
  let index = 0
  for (let i = 0; i < LEVELS.length; i += 1) if (points >= LEVELS[i].min) index = i
  const next = LEVELS[index + 1] || null
  const floor = LEVELS[index].min
  const progress = next ? (points - floor) / (next.min - floor) : 1
  return { index, name: LEVELS[index].name, next, progress: Math.min(1, progress) }
}

/* ---------- Badges ---------- */

export const BADGES = [
  { id: 'first-question', title: 'First Question', description: 'Ask your first question.', icon: HelpCircle, test: (s) => s.asked >= 1 },
  { id: 'first-answer', title: 'First Answer', description: 'Post your first answer.', icon: MessageSquare, test: (s) => s.answers >= 1 },
  { id: 'helpful', title: 'Helpful', description: 'Get an answer to three or more net votes.', icon: ThumbsUp, test: (s) => s.helpful >= 1 },
  { id: 'curious', title: 'Curious Mind', description: 'Ask five questions.', icon: Flame, test: (s) => s.asked >= 5 },
  { id: 'picture-perfect', title: 'Picture Perfect', description: 'Attach an image to a post.', icon: ImageIcon, test: (s) => s.images >= 1 },
  { id: 'conversationalist', title: 'Conversationalist', description: 'Leave ten comments.', icon: MessageCircle, test: (s) => s.comments >= 10 },
  { id: 'practitioner', title: 'Practitioner', description: 'Mark ten practice questions solved.', icon: Target, test: (s) => s.solved >= 10 },
  { id: 'scholar', title: 'Scholar', description: 'Mark fifty practice questions solved.', icon: GraduationCap, test: (s) => s.solved >= 50 },
  { id: 'on-a-roll', title: 'On a Roll', description: 'Be active seven days in a row.', icon: Zap, test: (s) => s.streak >= 7 },
  { id: 'rising-star', title: 'Rising Star', description: 'Reach 50 points.', icon: Star, test: (s, p) => p >= 50 },
  { id: 'champion', title: 'Champion', description: 'Reach 200 points.', icon: Trophy, test: (s, p) => p >= 200 },
]

export function computeBadges(stats, points) {
  return BADGES.map((b) => ({ ...b, unlocked: b.test(stats, points) }))
}

export { Award }

/* ---------- Users and leaderboard ---------- */

export function allUserNames(questions, profiles) {
  const names = new Set(Object.keys(profiles))
  for (const q of questions) {
    if (q.year === undefined) names.add(q.author)
    for (const c of q.comments) names.add(c.author)
    for (const a of q.answers) {
      names.add(a.author)
      for (const c of a.comments) names.add(c.author)
    }
  }
  return [...names].filter((n) => n && !SYSTEM_AUTHORS.includes(n))
}

// currentUser's own solved/day data comes from state so it stays fresh; everyone else is read from storage.
export function buildRows(questions, names, currentUser, ownSolved, ownDays) {
  return names
    .map((name) => {
      const own = name === currentUser
      const stats = computeUserStats(questions, name, own ? ownSolved : getSolved(name), own ? ownDays : getDays(name))
      const points = computePoints(stats)
      const badges = computeBadges(stats, points)
      return {
        name,
        stats,
        points,
        level: levelFor(points),
        badgeCount: badges.filter((b) => b.unlocked).length,
      }
    })
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name))
}
