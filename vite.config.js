import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) return 'vendor-charts';
            if (id.includes('motion') || id.includes('lucide')) return 'vendor-ui';
            if (id.includes('react') || id.includes('supabase')) return 'vendor-core';
            return 'vendor';
          }
        }
      }
    }
  }
})
