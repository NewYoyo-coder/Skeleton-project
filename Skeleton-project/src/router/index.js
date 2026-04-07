import { createRouter, createWebHistory } from 'vue-router';

import MainDashboard from '@/components/main-dashboard.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: MainDashboard,
    },
    {
      path: '/history',
      name: 'history',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../components/transaction-history.vue'),
    },
  ],
});

export default router;
