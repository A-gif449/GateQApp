import { useEffect, useState } from 'react'
import { ClerkProvider } from '@clerk/react'
import { ui } from '@clerk/ui'
import { AUTH_ENABLED, CLERK_KEY, appUrl, authUrl } from './config.js'
import { buildAppearance } from './appearance.js'

// The app keeps its theme and accent on <html data-theme / data-accent>.
// Follow both so Clerk's cards switch with the toggle and the accent picker.
function useAppLook() {
  const read = () => ({
    theme: document.documentElement.dataset.theme || 'dark',
    accent: document.documentElement.dataset.accent || 'indigo',
  })
  const [look, setLook] = useState(read)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const next = read()
      setLook((prev) => (prev.theme === next.theme && prev.accent === next.accent ? prev : next))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-accent'] })
    return () => observer.disconnect()
  }, [])
  return look
}

function ClerkShell({ children }) {
  const { theme, accent } = useAppLook()
  return (
    <ClerkProvider
      publishableKey={CLERK_KEY}
      ui={ui}
      appearance={buildAppearance(theme, accent)}
      signInUrl={authUrl('sign-in')}
      signUpUrl={authUrl('sign-up')}
      afterSignOutUrl={appUrl('/')}
    >
      {children}
    </ClerkProvider>
  )
}

export default function AuthProvider({ children }) {
  return AUTH_ENABLED ? <ClerkShell>{children}</ClerkShell> : children
}
