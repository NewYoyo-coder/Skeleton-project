import { createRouter, createWebHistory } from "vue-router";
import MainDashboard from '@/components/main-dashboard.vue';
import JsonTest from "../components/json-test.vue";

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
      component: () => import('../components/transaction-history.vue'),
    },
    {
      path: "/test1",
      name: "test1",
      component: () => import("../components/json-test.vue"),
    },
    {
      path: "/test2",
      name: "test2",
      component: () => import("../components/json-test2.vue"),
    }
  ],
});

export default router;