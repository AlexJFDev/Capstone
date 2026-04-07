# Linting Proposal

## Context

The project already has a linting stack installed and configured — ESLint, oxlint, and Prettier were all included by the Vue project scaffolding tool. However, the current setup has two gaps:

1. **The rules are minimal.** ESLint is configured with `pluginVue.configs['flat/essential']`, which is the smallest Vue rule set and only catches a narrow class of mistakes. oxlint is configured with only `"correctness": "error"`, covering basic correctness issues. Neither catches style inconsistencies, suspicious patterns, or many common Vue-specific mistakes.

2. **Linting is not enforced.** Running `npm run lint` is a manual step with nothing requiring it before a commit or before a PR is merged. The IDE may surface some warnings, but these can be silently ignored.

The npm scripts for linting already exist:

```
lint:oxlint  →  oxlint . --fix
lint:eslint  →  eslint . --fix --cache
format       →  prettier --write --experimental-cli src/
lint         →  run-s lint:*
```

This proposal compares two approaches for making linting consistent and enforceable. Either option can be combined with a ruleset expansion; that concern is addressed at the end.

---

## Option A: CI Enforcement via GitHub Actions

Add a GitHub Actions workflow that runs `npm run lint` on every pull request to `development`. Lint failures block merging.

### What changes

A new file `.github/workflows/lint.yml` is added alongside the existing deploy and preview workflows. No new dependencies are required.

```yaml
name: Lint

on:
  pull_request:
    branches:
      - development

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - run: npm run lint
```

Because the existing `lint:eslint` script uses `--fix`, it would need to change to `eslint . --cache` (no `--fix`) in CI — otherwise the workflow silently applies fixes and passes even when the working tree had violations. The fix flags are still appropriate when running lint locally; this is handled by running `npm run lint` locally before pushing.

Alternatively, the fix scripts stay as-is and the CI workflow runs lint without `--fix` by calling `oxlint .` and `eslint .` directly, or by adding separate `lint:ci` scripts.

### Pros

- **No local setup required.** Contributors do not need to configure anything. The check runs automatically on every PR.
- **No new dependencies.** Uses infrastructure already in the project (GitHub Actions).
- **Enforcement at the right boundary.** Code that fails lint cannot land in `development` regardless of how it was committed.
- **Consistent environment.** Lint runs in the same clean Node environment on every PR, eliminating "it passes on my machine" issues.

### Cons

- **Slow feedback loop.** A developer only learns about lint failures after pushing and waiting for CI. Violations can accumulate across many commits before being surfaced.
- **Does not help during development.** Local editing sessions still have no automatic lint feedback beyond what the IDE provides.

---

## Option B: Pre-commit Hooks via Husky and lint-staged

Install `husky` to register a Git pre-commit hook and `lint-staged` to run linting on staged files before each commit. Commits with lint violations are blocked locally.

### What changes

Two packages are added as dev dependencies: `husky` and `lint-staged`.

```
npm install --save-dev husky lint-staged
npx husky init
```

A pre-commit hook is created at `.husky/pre-commit`:

```sh
npx lint-staged
```

A `lint-staged` configuration is added to `package.json`:

```json
"lint-staged": {
  "*.{vue,ts,mts,tsx}": [
    "oxlint --fix",
    "eslint --fix --cache"
  ],
  "*.{vue,ts,mts,tsx,json,css,md}": [
    "prettier --write"
  ]
}
```

Because lint-staged runs on staged files only, it is fast even in a large project.

### Pros

- **Immediate feedback.** Violations are caught at commit time — before they are ever pushed — keeping them from accumulating.
- **Automatic fixing.** The `--fix` flags in lint-staged mean many lint issues are corrected automatically as part of committing, rather than requiring a manual cleanup pass.
- **No CI dependency.** The enforcement is purely local and works with or without a remote.

### Cons

- **Two new dependencies.** `husky` and `lint-staged` are added to `devDependencies`. Both are well-established and widely used, but they are still packages to maintain.
- **Can be bypassed.** Any contributor can skip the hook with `git commit --no-verify`. This is sometimes necessary (e.g., committing a WIP) but also means enforcement is not absolute.
- **Local environment variation.** The hook runs in each developer's local Node environment, which may differ from the environment used by other contributors or CI.
- **Hook setup required.** New contributors must run `npm install` (which triggers `husky install` via a `prepare` script) for the hook to activate. If they skip `npm install`, the hook is absent.

---

## Ruleset Expansion

Regardless of which enforcement option is chosen, the current rules are narrow enough that they may not catch real problems. Two targeted expansions are worth considering:

### Vue rules: `essential` → `recommended`

The current ESLint config uses `pluginVue.configs['flat/essential']`. Changing this to `pluginVue.configs['flat/recommended']` enables the full recommended Vue 3 rule set, which catches a wider range of component authoring mistakes (e.g., attribute ordering, `v-bind` shorthand consistency, slot usage).

The change is one line in `eslint.config.ts`:

```diff
- ...pluginVue.configs['flat/essential'],
+ ...pluginVue.configs['flat/recommended'],
```

Running `npm run lint` after this change will surface any existing violations, which can be fixed or selectively disabled before the config is committed.

### oxlint: add `suspicious` and `pedantic` categories

The current `.oxlintrc.json` enables only `"correctness": "error"`. Adding `"suspicious"` catches patterns that are likely bugs even if syntactically valid. Adding `"pedantic"` enforces stricter code quality rules.

```json
{
  "categories": {
    "correctness": "error",
    "suspicious": "warn",
    "pedantic": "warn"
  }
}
```

Using `"warn"` rather than `"error"` for the new categories avoids making every new category a blocker immediately. They can be promoted to `"error"` once the codebase is clean.

---

## Comparison

|  | Option A (CI) | Option B (Husky) |
|---|---|---|
| New dependencies | None | `husky`, `lint-staged` |
| Enforcement boundary | PR merge | Local commit |
| Feedback speed | Slow (after push) | Fast (at commit) |
| Bypassable | Only by force-merge | `git commit --no-verify` |
| Setup required | None | `npm install` |
| Works without GitHub | No | Yes |

---

## Recommendation

**Option A (CI enforcement) is recommended** for this project. It requires no new dependencies, no local setup from contributors, and enforces linting at the most important boundary — the PR — without requiring anyone to remember to run anything. The slower feedback loop is acceptable given the single-developer workflow: running `npm run lint` before pushing is a low-friction habit, and the CI check acts as a backstop.

**Option B (Husky)** is the better choice in a multi-contributor project where local enforcement prevents PRs from arriving already full of lint violations. For this project's current scale, the added dependency surface is not justified by the benefit.

Regardless of which option is chosen, upgrading from `flat/essential` to `flat/recommended` for the Vue rules is worthwhile. The additional rules catch real authoring mistakes and the migration cost is low.
