# GIT

This file outlines rules for making commits, branches, issues, and PRs.

Always use American English.

## Tools

To use Git, you should use the GitHub MCP server. If the MCP sever is unavailable, try using `gh`. If neither the MCP server or `gh` are available please stop what you are doing and let me know about the issue. Workarounds, like using CURL to hit the GitHub API manually will not work.

## Labels

The following labels are available:

- bug ............... Something isn't working
- claude ............ This issue was created by Claude
- cleanup ........... Code cleanup is needed
- deferred .......... This will not be worked on - yet
- documentation ..... Improvements or additions to documentation
- duplicate ......... This issue or pull request already exists
- enhancement ....... New feature or request
- meta .............. Issue about issues
- question .......... Further information is requested
- wontfix ........... This will not be worked on
- high .............. This issue is high priority
- medium ............ This issue is medium priority
- low ............... This issue is low priority

Labels should always be applied to issues and PRs. The `claude` label should always be applied to work done by Claude.

## Branches

Top level branches should be named in this format:

`{type}-{issue number}/{issue name}`

Child branches, such as a branch that addresses a sub-issue, should be named in this format:

`{parent name}/{type}-{issue number}/{issue name}`

The type of a branch should be based on whichever label is most relevant to the issue that the branch is based off of. Labels like the priority levels, `claude`, or `deferred` should not be used as types.

If a branch name does not follow the appropriate format, the branch should be renamed.

If a branch is created that does not address a particular issue, the same name format should be followed but without an issue number and a reasonable type should be chose.

## Pull Requests

Before making a PR:

- Always run linting with `npm run lint`
- Always run prettier with `npm run format`
- Update `ARCHITECTURE.md` if necessary

When making a PR:

- Create the PR as a draft.
- If the PR targets a particular issue, include `closes #{issue number}` in the BODY of the PR. GitHub will detect this and automatically close the issue if the PR is approved.
- Unless the PR exclusively changes or adds documentation, a test plan should be included.
