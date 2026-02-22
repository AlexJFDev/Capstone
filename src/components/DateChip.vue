<script setup lang="ts">
import { computed } from 'vue'

type DateStyle = 'long-american' | 'short-american' | 'long-european' | 'short-european'

const props = defineProps<{
  date: string | number | Date
  style?: DateStyle
}>()

function ordinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return `${day}th`
  switch (day % 10) {
    case 1: return `${day}st`
    case 2: return `${day}nd`
    case 3: return `${day}rd`
    default: return `${day}th`
  }
}

const formatted = computed(() => {
  const d = new Date(props.date)
  const year = d.getUTCFullYear()
  const month = d.getUTCMonth() // 0-indexed
  const day = d.getUTCDate()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  const mm = String(month + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')

  switch (props.style ?? 'long-american') {
    case 'long-american':
      return `${monthNames[month]} ${ordinalSuffix(day)}, ${year}`
    case 'short-american':
      return `${mm}-${dd}-${year}`
    case 'long-european':
      return `${day} ${monthNames[month]} ${year}`
    case 'short-european':
      return `${dd}-${mm}-${year}`
  }
})
</script>

<template>
  <div class="d-flex align-center ga-1">
    <v-icon size="small">mdi-calendar</v-icon>
    <span class="text-body-2">{{ formatted }}</span>
  </div>
</template>

<style scoped>
</style>
