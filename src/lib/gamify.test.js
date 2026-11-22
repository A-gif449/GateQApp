import { describe, it, expect, beforeEach } from 'vitest'
import {
  computePoints,
  levelFor,
  computeBadges,
  computeUserStats,
  currentStreak,
  dayKey,
  toggleSolved,
  getSolved,
  ensureProfile,
  updateProfile,
  getProfiles,
  buildRows,
  allUserNames,
} from './gamify.js'

const DAY = 24 * 60 * 60 * 1000

function question(overrides = {}) {
  return {
    id: 'c1',
    title: 'Community question',
    body: '',
    subject: 'Algorithms',
    tags: [],
    images: [],
    author: 'Asha',
    createdAt: 0,
    votes: 0,
    voters: {},
    views: 0,
    answers: [],
    comments: [],
    ...overrides,
  }
}

describe('computePoints', () => {
  it('weights each activity type', () => {
    const stats = { asked: 1, answers: 1, comments: 1, upvotes: 1, solved: 1 }
    // 5 + 10 + 2 + 2 + 3
    expect(computePoints(stats)).toBe(22)
  })

  it('returns zero for an empty profile', () => {
    expect(computePoints({ asked: 0, answers: 0, comments: 0, upvotes: 0, solved: 0 })).toBe(0)
  })
})

describe('levelFor', () => {
  it('starts at Newcomer with zero progress toward the next level', () => {
    const level = levelFor(0)
    expect(level.name).toBe('Newcomer')
    expect(level.index).toBe(0)
    expect(level.progress).toBe(0)
  })

  it('moves to the next level at its threshold and reports progress', () => {
    const level = levelFor(100)
    expect(level.name).toBe('Learner')
    expect(level.next.name).toBe('Contributor')
    // 100 is halfway from 50 to 150
    expect(level.progress).toBeCloseTo(0.5)
  })

  it('caps at Master with no next level', () => {
    const level = levelFor(5000)
    expect(level.name).toBe('Master')
    expect(level.next).toBeNull()
    expect(level.progress).toBe(1)
  })
})

describe('computeBadges', () => {
  it('unlocks first-question once the user has asked one question', () => {
    const stats = { asked: 1, answers: 0, comments: 0, upvotes: 0, images: 0, helpful: 0, solved: 0, streak: 0 }
    const badges = computeBadges(stats, 5)
    expect(badges.find((b) => b.id === 'first-question').unlocked).toBe(true)
    expect(badges.find((b) => b.id === 'first-answer').unlocked).toBe(false)
  })

  it('unlocks points-based badges from the point total', () => {
    const stats = { asked: 0, answers: 0, comments: 0, upvotes: 0, images: 0, helpful: 0, solved: 0, streak: 0 }
    const badges = computeBadges(stats, 200)
    expect(badges.find((b) => b.id === 'rising-star').unlocked).toBe(true)
    expect(badges.find((b) => b.id === 'champion').unlocked).toBe(true)
  })
})

describe('computeUserStats', () => {
  it('counts community posts but ignores practice questions', () => {
    const community = question({ id: 'c1', author: 'Asha', votes: 4 })
    const practice = question({ id: 'pyq-2012-1', author: 'GateQ practice', year: 2012, votes: 9 })
    const stats = computeUserStats([community, practice], 'Asha')
    expect(stats.asked).toBe(1)
    expect(stats.upvotes).toBe(4)
  })

  it('counts answers, helpful answers and comments', () => {
    const q = question({
      id: 'c2',
      author: 'Ravi',
      comments: [{ id: 'x', author: 'Asha', body: 'hi', votes: 0 }],
      answers: [
        { id: 'a1', author: 'Asha', body: 'answer', images: [], votes: 3, comments: [] },
      ],
    })
    const stats = computeUserStats([q], 'Asha')
    expect(stats.answers).toBe(1)
    expect(stats.helpful).toBe(1)
    expect(stats.comments).toBe(1)
  })
})

describe('streaks', () => {
  it('counts consecutive days ending today', () => {
    const now = Date.now()
    const days = [dayKey(now), dayKey(now - DAY), dayKey(now - 2 * DAY)]
    expect(currentStreak(days, now)).toBe(3)
  })

  it('breaks the streak when a day is missing', () => {
    const now = Date.now()
    expect(currentStreak([dayKey(now), dayKey(now - 2 * DAY)], now)).toBe(1)
  })
})

describe('local storage helpers', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('toggles a solved question on and off per user', () => {
    toggleSolved('Asha', 'pyq-2010-1')
    expect(getSolved('Asha')['pyq-2010-1']).toBeTypeOf('number')
    toggleSolved('Asha', 'pyq-2010-1')
    expect(getSolved('Asha')['pyq-2010-1']).toBeUndefined()
  })

  it('keeps solved state separate between users', () => {
    toggleSolved('Asha', 'pyq-2010-1')
    expect(getSolved('Ravi')).toEqual({})
  })

  it('creates a profile once and updates only the given fields', () => {
    ensureProfile('Asha')
    updateProfile('Asha', { bio: 'Revising DBMS' })
    const profiles = getProfiles()
    expect(profiles.Asha.bio).toBe('Revising DBMS')
    expect(typeof profiles.Asha.createdAt).toBe('number')
  })

  it('lists community authors and profiles without the practice authors', () => {
    ensureProfile('Asha')
    const names = allUserNames([question({ author: 'Ravi' }), question({ id: 'p', author: 'GateQ answer key', year: 2011 })], getProfiles())
    expect(names.sort()).toEqual(['Asha', 'Ravi'])
  })

  it('ranks rows by points, highest first', () => {
    const qs = [question({ author: 'Ravi', votes: 10 }), question({ id: 'c9', author: 'Asha', votes: 0 })]
    const rows = buildRows(qs, ['Asha', 'Ravi'], 'Asha', {}, [])
    expect(rows[0].name).toBe('Ravi')
    expect(rows[0].points).toBeGreaterThan(rows[1].points)
  })
})
