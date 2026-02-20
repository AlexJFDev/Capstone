# Decisions

User generated file. Agents should NOT modify this file. This file is intended to keep a record of development decisions and explain why those decisions were made. I will always have agents make proposals for changes which I will review and choose to adopt or not. Furthermore, I will only task agents with user interface decisions. Architecture decisions are purely my responsibility. This process ensures that I understand the code agents are writing and I am making long term decisions.

## Item Panels

When created the item panels, Claude generated a proposal with two approaches. Details are found in `item-panels-proposal.md`. Claude recommended I go with proposal A. I decided to use proposal B because I felt it would be more future-proof for whatever features I might like to add. I also appreciate the greater control that `v-cards` give.

## Item Panels Merge

Details are found in `item-panels-merge-proposal.md`.
I have decided to NOT merge the item panels as recommended by Claude.
