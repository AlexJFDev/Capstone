<script setup lang="ts">
import { type DateRange, dateToShortISOString, makeDateRange } from '@/utils/dates'
import { ref, useTemplateRef, watch } from 'vue'
import { VInput } from 'vuetify/components'

const model = defineModel<DateRange>({
  default: makeDateRange,
})

defineProps<{
  hideDetails?: boolean | 'auto'
  rules?: ((value: DateRange) => string | boolean)[]
}>()

const inputRef = useTemplateRef<VInput>('inputRef')
const hasError = ref(false)

watch(
  () => inputRef.value?.isValid,
  (isValid) => {
    hasError.value = isValid === false
  },
)

function toDateStr(date: Date): string {
  return isNaN(date.getTime()) ? '' : dateToShortISOString(date)
}

const startStr = ref(toDateStr(model.value.start))
const endStr = ref(toDateStr(model.value.end))

watch(startStr, (val) => {
  model.value = {
    start: new Date(val),
    end: model.value.end,
  }
})

watch(endStr, (val) => {
  model.value = {
    start: model.value.start,
    end: new Date(val),
  }
})

watch(
  model,
  (val) => {
    const newStart = toDateStr(val.start)
    const newEnd = toDateStr(val.end)
    if (newStart !== startStr.value) startStr.value = newStart
    if (newEnd !== endStr.value) endStr.value = newEnd
  },
  { deep: true },
)
</script>

<template>
  <v-input ref="inputRef" :model-value="model" :rules="rules" :hide-details="hideDetails">
    <template #default>
      <div class="d-flex flex-column ga-2 w-100">
        <v-text-field
          v-model="startStr"
          label="Start date"
          type="date"
          variant="outlined"
          density="compact"
          hide-details
          :error="hasError"
        />
        <v-text-field
          v-model="endStr"
          label="End date"
          type="date"
          variant="outlined"
          density="compact"
          hide-details
          :error="hasError"
        />
      </div>
    </template>
  </v-input>
</template>
