import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { useWorkspacesStore } from './stores/workspaces'
import { useItemsStore } from './stores/items'
import { useInterfaceStore } from './stores/interface'
import { setupSync } from './db/sync'

const app = createApp(App)

app.use(createPinia())
app.use(vuetify)

const itemsStore = useItemsStore()
const workspacesStore = useWorkspacesStore()
const interfaceStore = useInterfaceStore()

await Promise.all([
  workspacesStore.initializeWorkspaces(),
  itemsStore.initializeItems(),
  interfaceStore.initializeInterface()
])

setupSync({
  onItemPut: (id, item) => itemsStore.applyExternalPut(id, item),
  onItemRemove: (id) => itemsStore.applyExternalRemove(id),
  onWorkspacePut: (id, workspace) => workspacesStore.applyExternalPut(id, workspace),
  onWorkspaceRemove: (id) => workspacesStore.applyExternalRemove(id),
  onSettingsPut: (settings) => interfaceStore.applyExternalSettings(settings),
})

app.use(router)
app.mount('#app')
