/**
 * Initiates a mouse drag gesture from a mousedown event.
 *
 * Handles the repetitive boilerplate shared by all roadmap drag interactions:
 * - Calls preventDefault on the initiating event
 * - Sets a cursor on document.body for the duration of the drag
 * - Attaches mousemove / mouseup listeners to document
 * - Restores the cursor and removes listeners on mouseup
 *
 * @param event  - The initiating mousedown event.
 * @param onMove - Called on every mousemove during the drag.
 * @param options.cursor - Optional cursor to apply to document.body while dragging.
 * @param options.onEnd  - Optional callback invoked when the drag ends (mouseup).
 */
export function startDragGesture(
  event: MouseEvent,
  onMove: (e: MouseEvent) => void,
  options?: { cursor?: string; onEnd?: () => void },
): void {
  event.preventDefault()

  if (options?.cursor) document.body.style.cursor = options.cursor

  function handleMove(e: MouseEvent) {
    onMove(e)
  }

  function handleUp() {
    document.body.style.cursor = ''
    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('mouseup', handleUp)
    options?.onEnd?.()
  }

  document.addEventListener('mousemove', handleMove)
  document.addEventListener('mouseup', handleUp)
}
