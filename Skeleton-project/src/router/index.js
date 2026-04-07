import { createRouter, createWebHistory } from 'vue-router';
import AddTransaction from '../components/add-transaction.vue';

const routes = [
  {
    path: '/add/:type',
    name: 'add-transaction',
    component: AddTransaction,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
