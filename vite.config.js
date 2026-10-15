import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Dev-server proxy target, derived from VITE_API_BASE_URL (strip a trailing /api) — same setup as
  // the admin portal, so the app always calls the same-origin '/api' path and the login cookie works.
  const apiOrigin = (env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      // 5173 is the admin portal.
      port: 5174,
      proxy: {
        '/api': {
          target: apiOrigin,
          changeOrigin: true,
        },
      },
    },
  }
})
