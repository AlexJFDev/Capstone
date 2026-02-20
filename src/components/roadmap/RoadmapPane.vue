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
  <div class="w-100 h-100 pa-8">
    <div class="w-100 h-100 border-md rounded" style="background-color: green;">
      <div style="background-color: white; height: 30px;">Header, New Item</div>
      <div class="d-flex" style="overflow-y: scroll;">
        <div style="background-color: blue; width: 400px; height: 2000px;">
          {{ workspace }}
        </div>
        <div style="background-color: red; width: 100%;"></div>
      </div>
      <div style="background-color: white; height: 30px;">Footer, New Item</div>
      
      <div style="background-color: red;"></div>
    </div>
  </div>
</template>

<style scoped>

</style>