// Defines application routes (home, items, and dev-only test) and guards against navigating to deleted collections.
import { createRouter, createWebHistory } from 'vue-router'
import WorkspacesView from '../views/WorkspacesView.vue'
import { useCollectionsStore } from '@/stores/collections'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: WorkspacesView,
    },
    {
      path: '/collection/:collectionId',
      name: 'collection',
      component: WorkspacesView,
    },
    {
      path: '/items',
      name: 'items',
      component: () => import('../views/ItemsView.vue'),
    },
    ...(import.meta.env.DEV || import.meta.env.MODE === 'preview'
      ? [
          {
            path: '/test',
            name: 'test',
            component: () => import('../views/TestView.vue'),
          },
        ]
      : []),
  ],
})

router.beforeEach((to) => {
  if (to.name === 'collection') {
    const collectionId = to.params.collectionId as string
    const collectionsStore = useCollectionsStore()
    if (!collectionsStore.doesCollectionExist(collectionId)) {
      return { name: 'home' }
    }
  }
})

export default router
