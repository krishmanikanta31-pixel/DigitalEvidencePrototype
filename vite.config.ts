import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Vercel serves from the domain root; GitHub Pages serves from
  // https://<user>.github.io/DigitalEvidencePrototype/
  base: process.env.VERCEL ? '/' : '/DigitalEvidencePrototype/',
  plugins: [react()],
})
