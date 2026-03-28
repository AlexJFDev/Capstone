import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { useWorkspacesStore } from './stores/workspaces'
import { useItemsStore } from './stores/items'
import { useInterfaceStore } from './stores/interface'

const app = createApp(App)

app.use(createPinia())
app.use(vuetify)

const workspacesStore = useWorkspacesStore()
const itemsStore = useItemsStore()

await Promise.all([
  workspacesStore.initializeWorkspaces(),
  itemsStore.initializeItems(),
  useInterfaceStore().initializeInterface()
])

for (const workspaceId of workspacesStore.workspaceIds) {
  const workspace = workspacesStore.getWorkspace(workspaceId)
  const validItems = workspace.items.filter(id => itemsStore.doesItemExist(id))
  if (validItems.length !== workspace.items.length) {
    workspacesStore.updateWorkspace(workspaceId, { items: validItems })
  }
}

app.use(router)
app.mount('#app')
