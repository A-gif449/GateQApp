// Light facts about the practice set. This file holds no question text, so it is safe to load
// before sign-in. The questions themselves live in pyq.js, which is only fetched after sign-in.

export const PRACTICE_YEARS = [2010, 2011, 2012, 2013, 2014, 2015, 2016]
export const PRACTICE_PER_YEAR = 30
export const PRACTICE_COUNT = PRACTICE_YEARS.length * PRACTICE_PER_YEAR

export function isPractice(id) {
  return typeof id === 'string' && id.startsWith('pyq-')
}
