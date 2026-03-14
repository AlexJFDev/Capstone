# Chronicle

This project is called "Chronicle". I chose this name because of its connotations of permanent, time-ordered record-keeping, reflecting the app's role as a lasting record of your work, plans, and events across time. The app is accessible at [https://alexjfdev.github.io/Capstone/](https://alexjfdev.github.io/Capstone/).

## Objective

This repository contains my capstone project for my computer science major at CNU. I am developing a roadmap management application for organizing workspaces and tracking items on a Gantt-style (roadmap) timeline. I have chosen this project because I was unsatisfied with the other project tools available. Everything I found required payment, creating an account, was a demo, had a poor UI, or some combination of those problems. Inspired by [Excalidraw](https://excalidraw.com/), I knew I could develop something better.

Like Excalidraw, this tool will store all data locally. I will use IndexedDB for this. This simplifies development for me because I don't need to develop a backend server. It also eliminates any cost that a server might have.

Based on discussions I have had with co-workers in my actual job (I do web development), this project is also intended to be an exercise in AI-powered app development. The details of this can be found in the `/docs` folder. The folder contains various AI-assisted proposals for features and a file called `decisions.md`. Decisions contains final development decisions based on those proposals. All decisions are ultimately made by a human.

## Current state

Currently, the UI of the app is fully functional,however changes are not persistent. If the page is reloaded, all changes are lost and the store is filled with pre-written dummy data.

## Long-term Plans

In the long-term, I would like to create a more expansive tool. This tool would be intended not only for project management, but time management in general. This tool would support online account creation and sharing between accounts. However, just like Excalidraw, using it without an account and using local storage would remain a possibility.

The main addition with this tool would be a datatype called a "View" which would function as a container for Workspaces and interface settings. At least four different visualizations would be available, Roadmap, Backlog, Kanban, and Calendar.

This tool solves the disconnect that occurs between professional project management and time management more generally. A user of the site could see what they need to do for work and what is happening in their personal life all in the same place. As hybrid working schedules become more common and people tend to work outside the traditional nine-to-five, I think this is important.

As a student who also does web-development contracting part-time, a tool like this would have been very useful for me. It would have been very useful if all my class times, extracurricular meetings, work meetings, plans with friends, breaks from school, assignments, tasks for work, etc. were all contained in a single place. Then, by switching between "Views" I would be able to prioritize different information when planning. With a roadmap or backlog, I could look at the assignments I have in my classes; on a Kanban board, I can keep track of work; on a calendar, I can see when I have class and extracurriculars. Finally, I could collate all that information into a single calendar where I can keep track of what I have to do and when.

Team collaboration is built around access control rather than a rigid hierarchy. A user can add any item they have read access to into their own Workspaces and Views, regardless of where that item came from. A team member could pull shared meeting items into a personal daily calendar alongside their own private tasks, all without duplicating data. Items are shared by reference, so an update by whoever owns the item is immediately reflected everywhere it appears. A user could also choose to duplicate an item, taking a personal copy they can modify freely, though this breaks the updating relationship and the two copies diverge independently from that point on.

## Architecture

The core of this project are two datatypes representing "Workspaces" and "Items". These are stored as JSON. The rest of the site is simply a way to visualize this information. Workspaces act as containers for items, but items are still first class items stored separately. Workspaces just contain a list of item-ids as references. This allows for flexibility and having one item in multiple workspaces. "Views" will be another datatype but are not going to be added for some time.

## Tech Stack

- [Vue 3](https://vuejs.org/) + TypeScript
- [Vite](https://vite.dev/)
- [Pinia](https://pinia.vuejs.org/) — state management
- [Vuetify](https://vuetifyjs.com/) — UI components

## Setup

```sh
npm install
```

### Development

```sh
npm run dev
```

### Build

```sh
npm run build
```

### Lint

```sh
npm run lint
```

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (disable Vetur if installed)

### Browser DevTools

- [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) (Chrome/Edge)
