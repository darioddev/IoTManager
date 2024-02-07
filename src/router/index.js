import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      meta: { title: 'IoTManager' },
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/:id',
      name: 'space',
      meta : { title: 'IoTManager' },
      component: () => import('@/views/spaceView.vue')
    },
    {
      path: '/:id/:device',
      name: 'device',
      meta : { title: 'IoTManager' },
      props: true,
      component: () => import('@/views/deviceView.vue')
    }
  ]
})

export default router
