import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue')
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/Users.vue'),
        meta: { requiresAdmin: true }
      },
      {
        path: 'events',
        name: 'Events',
        component: () => import('@/views/Events.vue')
      },
      {
        path: 'tasks',
        name: 'Tasks',
        component: () => import('@/views/Tasks.vue'),
        meta: { requiresAdmin: true }

      },
      {
        path: 'food',
        name: 'Food',
        component: () => import('@/views/Food.vue'),
        meta: { requiresAdmin: true }

      },
      {
        path: 'cate',
        name: 'Cate',
        component: () => import('@/views/Cate.vue'),
        meta: { requiresAdmin: true }

      },
      {
        path: 'ingredient',
        name: 'Ingredient',
        component: () => import('@/views/Ingredient.vue'),
        meta: { requiresAdmin: true }

      },
      {
        path: 'crontab',
        name: 'Crontab',
        component: () => import('@/views/Crontab.vue'),
        meta: { requiresAdmin: true }

      },
      {
        path: 'interval',
        name: 'Interval',
        component: () => import('@/views/Interval.vue'),
        meta: { requiresAdmin: true }

      },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.path !== '/login' && !userStore.token) {
    next('/login')
  } else if (to.meta.requiresAdmin && !userStore.isAdmin) {
    next('/')
  } else {
    next()
  }
})

export default router 