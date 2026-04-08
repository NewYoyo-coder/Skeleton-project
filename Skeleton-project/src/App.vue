<template>
  <div id="app">
    <div class="app-background">
      <div class="mobile-container shadow-sm">
        <nav style="padding: 20px; background: #eee; margin-bottom: 20px">
          <router-link to="/add/expense">Test Expense</router-link>
          <router-link to="/add/income">Test Income</router-link>
        </nav>

        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup></script>
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
