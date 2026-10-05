import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' → derlenmiş çıktı herhangi bir klasörden / statik sunucudan açılabilir.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5173, open: false },
});
