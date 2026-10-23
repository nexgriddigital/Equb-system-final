import fs from 'fs';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
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
    plugins: [react(), tailwindcss(), githubPagesSpaPlugin()],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
