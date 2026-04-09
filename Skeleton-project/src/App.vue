<script setup>
import { RouterView } from 'vue-router';
// 기존에 설정하신 경로 그대로 유지합니다.
import Header from '@/sides/header-page.vue';
// import JsonTest from './components/json-test.vue';
</script>

<template>
  <div class="app-container min-vh-100 bg-white">
    <Header />
    <main class="container py-4">
      <RouterView />
    </main>
  </div>
</template>
<style scoped>
/* #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        padding: 20px; */

.app-background {
  background-color: #f2f2f2;
  min-height: 100vh;
  display: flex;
  justify-content: center;
}

header {
  line-height: 1.5;
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
