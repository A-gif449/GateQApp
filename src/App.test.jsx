import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, within, waitFor, act } from '@testing-library/react'
import App from './App.jsx'
import { PRACTICE_QUESTIONS, PRACTICE_YEARS, PRACTICE_COUNT } from './data/pyq.js'

const STORAGE_KEY = 'gateq-questions-v2'

function seedQuestion(overrides = {}) {
  return {
    id: 'q1',
    title: 'What is the worst-case time complexity of quicksort?',
    body: 'I am revising sorting. Does a bad pivot always give quadratic time?',
    subject: 'Algorithms',
    tags: ['sorting'],
    images: [],
    author: 'Ravi',
    createdAt: Date.now() - 60_000,
    votes: 2,
    voters: {},
    views: 0,
    answers: [],
    comments: [],
    ...overrides,
  }
}

// Changing the hash fires hashchange asynchronously, so wait for React to re-render.
async function go(path) {
  await act(async () => {
    window.location.hash = path
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
}

async function signIn(name = 'Asha') {
  fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))
  const dialog = screen.getByRole('dialog', { name: /sign in/i })
  fireEvent.change(within(dialog).getByRole('textbox'), { target: { value: name } })
  fireEvent.click(within(dialog).getByRole('button', { name: /^sign in$/i }))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
}

