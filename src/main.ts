// Application entry point: creates the Vue app, initializes Pinia stores from IndexedDB, and mounts to #app.
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { useWorkspacesStore } from './stores/workspaces'
import { useItemsStore } from './stores/items'
import { useInterfaceStore } from './stores/interface'
import { useSpacesStore } from './stores/spaces'
import { useVisualizationsStore } from './stores/visualizations'

const app = createApp(App)

app.use(createPinia())
app.use(vuetify)

const workspacesStore = useWorkspacesStore()
const spacesStore = useSpacesStore()

// Every store that persists to IndexedDB must have its initialize function called here.
// If a new store is added with an initialize* function, it belongs in this Promise.all.
// Omitting it means the store will always start empty after a page reload (see issue #125).
await Promise.all([
  workspacesStore.initializeWorkspaces(),
  useItemsStore().initializeItems(),
  useInterfaceStore().initializeInterface(),
  spacesStore.initializeSpaces(),
  useVisualizationsStore().initializeVisualizations(),
])

workspacesStore.scrubAllWorkspaces()
spacesStore.scrubAllSpaces()

app.use(router)
app.mount('#app')
