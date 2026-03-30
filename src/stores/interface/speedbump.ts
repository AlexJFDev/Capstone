// Provides a promise-based confirm() helper that shows a blocking speedbump dialog and resolves with the user's choice.
import { ref } from 'vue'

export function useInterfaceSpeedbump() {
  const speedbumpOpen = ref(false)
  const speedbumpMessage = ref('')
  let speedbumpResolve: ((confirmed: boolean) => void) | null = null

  function confirm(message: string): Promise<boolean> {
    speedbumpMessage.value = message
    speedbumpOpen.value = true
    return new Promise((resolve) => {
      speedbumpResolve = resolve
    })
  }

  function resolveSpeedbump(confirmed: boolean) {
    speedbumpOpen.value = false
    speedbumpResolve?.(confirmed)
    speedbumpResolve = null
  }

  return { speedbumpOpen, speedbumpMessage, confirm, resolveSpeedbump }
}
