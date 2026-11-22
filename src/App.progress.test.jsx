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

describe('GateQ progress, profiles and leaderboard', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    delete document.documentElement.dataset.theme
    window.location.hash = '#/questions'
  })

  it('marks a practice question as solved after signing in and saves it per user', async () => {
    render(<App />)
    await go('#/q/pyq-2012-1')
    await signIn('Asha')

    const button = await screen.findByRole('button', { name: /mark as solved/i })
    fireEvent.click(button)

    expect(await screen.findByRole('button', { name: /^solved$/i })).toHaveAttribute('aria-pressed', 'true')
    const saved = JSON.parse(localStorage.getItem('gateq-solved'))
    expect(Object.keys(saved.Asha)).toContain('pyq-2012-1')
  })

  it('keeps a practice question behind sign-in, so it cannot be marked solved anonymously', async () => {
    render(<App />)
    await go('#/q/pyq-2012-1')
    expect(screen.getByRole('heading', { name: /sign in to view this question/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /mark as solved/i })).not.toBeInTheDocument()
  })

  it('shows the leaderboard table with the signed-in user highlighted', async () => {
    render(<App />)
    await signIn('Asha')
    await go('#/leaderboard')

    const table = await screen.findByRole('table')
    const rows = within(table).getAllByRole('row')
    const mine = rows.find((r) => r.textContent.includes('Asha'))
    expect(mine).toBeDefined()
    expect(mine).toHaveClass('me')
  })

  it('opens a profile page by name and lets the owner save a bio', async () => {
    render(<App />)
    await signIn('Asha')
    await go('#/u/Asha')

    fireEvent.click(await screen.findByRole('button', { name: /edit bio/i }))
    const bio = screen.getByRole('textbox', { name: /^bio$/i })
    fireEvent.change(bio, { target: { value: 'Revising operating systems for GATE.' } })
    fireEvent.click(screen.getByRole('button', { name: /save bio/i }))

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('gateq-profiles'))
      expect(saved.Asha.bio).toBe('Revising operating systems for GATE.')
    })
  })

  it('records today as an active day when a user signs in', async () => {
    render(<App />)
    await signIn('Asha')
    const days = JSON.parse(localStorage.getItem('gateq-active-days'))
    expect(days.Asha).toHaveLength(1)
  })
})
