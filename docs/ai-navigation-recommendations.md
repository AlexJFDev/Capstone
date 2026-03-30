# AI Navigation Recommendations

Findings from an analysis of what makes this codebase expensive for an AI agent to navigate. Listed roughly by impact per effort.

## 1. File-level header comments (highest ROI)

Most `.vue` and `.ts` files have no description of their purpose. When an agent searches for something, it often gets back a list of candidate files and has to open several to find the right one. A single comment at the top of each file means the file's role is visible in Grep results without opening the file.

Example:

```typescript
// Renders a single draggable Gantt bar. Emits date updates via drag gestures on left/right handles.
```

Files that would benefit most: everything under `src/components/roadmap/` and `src/stores/*/` — the parts of the codebase that are non-obvious from filename alone.

## 2. Architecture / navigation map

There is currently no single file that describes the module structure and answers "where do I look for X?" An agent starting a task has to piece together the structure by reading multiple files.

A concise document covering:
- Directory responsibilities
- The store composition pattern (index/initialization/validation/accessors/mutations)
- The roadmap component hierarchy
- A task-to-file mapping ("if you want to add a route, look here")

This is a one-time investment that eliminates repeated re-discovery on every new task.

## 3. Inline type documentation for non-obvious design decisions

`src/types.ts` is small and clean but the reasoning behind key choices isn't present. For example:
- Why `Workspace.items` is `string[]` rather than `Item[]` (to allow items in multiple workspaces)
- Why IDs have `w-` and `i-` prefixes (self-describing, easy to validate by format)

These decisions exist in `docs/decisions.md` but an agent reading `types.ts` doesn't know to look there. A short JSDoc comment on the relevant fields closes that gap without requiring cross-file navigation.

## 4. Store sub-module purpose comments

The `stores/{domain}/` composition pattern (splitting a store into initialization, validation, accessors, mutations) is consistent and well-structured, but there is no comment explaining the pattern or what each file's role is. An agent encountering a store for the first time reads all four files to understand the split.

A block comment at the top of each sub-module file (e.g., "Read-only accessors; all validate existence before returning") would make the pattern immediately legible.

## 5. Cross-references from `decisions.md` to affected files

`decisions.md` records why decisions were made but doesn't reference which files implement them. An agent that finds a decision relevant to a task still has to locate the implementation separately.

Adding a `(see: src/foo.ts)` note to each decision entry creates a direct bridge from rationale to code.

---

## What to skip

- JSDoc on every function — high word count, low navigational value for an agent that reads code directly
- Prop documentation on every component — Vuetify conventions are familiar; custom props are usually self-evident
- README expansion — the README is appropriately scoped to user-facing information; deepening it doesn't help code navigation
