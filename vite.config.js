// Vite build/dev configuration.
// - `host: true` exposes the dev server on the LAN so a phone can open the app.
// - SerpAPI sends no CORS headers, so browser calls go through this dev proxy
//   (/proxy/serpapi/* -> https://serpapi.com/*). In production, point
//   VITE_SERPAPI_BASE_URL at your own backend proxy instead.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/proxy/serpapi': {
        target: 'https://serpapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/serpapi/, ''),
      },
    },
  },
});
