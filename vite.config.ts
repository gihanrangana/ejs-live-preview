import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    optimizeDeps: {
        exclude: ['lucide-react']
    },
    base: '/ejs-live-preview/',
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        assetsInlineLimit: 0,
        rollupOptions: {
            output: {
                manualChunks: undefined
            }
        }
    }
});