describe('GateQ', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    delete document.documentElement.dataset.theme
    window.location.hash = '#/questions'
  })

  it('shows the GATE 2010-2016 practice set after sign-in and stores nothing for it', async () => {
    render(<App />)
    await signIn('Asha')
    await waitFor(() => expect(document.querySelectorAll('.qcard')).toHaveLength(10))
    expect(PRACTICE_QUESTIONS).toHaveLength(PRACTICE_COUNT)
    expect(PRACTICE_COUNT).toBe(PRACTICE_YEARS.length * 30)
    expect(localStorage.getItem(STORAGE_KEY)).toBe('[]')
  })

  it('hides every question from visitors who are not signed in', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([seedQuestion()]))
    render(<App />)

    // Board
    expect(screen.getByRole('heading', { name: /sign in to view questions/i })).toBeInTheDocument()
    expect(document.querySelectorAll('.qcard')).toHaveLength(0)
    expect(screen.queryByText(/worst-case time complexity of quicksort/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('complementary', { name: /filters/i })).not.toBeInTheDocument()

    // Search is locked
    expect(screen.getByRole('searchbox', { name: /search questions/i })).toBeDisabled()

    // A direct link to a community question and to a practice question
    await go('#/q/q1')
    expect(screen.getByRole('heading', { name: /sign in to view this question/i })).toBeInTheDocument()
    expect(screen.queryByText(/worst-case time complexity of quicksort/i)).not.toBeInTheDocument()
    await go('#/q/pyq-2012-1')
    expect(screen.getByRole('heading', { name: /sign in to view this question/i })).toBeInTheDocument()
    expect(document.querySelector('.options')).toBeNull()

    // Profiles list question activity, so they are gated too
    await go('#/u/Ravi')
    expect(screen.getByRole('heading', { name: /sign in to view profiles/i })).toBeInTheDocument()

    // The home page must not preview real questions
    await go('#/')
    expect(screen.queryByText(/hot right now/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/worst-case time complexity of quicksort/i)).not.toBeInTheDocument()
  })

  it('opens the sign-in dialog from the gate and shows the question afterwards', async () => {
    render(<App />)
    await go('#/q/pyq-2012-1')
    fireEvent.click(screen.getByRole('button', { name: /sign in to continue/i }))
    const dialog = screen.getByRole('dialog', { name: /sign in/i })
    fireEvent.change(within(dialog).getByRole('textbox'), { target: { value: 'Asha' } })
    fireEvent.click(within(dialog).getByRole('button', { name: /^sign in$/i }))
    expect(await screen.findByRole('list', { name: /answer choices/i })).toBeInTheDocument()
  })

  it('sets a practice question with its paper reference, choices and timestamp', async () => {
    render(<App />)
    await signIn('Asha')
    await go('#/q/pyq-2012-1')
    const choices = await screen.findByRole('list', { name: /answer choices/i })
    expect(within(choices).getAllByRole('listitem')).toHaveLength(4)
    expect(screen.getByText(/GATE CSE 2012 · Question 1/)).toBeInTheDocument()
    const stamp = document.querySelector('.detail-meta time')
    expect(stamp).toHaveAttribute('datetime')
    expect(stamp.textContent).toMatch(/2012/)
    expect(document.querySelector('.answer-verdict')?.textContent).toMatch(/^Answer: \([A-D]\)/)
  })

  it('filters the practice set by GATE year', async () => {
    render(<App />)
    await signIn('Asha')
    await waitFor(() => expect(document.querySelectorAll('.qcard')).toHaveLength(10))
    const sidebar = screen.getByRole('complementary', { name: /filters/i })
    fireEvent.click(within(sidebar).getByRole('button', { name: /gate cse 2012/i }))
    expect(document.querySelectorAll('.qcard')).toHaveLength(10)
    expect(document.querySelector('.lead, .list-head .muted')?.textContent ?? '').toMatch(/2012/)
  })

  it('lists saved community questions and filters them by search', async () => {
    localStorage.setItem('gateq-user', 'Asha')
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        seedQuestion(),
        seedQuestion({ id: 'q2', title: 'How does Huffman coding build prefix codes?', subject: 'Discrete Mathematics', tags: ['greedy'] }),
      ]),
    )
    render(<App />)
    fireEvent.change(screen.getByRole('searchbox', { name: /search questions/i }), {
      target: { value: 'huffman' },
    })
    await waitFor(() => expect(document.querySelectorAll('.qcard')).toHaveLength(1))
    expect(screen.getByRole('link', { name: /huffman/i })).toBeInTheDocument()
    // Each card carries a machine-readable timestamp
    expect(document.querySelector('.qcard time')).toHaveAttribute('datetime')
  })

  it('asks for sign-in before the ask form is shown', async () => {
    render(<App />)
    await go('#/ask')
    expect(screen.getByRole('heading', { name: /sign in to ask a question/i })).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /title/i })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /sign in to continue/i }))
    expect(screen.getByRole('dialog', { name: /sign in/i })).toBeInTheDocument()
  })

  it('validates a short title on the ask page', async () => {
    render(<App />)
    await signIn('Asha')
    await go('#/ask')
    fireEvent.change(screen.getByRole('textbox', { name: /title/i }), { target: { value: 'short' } })
    fireEvent.click(screen.getByRole('button', { name: /post question/i }))
    expect(screen.getByText(/at least 10 characters in the title/i)).toBeInTheDocument()
  })

  it('posts a question and opens its page', async () => {
    render(<App />)
    await signIn('Asha')
    await go('#/ask')
    fireEvent.change(screen.getByRole('textbox', { name: /title/i }), {
      target: { value: 'What is the time complexity of binary search?' },
    })
    fireEvent.click(screen.getByRole('button', { name: /post question/i }))

    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: /binary search/i })).toBeInTheDocument(),
    )
  })

  it('adds a tag with the Enter key on the ask page', async () => {
    render(<App />)
    await signIn('Asha')
    await go('#/ask')
    const tagField = screen.getByRole('textbox', { name: /^tags$/i })
    fireEvent.change(tagField, { target: { value: 'Heaps' } })
    fireEvent.keyDown(tagField, { key: 'Enter' })
    expect(screen.getByRole('button', { name: /remove tag heaps/i })).toBeInTheDocument()
  })

  it('rejects a non-image attachment', async () => {
    render(<App />)
    await signIn('Asha')
    await go('#/ask')
    const input = screen.getByLabelText('Images')
    const file = new File(['not an image'], 'notes.txt', { type: 'text/plain' })
    fireEvent.change(input, { target: { files: [file] } })
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/only image files/i))
  })

  it('accepts an image attachment and shows a thumbnail', async () => {
    render(<App />)
    await signIn('Asha')
    await go('#/ask')
    const input = screen.getByLabelText('Images')
    const file = new File(['pixels'], 'diagram.png', { type: 'image/png' })
    fireEvent.change(input, { target: { files: [file] } })
    await waitFor(() => expect(screen.getAllByRole('img', { name: /attachment 1/i }).length).toBeGreaterThan(0))
  })

  it('votes on a community question and removes the vote on a second click', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([seedQuestion()]))
    render(<App />)
    await signIn('Asha')
    await go('#/q/q1')

    const score = () => Number(screen.getByTestId('vote-score').textContent)
    const before = score()
    fireEvent.click(screen.getByRole('button', { name: /^upvote question$/i }))
    expect(score()).toBe(before + 1)
    fireEvent.click(screen.getByRole('button', { name: /^upvote question$/i }))
    expect(score()).toBe(before)
  })

  it('treats practice questions as read-only', async () => {
    render(<App />)
    await signIn('Asha')
    await go('#/q/pyq-2010-1')
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /^answer$/i })).not.toBeInTheDocument()
    expect(screen.getByText(/practice questions are read-only/i)).toBeInTheDocument()
  })

  it('adds a comment and an answer on a community question', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([seedQuestion()]))
    render(<App />)
    await signIn('Asha')
    await go('#/q/q1')

    const commentInput = screen.getAllByPlaceholderText('Add a comment')[0]
    fireEvent.change(commentInput, { target: { value: 'Good question, thanks for asking.' } })
    fireEvent.click(within(commentInput.closest('form')).getByRole('button', { name: /^comment$/i }))
    expect(screen.getByText('Good question, thanks for asking.')).toBeInTheDocument()

    fireEvent.change(screen.getByRole('textbox', { name: /^answer$/i }), {
      target: { value: 'Yes. With the first or last element as pivot on sorted input.' },
    })
    fireEvent.click(screen.getByRole('button', { name: /post answer/i }))
    await waitFor(() => expect(screen.getByRole('heading', { name: /1 answer/i })).toBeInTheDocument())
  })

  it('rejects an answer shorter than 10 characters', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([seedQuestion()]))
    render(<App />)
    await signIn('Asha')
    await go('#/q/q1')
    fireEvent.change(screen.getByRole('textbox', { name: /^answer$/i }), { target: { value: 'ok' } })
    fireEvent.click(screen.getByRole('button', { name: /post answer/i }))
    expect(screen.getByText(/at least 10 characters/i)).toBeInTheDocument()
  })

  it('toggles the theme and remembers the choice', () => {
    render(<App />)
    expect(document.documentElement.dataset.theme).toBe('dark')
    fireEvent.click(screen.getByRole('button', { name: /switch to light mode/i }))
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(localStorage.getItem('gateq-theme')).toBe('light')
  })
})
