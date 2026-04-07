<template>
  <div id="app">
    <header>
      <h1>가계부 앱 테스트 서버 (transaction_db.json)</h1>
    </header>

    <router-view />
  </div>
</template>
<script setup>
import { RouterView } from "vue-router";
import JsonTest from "./components/json-test.vue"; // 경로에 맞춰 수정
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  padding: 20px;
}
</style>
