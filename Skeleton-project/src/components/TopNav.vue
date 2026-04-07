<template>
  <nav class="top-nav">
    <router-link to="/home">홈</router-link>
    <a href="#" @click.prevent>날짜선택</a>
    <a href="#" @click.prevent>거래내역</a>
    <router-link to="/profile">프로필&설정</router-link>
  </nav>
</template>

<style scoped>
.top-nav {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 16px;
  background: var(--nav-bg);
}

.top-nav a {
  color: white;
  text-decoration: none;
  font-weight: bold;
}
</style>
