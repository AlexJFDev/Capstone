import type { Item, Workspace } from '@/types'
import type { AppSettings } from './index'

type SyncMessage =
  | { type: 'put-item'; id: string; item: Item }
  | { type: 'remove-item'; id: string }
  | { type: 'put-workspace'; id: string; workspace: Workspace }
  | { type: 'remove-workspace'; id: string }
  | { type: 'put-settings'; settings: AppSettings }

const channel = new BroadcastChannel('chronicle-sync')

export function broadcastChange(message: SyncMessage): void {
  // oxlint-disable-next-line unicorn/require-post-message-target-origin -- BroadcastChannel.postMessage takes no targetOrigin
  channel.postMessage(message)
}

export interface SyncCallbacks {
  onItemPut: (id: string, item: Item) => void
  onItemRemove: (id: string) => void
  onWorkspacePut: (id: string, workspace: Workspace) => void
  onWorkspaceRemove: (id: string) => void
  onSettingsPut: (settings: AppSettings) => void
}

/**
 * Listens for cross-tab mutations broadcast by other Chronicle tabs and applies
 * them to the in-memory store via the provided callbacks.  Must be called once
 * after stores have been initialized.
 */
export function setupSync(callbacks: SyncCallbacks): void {
  channel.addEventListener('message', (event: MessageEvent<SyncMessage>) => {
    const message = event.data
    switch (message.type) {
      case 'put-item':
        callbacks.onItemPut(message.id, message.item)
        break
      case 'remove-item':
        callbacks.onItemRemove(message.id)
        break
      case 'put-workspace':
        callbacks.onWorkspacePut(message.id, message.workspace)
        break
      case 'remove-workspace':
        callbacks.onWorkspaceRemove(message.id)
        break
      case 'put-settings':
        callbacks.onSettingsPut(message.settings)
        break
    }
  })
}
