# Decisions

User generated file. Agents should NOT modify this file. This file is intended to keep a record of development decisions and explain why those decisions were made. I will always have agents make proposals for changes which I will review and choose to adopt or not. Furthermore, I will only task agents with user interface decisions. Architecture decisions are purely my responsibility. This process ensures that I understand the code agents are writing and I am making long term decisions.

## Item Panels

When created the item panels, Claude generated a proposal with two approaches. Details are found in `item-panels-proposal.md`. Claude recommended I go with proposal A. I decided to use proposal B because I felt it would be more future-proof for whatever features I might like to add. I also appreciate the greater control that `v-cards` give.

## Item Panels Merge

Details are found in `item-panels-merge-proposal.md`.
I have decided to NOT merge the item panels as recommended by Claude because of the complexity introduced by v-form.

## Roadmap Pane Implementation

### Decision 1

I have decided to go a third route and make the date header on the left side of the roadmap be a separate SVG area. It will be kept in sync with the main roadmap using JavaScript which watches when horizontal scrolling occurs.

### Decision 2

I will use divs for rows on the right side. Furthermore, I will avoid using any of Vuetify's structural and layout elements in this component.

### Decision 3

I will use a prop to control scale. The value of this prop will represent the pixel width of a day. The default value will be 80, which gives one week a width of 560 pixels.

## Workspace Items overflow

Details found in `workspace-overflow-proposal.md`.
Currently, if a workspace has more than X (default 10) items the item list component will truncate to the first X and include a "View X more" item at the bottom.

I will make clicking the "View X more" item simply show the full list. There will then be a way to re-truncate. I am adopting this approach because it would be easier to reverse in the future if a more complex approach is needed.

## Backlog List

Details found in `backlog-list-proposal.md`.
I will accept the recommendation of creating this component using the `v-data-table`. The hyphenation issue will be addressed by updating the Item interface to use `startDate` and `endDate` rather than `start-date` and `end-date`.

## Key or id

This decision has no other documentation.
Throughout the app, I use key and id interchangeably. I should pick one or the other. I chose to use id because its meaning, as an identifier for a workspace or item is clear, and it does not overlap with as much.

## Persistence

Details found in `persistence-proposal.md`.
I need to decide how I will implement persistence so that data can be saved between sessions. I can either write my own IndexedDB wrapper (option A) or I can use an NPM package called `idb` (option B). I will go with option B because it reduces workload.

## Settings

Details in `settings-proposal.md`.
Adopted proposal A. A navigation drawer will be better long term. Also, these settings will eventually grow in the "view" feature mentioned in the README.

## Linting

Details in `linting-proposal.md`.
Adopting proposal A. The addition of additional packages to run linting automatically seems unnecessary. It is a good habit for developers to run linting on a regular basis. Automated linting running with a GitHub action will be enough.
I will also adopt the recommendations about lint rule changes.

## Vuetify

Details in `docs/vuetify-upgrade-evaluation.md`.
For now I will make the minimal changes to upgrade to Vuetify 4. I will evaluate use cases for other Vuetify features later.
