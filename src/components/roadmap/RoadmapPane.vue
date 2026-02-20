<!--
This component will take a `workspaceId` as a prop and render a Roadmap (Gantt chart) for the Workspace. 
If there is not enough vertical space, the pane will scroll, rather than making the screen longer.

At the moment, all buttons should call no-op functions.
 
The display will have two halves. There should be a border separating each half. 

On the left will be a column of items. 
Each row will have the name of its item. When a row is hovered over, up and down buttons will appear on the leftmost side and a settings button will appear on the rightmost side.
The very first row will be to add a new item.
The very last row will also be to add a new item. This row should always be visible.
This half should maintain a constant width.

On the right will be an SVG rendering of the roadmap items as bars.
To start, the roadmap will be at a week scale zoom level. However, the implementation should be able to support changing the scale in the future.
Each bar will be colored according to its item color.
There will be a header at the top showing the date of the start of each week on Sunday. This header should always be visible.
A vertical dashed line should be at each sunday mark.
This half can scroll horizontally if there is not enough space to display all bars.
This half's width should resize depending on horizontal space available.

The rows on either side should be the same height so that the name of an item lines up with its bar. There should be a thin border which appears to cross the entire width of the pane for each row.
-->

<script setup lang="ts">
import { workspaces } from '@/testing/dummy-workspaces'


const props = defineProps<{
  workspaceId: string
}>()

const workspace = workspaces[props.workspaceId]!

</script>

<template>
  <div class="w-100 h-100 pa-8">
    <div class="w-100 h-100" style="background-color: green;">
      <div style="background-color: blue; width: 400px;" class="h-100"></div>
      <div style="background-color: red;"></div>
    </div>
  </div>
</template>

<style scoped>

</style>