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

await Promise.all([
  workspacesStore.initializeWorkspaces(),
  useItemsStore().initializeItems(),
  useInterfaceStore().initializeInterface(),
])

workspacesStore.scrubAllWorkspaces()

app.use(router)
app.mount('#app')
