import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    // Tests exercise the demo sign-in, so keep Clerk off even if a local key exists.
    env: { VITE_CLERK_PUBLISHABLE_KEY: '' },
    globals: true,
    setupFiles: ['./src/test/setup.js'],
  },
})
