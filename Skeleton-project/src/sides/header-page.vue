<template>
  <header class="bg-black py-3">
    <div class="container">
      <nav class="d-flex justify-content-center align-items-center gap-3">
        <router-link to="/mainDashboard" class="nav-link-custom">홈</router-link>
        <span class="text-white-50">|</span>
        <router-link to="/transactionHistory" class="nav-link-custom">거래내역</router-link>
        <span class="text-white-50">|</span>
        <router-link to="/profileSettings" class="nav-link-custom">프로필&설정</router-link>
      </nav>
    </div>
  </header>
</template>

<style scoped>
</style>
