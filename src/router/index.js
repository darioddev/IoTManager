import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/:id',
      name: 'space',
      component: () => import('@/views/spaceView.vue')
    },
    {
      path: '/:id/:device',
      name: 'device',
      props : true,
      component: () => import('@/views/deviceView.vue')
    }
  ]
})

export default router
