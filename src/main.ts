import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { useWorkspacesStore } from './stores/workspaces'
import { useItemsStore } from './stores/items'

const app = createApp(App)

app.use(createPinia())
app.use(vuetify)

await Promise.all([
  useWorkspacesStore().initializeWorkspaces(),
  useItemsStore().initializeItems(),
])

app.use(router)
app.mount('#app')
