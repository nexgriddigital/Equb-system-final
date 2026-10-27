import fs from 'fs';
import path from 'path';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import { defineConfig, Plugin } from 'vite';

/**
 * Custom Vite plugin to automatically duplicate index.html to 404.html
 * for SPA routing support on GitHub Pages.
 */
function githubPagesSpaPlugin(): Plugin {
  return {
    name: 'github-pages-spa',
    closeBundle() {
      const distPath = path.resolve('dist');
      const indexPath = path.join(distPath, 'index.html');
      const notFoundPath = path.join(distPath, '404.html');
      if (fs.existsSync(indexPath)) {
        fs.copyFileSync(indexPath, notFoundPath);
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  // If deployed on GitHub Pages in a repository subpath (e.g. /Equb-system-final/),
  // automatically extract repository name from GITHUB_REPOSITORY (or BASE_PATH), or fallback to './'
  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const base = mode === 'development'
    ? '/'
    : (process.env.BASE_PATH || (repoName ? `/${repoName}/` : './'));

  return {
    base,
    plugins: [
      react(),
      legacy({
        targets: ['chrome >= 60', 'android >= 6'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
        polyfills: true,
      }),
      githubPagesSpaPlugin(),
    ],
    build: {
      cssTarget: 'chrome60',
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (
              id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-is')
            ) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('node_modules/recharts')) {
              return 'vendor-charts';
            }
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
