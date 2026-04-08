// Application entry point: creates the Vue app, initializes Pinia stores from IndexedDB, and mounts to #app.
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { useCollectionsStore } from './stores/collections'
import { useItemsStore } from './stores/items'
import { useInterfaceStore } from './stores/interface'

const app = createApp(App)

app.use(createPinia())
app.use(vuetify)

const collectionsStore = useCollectionsStore()

await Promise.all([
  collectionsStore.initializeCollections(),
  useItemsStore().initializeItems(),
  useInterfaceStore().initializeInterface(),
])

collectionsStore.scrubAllCollections()

app.use(router)
app.mount('#app')
