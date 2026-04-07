import { createRouter, createWebHistory } from 'vue-router';
import addTransaction from '@/components/add-transaction.vue';
import Maindashboard from '@/components/main-dashboard.vue';
import profileSettings from '@/components/profile-settings.vue';
import startPage from '@/components/start-page.vue';
import transactionHistory from '@/components/transaction-history.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: startPage},
    { path: '/mainDashboard', component: Maindashboard},
    { path: '/addTransaction', component: addTransaction },
    { path: '/profileSettings', component: profileSettings },
    { path: '/transactionHistory', component: transactionHistory },
  ],
});

export default router;
