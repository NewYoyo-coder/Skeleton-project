import { createRouter, createWebHistory } from 'vue-router';
import addTransaction from '@/components/add-transaction.vue';
import Maindashboard from '@/components/main-dashboard.vue';
// import profileSettings from '@/components/profile-settings.vue';
import profileSettings from '@/components/ProfileSettingsView.vue';
// import startPage from '@/components/start-page.vue';
import startPage from '@/components/StartView.vue';
import transactionHistory from '@/components/transaction-history.vue';
// import JsonTest from "../components/json-test.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: startPage },
    { path: '/mainDashboard', component: Maindashboard },
    { path: '/addTransaction', component: addTransaction },
    { path: '/profileSettings', component: profileSettings },
    { path: '/transactionHistory', component: transactionHistory },
    { path: '/history', component: transactionHistory },
    {
      path: '/add/:type',
      name: 'add-transaction',
      component: addTransaction,
      props: true,
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
