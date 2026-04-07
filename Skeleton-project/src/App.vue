<template>
  <router-view />
</template>

<style>
:root {
  --bg-color: #f8f8f8;
  --text-color: #222222;
  --card-bg: #ffffff;
  --nav-bg: #f4a261;
}

[data-theme='dark'] {
  --bg-color: #1f1f1f;
  --text-color: #f5f5f5;
  --card-bg: #2c2c2c;
  --nav-bg: #333333;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: var(--bg-color);
  color: var(--text-color);
}
</style>
