import { describe, expect, it } from 'vitest'
import { parseImport } from './store.js'

describe('parseImport', () => {
  const row = { year: 2019, number: 3, marks: 1, subject: 'General Aptitude', topic: 'Verbal Ability', title: 'A sample question title', options: ['a', 'b', 'c', 'd'], answer: 'B' }

  it('builds a question with topic, marks, options and an answer key', () => {
    const { questions, errors } = parseImport(JSON.stringify([row]), 'Asha')
    expect(errors).toEqual([])
    expect(questions[0]).toMatchObject({ subject: 'General Aptitude', topic: 'verbal-ability', marks: 1, year: 2019 })
    expect(questions[0].options.map((o) => o.key)).toEqual(['A', 'B', 'C', 'D'])
    expect(questions[0].answers[0].body).toMatch(/^Answer: B/)
  })

  it('reports bad rows and duplicates instead of importing them', () => {
    const { questions, errors } = parseImport(JSON.stringify([row, row, { ...row, marks: 3 }]), 'Asha')
    expect(questions).toHaveLength(1)
    expect(errors).toHaveLength(2)
  })
})
