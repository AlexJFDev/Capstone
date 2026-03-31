# CLAUDE.md

Instructions for Claude agents.

- Always running linting with `npm run lint` before making commits.
- Commit often.
- Before you start working, look at `README.md` to better understand the goals of the project.
- Before you start working, look at the contents of `docs/` and especially `docs/decisions.md` to understand my design philosophy.
- Before you start working, look at `ARCHITECTURE.md` to better understand the structure of the app.
- You should never modify `docs/decisions.md`.
- When making a pull request, rename the branch if necessary. Branches should be named as follows: `{type (bug, enhancement, cleanup, etc)}-{issue number}/{name}`
- When making a pull request that targets a particular issue, put closes #{issue number} in the BODY of the PR so GitHub can connect the issue to the PR. Do not put the issue number in the PR title because GitHub cannot detect that.
- Unless a pull request exclusively adds documentation, you should always include a test plan.
- You should make pull requests as drafts.
- If necessary, update `ARCHITECTURE.md` when making a PR.
- When making new files in `src/` be sure to include a header comment at the top of the file explaining its purpose.
- When modifying files in `src/` be sure to update the header comment if necessary.
