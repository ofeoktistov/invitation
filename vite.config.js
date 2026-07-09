import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Replace 'invitation-app' with your actual GitHub repo name
export default defineConfig({
  plugins: [react()],
  base: '/invitation-app/',
})
