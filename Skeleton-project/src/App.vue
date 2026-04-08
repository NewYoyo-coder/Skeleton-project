<template>
  <div id="app">
    <nav style="padding: 20px; background: #eee; margin-bottom: 20px">
      <router-link to="/add/expense">Test Expense</router-link>
      <router-link to="/add/income">Test Income</router-link>
    </nav>

    <router-view />
  </div>
</template>

<script setup></script>
