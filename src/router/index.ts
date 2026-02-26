import { createRouter, createWebHistory } from 'vue-router'
import WorkspacesView from '../views/WorkspacesView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: WorkspacesView,
    },
    {
      path: '/workspace/:workspaceId',
      name: 'workspace',
      component: WorkspacesView,
    },
    ...(import.meta.env.DEV ? [{
      path: '/test',
      name: 'test',
      component: () => import('../views/TestView.vue'),
    }] : []),
  ],
})

export default router
