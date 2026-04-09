<template>
  <div class="min-vh-100 d-flex flex-column">
    <Header v-if="!isStartPage" />

    <main class="container-fluid py-4 flex-grow-1">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, RouterView } from 'vue-router';
import Header from '@/sides/header-page.vue';

import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/style.css';

const route = useRoute();
const isStartPage = computed(() => route.name === 'startPage');
</script>
