const channel = new BroadcastChannel('chronicle-sync')

export function broadcastChange(): void {
  // oxlint-disable-next-line unicorn/require-post-message-target-origin -- BroadcastChannel.postMessage takes no targetOrigin
  channel.postMessage(null)
}

export function setupSync(onExternalChange: () => void): void {
  channel.addEventListener('message', onExternalChange)
}
