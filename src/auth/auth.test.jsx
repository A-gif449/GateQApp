import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

// Turn Clerk mode on and replace the Clerk SDK with light stand-ins we can control.
vi.mock('./config.js', async (importOriginal) => ({ ...(await importOriginal()), AUTH_ENABLED: true }))

const session = { isLoaded: true, isSignedIn: false, user: null }
const signOut = vi.fn()

vi.mock('@clerk/react', () => ({
  ClerkProvider: ({ children }) => children,
  useUser: () => session,
  useClerk: () => ({ signOut }),
  SignIn: (props) => <div data-testid="clerk-sign-in" data-routing={props.routing} />,
  SignUp: (props) => <div data-testid="clerk-sign-up" data-routing={props.routing} />,
  UserProfile: (props) => <div data-testid="clerk-user-profile" data-routing={props.routing} />,
  UserButton: () => <button type="button">Account menu</button>,
  AuthenticateWithRedirectCallback: () => <div data-testid="clerk-callback" />,
}))

const { default: App } = await import('../App.jsx')

async function go(path) {
  await act(async () => {
    window.location.hash = path
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
}

async function goAuth(page) {
  await act(async () => {
    window.history.pushState(null, '', `/?auth=${page}#/`)
    window.dispatchEvent(new Event('gateq-route'))
  })
}

function signedIn(user = { username: 'asha_k', fullName: 'Asha K', imageUrl: 'x.png', id: 'user_1' }) {
  Object.assign(session, { isLoaded: true, isSignedIn: true, user })
}

describe('GateQ with Clerk', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    delete document.documentElement.dataset.theme
    Object.assign(session, { isLoaded: true, isSignedIn: false, user: null })
    signOut.mockClear()
    window.history.replaceState(null, '', '/')
    window.location.hash = '#/questions'
  })

  it('shows Sign in and Sign up in the header when signed out', async () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^sign up$/i })).toBeInTheDocument()
  })

  it('opens the Clerk sign-in page and remembers where to return', async () => {
    render(<App />)
    await go('#/learn')
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))
    expect(await screen.findByTestId('clerk-sign-in')).toHaveAttribute('data-routing', 'hash')
    expect(sessionStorage.getItem('gateq-return-to')).toBe('/learn')
    // Clerk owns the hash, so the page is identified by ?auth= and the hash stays free.
    expect(window.location.search).toBe('?auth=sign-in')
  })

  it('opens the Clerk sign-up page from the header', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }))
    expect(await screen.findByTestId('clerk-sign-up')).toBeInTheDocument()
  })

  it('asks signed-out visitors to sign in before asking a question', async () => {
    render(<App />)
    await go('#/ask')
    expect(await screen.findByRole('heading', { name: /sign in to ask a question/i })).toBeInTheDocument()
  })

  it('hides the question board and question pages from signed-out visitors', async () => {
    render(<App />)
    expect(await screen.findByRole('heading', { name: /sign in to view questions/i })).toBeInTheDocument()
    expect(document.querySelectorAll('.qcard')).toHaveLength(0)
    expect(screen.getByRole('searchbox', { name: /search questions/i })).toBeDisabled()
    await go('#/q/pyq-2012-1')
    expect(await screen.findByRole('heading', { name: /sign in to view this question/i })).toBeInTheDocument()
    // Opening the gate goes to the Clerk sign-in page and remembers where to return
    fireEvent.click(screen.getByRole('button', { name: /sign in to continue/i }))
    expect(new URLSearchParams(window.location.search).get('auth')).toBe('sign-in')
    expect(sessionStorage.getItem('gateq-return-to')).toBe('/q/pyq-2012-1')
  })

  it('shows the questions to a signed-in Clerk user', async () => {
    signedIn()
    render(<App />)
    await go('#/questions')
    expect(await screen.findAllByRole('heading', { level: 2, name: /\?$/ })).not.toHaveLength(0)
    expect(document.querySelectorAll('.qcard')).toHaveLength(10)
  })

  it('does not send a visitor to sign in while the session is still loading', async () => {
    Object.assign(session, { isLoaded: false, isSignedIn: undefined, user: null })
    render(<App />)
    await go('#/ask')
    expect(await screen.findByText(/checking your session/i)).toBeInTheDocument()
    expect(window.location.hash).toBe('#/ask')
  })

  it('uses the Clerk username as the display name and shows the account menu', async () => {
    signedIn()
    render(<App />)
    expect(screen.getByText('asha_k')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /account menu/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^sign in$/i })).not.toBeInTheDocument()
  })

  it('falls back to the full name, then the email, when there is no username', async () => {
    signedIn({ username: null, fullName: 'Asha Kumar', primaryEmailAddress: { emailAddress: 'a@x.com' }, id: 'u' })
    const { unmount } = render(<App />)
    expect(screen.getByText('Asha Kumar')).toBeInTheDocument()
    unmount()
    signedIn({ username: null, fullName: null, firstName: null, primaryEmailAddress: { emailAddress: 'ravi@x.com' }, id: 'u' })
    render(<App />)
    expect(screen.getByText('ravi')).toBeInTheDocument()
  })

  it('records progress under the signed-in name', async () => {
    signedIn()
    render(<App />)
    await go('#/q/pyq-2012-1')
    fireEvent.click(await screen.findByRole('button', { name: /mark as solved/i }))
    expect(await screen.findByRole('button', { name: /^solved$/i })).toHaveAttribute('aria-pressed', 'true')
    expect(Object.keys(JSON.parse(localStorage.getItem('gateq-solved'))['asha_k'])).toContain('pyq-2012-1')
  })

  it('shows the ask form and the Clerk account page when signed in', async () => {
    signedIn()
    render(<App />)
    await go('#/ask')
    expect(screen.queryByRole('heading', { name: /sign in to ask a question/i })).not.toBeInTheDocument()
    await goAuth('account')
    expect(await screen.findByTestId('clerk-user-profile')).toHaveAttribute('data-routing', 'hash')
  })

  it('protects the account page for signed-out visitors', async () => {
    render(<App />)
    await goAuth('account')
    expect(await screen.findByRole('heading', { name: /sign in to manage your account/i })).toBeInTheDocument()
  })

  it('shows the sign-up page straight from an ?auth=sign-up link', async () => {
    window.history.replaceState(null, '', '/?auth=sign-up#/')
    render(<App />)
    expect(await screen.findByTestId('clerk-sign-up')).toBeInTheDocument()
  })

  it('stays on the auth page while Clerk moves through its own steps in the hash', async () => {
    window.history.replaceState(null, '', '/?auth=sign-in#/')
    render(<App />)
    await go('#/factor-one')
    expect(screen.getByTestId('clerk-sign-in')).toBeInTheDocument()
    await go('#/sso-callback?__clerk_status=verified')
    expect(screen.getByTestId('clerk-sign-in')).toBeInTheDocument()
  })

  it('leaves the auth page when a normal nav link is clicked', async () => {
    window.history.replaceState(null, '', '/?auth=sign-in#/')
    render(<App />)
    expect(await screen.findByTestId('clerk-sign-in')).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(screen.getByRole('link', { name: /^learn$/i }))
    })
    expect(screen.queryByTestId('clerk-sign-in')).not.toBeInTheDocument()
    expect(window.location.search).toBe('')
    expect(window.location.hash).toBe('#/learn')
  })
})
