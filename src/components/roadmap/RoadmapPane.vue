<script setup lang="ts">
import { workspaces } from '@/testing/dummy-workspaces'


const props = 
withDefaults(defineProps<{
  workspaceId: string,
  scale?: number
}>(), {
  scale: 80
}
)

const workspace = workspaces[props.workspaceId]!

</script>

<template>
  <div class="pa-8">
    <div class="border-md rounded" style="background-color: green;">

      <!-- Fixed Header: New Item button and the dates area -->
      <div class="margin">Header, New Item</div>

      <!-- Body: Items List & Roadmap Render -->
      <div class="d-flex" style="overflow-y: scroll;">
        <!-- Items List -->
        <div class="items-list">
          {{ workspace }}

          <!-- Simulating large content -->
          <div style="height: 2000px;" />
        </div>

        <!-- Roadmap Render -->
        <div class="roadmap-render"></div>
      </div>

      <!-- Fixed Footer: New Item Button -->
      <div class="margin">Footer, New Item</div>
    </div>
  </div>
</template>

<style scoped>
.margin {
  background-color: white;
  height: 30px;
}

.items-list {
  background-color: blue;
  width: 400px;
}

.roadmap-render {
  background-color: red;
  width: 100%;
}
</style>