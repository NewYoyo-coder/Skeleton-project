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

<style>
.app-background {
  background-color: #f2f2f2;
  min-height: 100vh;
  display: flex;
  justify-content: center;
}

.mobile-container {
  width: 100%;
  max-width: 425px;
  min-height: 100vh;
  background-color: #ffffff;
  position: relative;
  overflow-x: hidden;
}
</style>
