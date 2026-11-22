import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import '@fontsource-variable/plus-jakarta-sans'
import '@fontsource-variable/source-serif-4'
import App from './App.jsx'
import AuthProvider from './auth/AuthProvider.jsx'
import Background from './components/Background.jsx'
import CursorFx from './components/CursorFx.jsx'
import { initFx } from './fx/init.js'
import './index.css'
import './fx/fx.css'
import './theme/theme.css'
import './theme/pro.css'

initFx()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <Background />
      <CursorFx />
      <App />
    </AuthProvider>
  </StrictMode>,
)
