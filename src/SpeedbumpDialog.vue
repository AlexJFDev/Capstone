<script setup lang="ts">
import { useInterfaceStore } from '@/stores/interface'

const interfaceStore = useInterfaceStore()
</script>

<template>
  <v-dialog v-model="interfaceStore.speedbumpOpen" max-width="400" persistent>
    <v-card>
      <v-card-text class="pt-4">{{ interfaceStore.speedbumpMessage }}</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="interfaceStore.resolveSpeedbump(false)">Cancel</v-btn>
        <v-btn variant="text" color="error" @click="interfaceStore.resolveSpeedbump(true)"
          >Confirm</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
