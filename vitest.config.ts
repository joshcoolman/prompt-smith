import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '#': '/src',
      // `server-only` throws on import outside a React Server Component, so any
      // test touching a server module (credentials.ts) would fail to load. The
      // real guard is `next build`, which is what actually enforces the
      // boundary; here the package just has to be inert.
      'server-only': new URL('./src/test-server-only-stub.ts', import.meta.url).pathname,
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    passWithNoTests: true,
    exclude: ['**/node_modules/**', '**/.next/**'],
  },
})
