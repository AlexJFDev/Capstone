// Provides a promise-based revealSpeedBump() helper that shows a blocking speedbump dialog and resolves with the user's choice.
import { useConfirmDialog } from '@vueuse/core'
import { ref } from 'vue'

export function useInterfaceSpeedbump() {
  const { isRevealed, reveal, confirm, cancel, onReveal } = useConfirmDialog()

  const speedbumpMessage = ref('')

  onReveal((data) => (speedbumpMessage.value = data))

  return {
    speedbumpIsRevealed: isRevealed,
    speedbumpMessage,
    revealSpeedBump: reveal,
    confirmSpeedBump: confirm,
    cancelSpeedBump: cancel,
  }
}
