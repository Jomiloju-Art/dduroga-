import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
    watch: {
      /*
       * Nothing under tools/ is application source — it is the scratch and
       * verification-script directory. Watching it killed the dev server on
       * startup with `EBUSY: resource busy or locked` because a Chrome profile
       * had been created inside it (tools/_cdp-profile), and Chrome holds an
       * exclusive lock on its own Cookies database. The watcher threw and Vite
       * exited 1.
       *
       * Excluding the directory fixes the class of problem rather than the one
       * locked file, so no future scratch artefact can take the server down.
       */
      ignored: ['**/tools/**'],
    },
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Product ranges are per-product data like the catalogue; keep them
          // out of the entry bundle.
          if (id.includes('catalog.generated') || id.includes('productRanges.generated') || id.includes('localImages.generated')) return 'catalog';
        },
      },
    },
  },
});
