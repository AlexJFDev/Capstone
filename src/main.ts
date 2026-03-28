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

const workspacesStore = useWorkspacesStore()
const itemsStore = useItemsStore()
const interfaceStore = useInterfaceStore()

async function initializeStores() {
  await Promise.all([
    workspacesStore.initializeWorkspaces(),
    itemsStore.initializeItems(),
    interfaceStore.initializeInterface()
  ])
}

await initializeStores()

setupSync(() => { void initializeStores() })

app.use(router)
app.mount('#app')
