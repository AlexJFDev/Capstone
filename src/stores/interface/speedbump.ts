// Provides a promise-based confirm() helper that shows a blocking speedbump dialog and resolves with the user's choice.
import { useConfirmDialog } from '@vueuse/core'
import { ref } from 'vue'

export function useInterfaceSpeedbump() {
  const { isRevealed, reveal, confirm, cancel, onReveal } = useConfirmDialog()
  
  // const speedbumpOpen = ref(false)
  const speedbumpMessage = ref('')

  onReveal(data => speedbumpMessage.value = data)
  // let speedbumpResolve: ((confirmed: boolean) => void) | null = null

  // function confirm(message: string): Promise<boolean> {
  //   speedbumpMessage.value = message
  //   speedbumpOpen.value = true
  //   return new Promise((resolve) => {
  //     speedbumpResolve = resolve
  //   })
  // }

  // function resolveSpeedbump(confirmed: boolean) {
  //   speedbumpOpen.value = false
  //   speedbumpResolve?.(confirmed)
  //   speedbumpResolve = null
  // }

  return { 
    speedbumpIsRevealed : isRevealed, 
    speedbumpMessage, 
    revealSpeedBump : reveal, 
    confirmSpeedBump : confirm,
    cancelSpeedBump : cancel 
  }
}
