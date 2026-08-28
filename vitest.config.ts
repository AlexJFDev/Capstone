import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfigFn from './vite.config'

export default mergeConfig(
  viteConfigFn({ mode: 'test', command: 'serve', isSsrBuild: false, isPreview: false }),
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: import.meta.dirname,
    },
  }),
)
