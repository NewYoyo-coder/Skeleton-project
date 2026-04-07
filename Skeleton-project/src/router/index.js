import { createRouter, createWebHistory } from 'vue-router';
import StartView from '../views/StartView.vue';
import HomeView from '../views/HomeView.vue';
import ProfileSettingsView from '../views/ProfileSettingsView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'start',
      component: StartView,
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileSettingsView,
    },
  ],
});

export default router;
