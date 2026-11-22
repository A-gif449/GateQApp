import { useEffect, useMemo, useState } from 'react'
import { useClerk, useUser } from '@clerk/react'
import { AUTH_ENABLED } from './config.js'

// The rest of the app identifies a person by one display name. Prefer the Clerk username,
// then the full name, then the part of the email before the @.
export function displayNameFor(user) {
  const email = user.primaryEmailAddress?.emailAddress?.split('@')[0]
  return (user.username || user.fullName || user.firstName || email || 'Learner').trim()
}

function useClerkUser() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { signOut } = useClerk()
  const name = isSignedIn && user ? displayNameFor(user) : null
  const imageUrl = isSignedIn && user ? user.imageUrl : null
  const id = isSignedIn && user ? user.id : null
  return useMemo(
    () => ({ loaded: isLoaded, user: name ? { name, imageUrl, id } : null, signOut }),
    [isLoaded, name, imageUrl, id, signOut],
  )
}

const DEMO = { loaded: true, user: null, signOut: () => {} }
function useDemoUser() {
  return DEMO
}

// AUTH_ENABLED never changes while the app runs, so the hook order is stable.
export const useAuthUser = AUTH_ENABLED ? useClerkUser : useDemoUser

// True when Clerk has not finished loading after a few seconds (blocked script, offline, wrong key).
export function useClerkStuck(loaded) {
  const [stuck, setStuck] = useState(false)
  useEffect(() => {
    if (!AUTH_ENABLED || loaded) return
    const id = setTimeout(() => setStuck(true), 8000)
    return () => clearTimeout(id)
  }, [loaded])
  return AUTH_ENABLED && !loaded && stuck
}
