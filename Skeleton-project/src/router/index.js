import { createRouter, createWebHistory } from 'vue-router';
import addTransaction from '@/components/add-transaction.vue';
import Maindashboard from '@/components/main-dashboard.vue';
// import profileSettings from '@/components/profile-settings.vue';
import profileSettings from '@/components/ProfileSettingsView.vue';
// import startPage from '@/components/start-page.vue';
import startPage from '@/components/StartView.vue';
import transactionHistory from '@/components/transaction-history.vue';
// import JsonTest from "../components/json-test.vue";
import reportView from '@/components/reportView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'startPage',
      component: startPage
    },
    {
      path: '/main',
      alias: '/mainDashboard', // ✅ /mainDashboard로 들어와도 이 컴포넌트를 보여줌
      component: Maindashboard
    },
    {
      path: '/add',
      alias: '/addTransaction',
      component: addTransaction,
      children: [ // 동적 파라미터는 자식이나 별도 경로로 관리
        { path: ':type', component: addTransaction, props: true }
      ]
    },
    {
      path: '/history',
      alias: '/transactionHistory',
      component: transactionHistory
    },
    {
      path: '/reoport',
      alias: '/report',
      component: reportView
    },
    {
      path: '/profile',
      alias: ['/profileSettings', '/settings'], // ✅ 여러 개도 가능
      component: profileSettings
    },
  ],
});;
export default router;
