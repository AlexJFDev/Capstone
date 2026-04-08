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

await Promise.all([
  workspacesStore.initializeWorkspaces(),
  useItemsStore().initializeItems(),
  useInterfaceStore().initializeInterface(),
  useVisualizationsStore().initializeVisualizations(),
  spacesStore.initializeSpaces(),
])

workspacesStore.scrubAllWorkspaces()
spacesStore.scrubAllSpaces()

app.use(router)
app.mount('#app')
