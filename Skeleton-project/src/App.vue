<template>
  <nav style="padding: 20px; background: #eee; display: flex; gap: 10px">
    <RouterLink to="/">메인</RouterLink>
    <RouterLink to="/test1">테스트 1</RouterLink>
    <RouterLink to="/test2">테스트 2 (요약)</RouterLink>
  </nav>

  <RouterView />
</template>
<script setup>
import { RouterView } from 'vue-router';
import JsonTest from './components/json-test.vue'; // 경로에 맞춰 수정
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  padding: 20px;
}
</style>
