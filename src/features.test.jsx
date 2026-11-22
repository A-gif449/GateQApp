import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, within, waitFor, act } from '@testing-library/react'
import App from './App.jsx'

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

const seeded = {
  id: 'q1',
  title: 'Which tree has the fewest leaves for n nodes?',
  body: 'A question for testing reactions on a community post.',
  subject: 'Data Structures',
  tags: ['trees'],
  images: [],
  author: 'Ravi',
  createdAt: Date.now() - 60_000,
  votes: 0,
  voters: {},
  views: 0,
  answers: [],
  comments: [],
}

describe('GateQ homepage, learn section and reactions', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    delete document.documentElement.dataset.theme
    window.location.hash = ''
  })

  it('shows the homepage on the first visit', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /learn gate cse the smart way/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /browse questions/i })).toHaveAttribute('href', '#/questions')
  })

  it('lists only GO Classes playlists when that channel is chosen, with credit', async () => {
    render(<App />)
    await go('#/learn')

    fireEvent.click(screen.getByRole('button', { name: /^GO Classes/i }))
    expect(screen.getAllByRole('button', { name: /watch here/i })).toHaveLength(12)

    fireEvent.click(screen.getAllByRole('button', { name: /watch here/i })[0])
    const frame = await screen.findByTitle(/playlist by GO Classes/i)
    expect(frame.getAttribute('src')).toContain('list=PLIPZ2_p3RNHhGLQ1ZT37KLpBMAD90CM4_')
    expect(screen.getAllByText(/GO Classes/).length).toBeGreaterThan(1)
  })

  it('shows a clear note when NPTEL has no playlists yet', async () => {
    render(<App />)
    await go('#/learn')
    fireEvent.click(screen.getByRole('button', { name: /^NPTEL/i }))
    expect(screen.getByText(/NPTEL playlists will appear here/i)).toBeInTheDocument()
  })

  it('reacts with Love from the picker and saves it for the user', async () => {
    localStorage.setItem('gateq-questions-v2', JSON.stringify([seeded]))
    render(<App />)
    await go('#/q/q1')
    await signIn('Asha')

    const reactButton = screen.getByRole('button', { name: /react to question/i })
    fireEvent.mouseEnter(reactButton.parentElement)
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Love' }))

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('gateq-questions-v2'))
      expect(saved[0].reactions).toEqual({ Asha: 'love' })
    })
  })

  it('removes a reaction when the same one is chosen again', async () => {
    localStorage.setItem('gateq-questions-v2', JSON.stringify([{ ...seeded, reactions: { Asha: 'wow' } }]))
    render(<App />)
    await go('#/q/q1')
    await signIn('Asha')

    const reactButton = screen.getByRole('button', { name: /react to question/i })
    fireEvent.mouseEnter(reactButton.parentElement)
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Wow' }))

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('gateq-questions-v2'))
      expect(saved[0].reactions).toEqual({})
    })
  })
})
