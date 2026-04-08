// Defines application routes (home, workspace, space, items, and dev-only test) and guards against navigating to deleted workspaces or spaces.
import { createRouter, createWebHistory } from 'vue-router'
import CollectionsView from '../views/CollectionsView.vue'
import { useCollectionsStore } from '@/stores/collections'
import { useSpacesStore } from '@/stores/spaces'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: CollectionsView,
    },
    {
      path: '/workspace/:workspaceId',
      name: 'workspace',
      component: CollectionsView,
    },
    {
      path: '/space/:spaceId',
      name: 'space',
      component: () => import('../views/SpaceView.vue'),
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
  if (to.name === 'workspace') {
    const workspaceId = to.params.workspaceId as string
    const collectionsStore = useCollectionsStore()
    if (!collectionsStore.doesCollectionExist(workspaceId)) {
      return { name: 'home' }
    }
  }

  if (to.name === 'space') {
    const spaceId = to.params.spaceId as string
    const spacesStore = useSpacesStore()
    if (!spacesStore.doesSpaceExist(spaceId)) {
      return { name: 'home' }
    }
  }
})

export default router
