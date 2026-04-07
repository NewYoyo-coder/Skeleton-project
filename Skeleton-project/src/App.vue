<script setup>
import { RouterView } from 'vue-router';
// 기존에 설정하신 경로 그대로 유지합니다.
import Header from '@/sides/header-page.vue';
</script>

<template>
  <div class="app-container min-vh-100 bg-white">
    <Header />

    <main class="container py-4">
      <RouterView />
    </main>
  </div>
</template>

<style></style>
