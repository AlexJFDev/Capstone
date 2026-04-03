# Decisions

User generated file. Agents should NOT modify this file. This file is intended to keep a record of development decisions and explain why those decisions were made. I will always have agents make proposals for changes which I will review and choose to adopt or not. This process ensures that I understand the code agents are writing and I am making long term decisions.

## Item Panels

When created the item panels, Claude generated a proposal with two approaches. Details are found in [`item-panels-proposal.md`](proposals/item-panels-proposal.md). Claude recommended I go with proposal A. I decided to use proposal B because I felt it would be more future-proof for whatever features I might like to add. I also appreciate the greater control that `v-cards` give.

## Item Panels Merge

Details are found in [`item-panels-merge-proposal.md`](proposals/item-panels-merge-proposal.md).

I have decided to NOT merge the item panels as recommended by Claude because of the complexity introduced by v-form.

## Roadmap Pane Implementation

### Decision 1

I have decided to go a third route and make the date header on the left side of the roadmap be a separate SVG area. It will be kept in sync with the main roadmap using JavaScript which watches when horizontal scrolling occurs.

### Decision 2

I will use divs for rows on the right side. Furthermore, I will avoid using any of Vuetify's structural and layout elements in this component.

### Decision 3

I will use a prop to control scale. The value of this prop will represent the pixel width of a day. The default value will be 80, which gives one week a width of 560 pixels.

## Workspace Items overflow

Details found in [`workspace-overflow-proposal.md`](proposals/workspace-overflow-proposal.md).

Currently, if a workspace has more than X (default 10) items the item list component will truncate to the first X and include a "View X more" item at the bottom.

I will make clicking the "View X more" item simply show the full list. There will then be a way to re-truncate. I am adopting this approach because it would be easier to reverse in the future if a more complex approach is needed.

## Backlog List

Details found in [`backlog-list-proposal.md`](proposals/backlog-list-proposal.md).

I will accept the recommendation of creating this component using the `v-data-table`. The hyphenation issue will be addressed by updating the Item interface to use `startDate` and `endDate` rather than `start-date` and `end-date`.

## Key or id

This decision has no other documentation.

Throughout the app, I use key and id interchangeably. I should pick one or the other. I chose to use id because its meaning, as an identifier for a workspace or item is clear, and it does not overlap with as much.

## Persistence

Details found in [`persistence-proposal.md`](proposals/persistence-proposal.md).

I need to decide how I will implement persistence so that data can be saved between sessions. I can either write my own IndexedDB wrapper (option A) or I can use an NPM package called `idb` (option B). I will go with option B because it reduces workload.

## Settings

Details in [`settings-proposal.md`](proposals/settings-proposal.md).

Adopted proposal A. A navigation drawer will be better long term. Also, these settings will eventually grow in the "view" feature mentioned in the README.

## Linting

Details in [`linting-proposal.md`](proposals/linting-proposal.md).

Adopting proposal A. The addition of additional packages to run linting automatically seems unnecessary. It is a good habit for developers to run linting on a regular basis. Automated linting running with a GitHub action will be enough.
I will also adopt the recommendations about lint rule changes.

## E2E Testing

Details in [`e2e-testing-proposal.md`](proposals/e2e-testing-proposal.md).

A new issue should be created to implement the tests from Option A. This issue should also include configuring a GitHub action to run the tests automatically when a PR is made. This action should be configured such that PRs into `development` are tested only with Chromium while PRs into `production` are tested with Chromium, Firefox, and WebKit.

Further issues should be created to implement the tests from Option B. These will be lower priority.

## Component testing

Details in [`component-testing-proposal.md`](proposals/component-testing-proposal.md).

I will go with option A based on the fact that issues with more complex components will be caught in E2E tests regardless. An issue should be created to implement the proposal.

## Unit Testing

Details in [`unit-testing-proposal.md`](proposals/unit-testing-proposal.md).

I will go with option A based on the same reasoning as component testing. An issue should be created.

## Spaces

Details in [`views-proposal`](proposals/views-proposal.md).

Spaces are intended to be the highest level datatype in the app.

### Naming

Not covered in the `views-proposal`.

Throughout the development of the app, I used several names to refer to various datatypes. This section serves to change or standardize them. They are ordered from smallest to largest.

- Item, a very generic datatype. It is intended to represent a task, event, goal, project, unit of work, etc.
- Collection, aggregates items. Previously called a workspace.
- Visualization, contains configuration for displaying items.
- Space, serves as a container for collections and visualizations. Previously called a view.

### Visualization Type

I will adopt a hybrid approach. A space can contain any number of visualizations, represented by tabs. Then a visualization can be configured with a type (roadmap, backlog, calendar, board) and the particular settings available for that visualization type.

### Settings Migration

Option B, no doubt about it.

### Routing

Option C. Spaces will become the primary way to navigate the app, but it should still be possible to view collections (workspaces) on their own. The exact way you reach a collection might change.

### User Interface

A user will be able to browse their spaces in a panel similar to the collections panel.

When a space is open, there will be a bar of tabs at the top. These are the spaces's visualizations. The user will be able to select, modify, and create visualizations from here. The open visualization will be shown in a pane below.

When a user opens the app for the first time, a default space with a default calendar visualization and collection will already be open.

### Implementation

The order of implementation:

1. Add types for spaces and visualizations.
2. Create spaces store, visualizations store, and dummy data.
3. Update the router with a `/space/:spaceId` route.
4. Create a spaces panel and editor panel.
5. Create a SpaceView.
6. The home page should be updated to show the SpaceView rather than the WorkspaceView.
7. Rename workspaces to collections.
