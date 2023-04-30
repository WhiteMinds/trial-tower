import * as path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig({
  plugins: [svgr(), react()],
  resolve: {
    alias: {
      'hedra-engine': path.join(__dirname, '../hedra-engine/src'),
      'trial-tower-engine': path.join(__dirname, '../trial-tower-engine/src'),
    },
  },
})
