import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.NODE_ENV': JSON.stringify(mode),
        'process.env.VITE_APP_NAME': JSON.stringify(env.VITE_APP_NAME || 'Boutique Measurement Hub'),
        'process.env.VITE_APP_VERSION': JSON.stringify(env.VITE_APP_VERSION || '1.0.0')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        sourcemap: mode === 'development',
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
              router: ['react-router-dom'],
              utils: ['date-fns', 'axios']
            }
          }
        },
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: mode === 'production',
            drop_debugger: mode === 'production'
          }
        }
      },
      server: {
        port: 3000,
        host: true,
        open: true
      },
      preview: {
        port: 4173,
        host: true
      }
    };
});
