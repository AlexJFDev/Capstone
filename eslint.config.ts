import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginPlaywright from 'eslint-plugin-playwright'
import pluginVitest from '@vitest/eslint-plugin'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from 'eslint-config-prettier/flat'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  ...pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,

  {
    ...pluginPlaywright.configs['flat/recommended'],
    files: ['e2e/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  {
    rules: {
      'vue/valid-v-slot': ['error', { allowModifiers: true }],
    },
  },

  {
    files: ['src/**/*.{ts,vue}'],
    plugins: {
      header: {
        rules: {
          header: {
            meta: {
              type: 'layout',
              schema: [],
              messages: {
                missing:
                  'File must begin with a comment describing its purpose (// for .ts, <!-- --> for .vue).',
              },
            },
            create(context: { sourceCode: { text: string }; report: (o: object) => void }) {
              return {
                Program(node: object) {
                  const src = context.sourceCode.text
                  const body = src.startsWith('#!') ? src.slice(src.indexOf('\n') + 1) : src
                  const trimmed = body.trimStart()
                  if (!trimmed.startsWith('//') && !trimmed.startsWith('<!--')) {
                    context.report({ node, messageId: 'missing' })
                  }
                },
              }
            },
          },
        },
      },
    },
    rules: {
      'header/header': 'error',
    },
  },

  skipFormatting,
)
