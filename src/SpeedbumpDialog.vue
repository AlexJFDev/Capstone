<!-- Modal confirmation dialog driven by the interface store's speedbump state; resolves a promise on confirm or cancel. -->
<script setup lang="ts">
import { useInterfaceStore } from '@/stores/interface'

const interfaceStore = useInterfaceStore()
</script>

<template>
  <v-dialog v-model="interfaceStore.speedbumpIsRevealed" max-width="400" persistent>
    <v-card>
      <v-card-text class="pt-4">{{ interfaceStore.speedbumpMessage }}</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="interfaceStore.cancelSpeedBump">Cancel</v-btn>
        <v-btn variant="text" color="error" @click="interfaceStore.confirmSpeedBump">Confirm</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
