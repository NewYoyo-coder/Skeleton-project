<template>
  <div class="toaster-layer">
    <Toaster position="top-center" :offset="40" richColors />
  </div>
  <div>
    <div
      id="app-container"
      style="
        max-width: 600px;
        width: 100%;
        margin-left: auto;
        margin-right: auto;
        background: transparent;
      "
    >
      <Header v-if="!isStartPage" />
      <RouterView />
      <main class="flex-grow-1 p-0"></main>
      <router-link
        v-if="!isStartPage && !isAddTransaction"
        to="/addTransaction"
        class="btn btn-dark rounded-circle position-fixed shadow-lg d-flex justify-content-center align-items-center opacity-75"
        style="
          width: 56px;
          height: 56px;
          bottom: 150px;
          right: max(20px, calc(50% - 280px));
          z-index: 9999;
        "
      >
        <i class="fa-solid fa-plus fs-4"></i>
      </router-link>
      <Navigation v-if="!isStartPage" />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, RouterView } from "vue-router";
import Header from "@/sides/header-page.vue";
import Navigation from "@/sides/TheNavigator.vue";
import { onMounted } from "vue";
import { useUserStore } from "@/stores/userStore";
import { Toaster } from "vue-sonner";
import { notify } from "@/utils/overlay";

const userStore = useUserStore();

import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/style.css";

const route = useRoute();
const isStartPage = computed(() => route.name === "start");
const isAddTransaction = computed(() => route.path === "/addTransaction");

onMounted(() => {
  // 💡 새로고침 시 스토어가 가진 theme 값(localStorage에서 읽어온 값)을
  // 실제 HTML의 data-theme 속성에 다시 박아넣습니다.
  document.documentElement.setAttribute("data-theme", userStore.theme);
});
</script>

<style>
:root {
  --t-blue: #3182f6;
  --t-bg: #f2f4f6;
  --t-sub: #6b7684;
  --t-ease: all 0.35s cubic-bezier(0.4, 0, 0.2, 1.2);
}

/* 🚀 1. 좀비 스크롤 완전 박멸 (최상단) */
html,
body {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  height: 100% !important;
  overflow: hidden !important; /* 🔥 전체 스크롤 금지 */
  overscroll-behavior: none; /* 당겨서 새로고침 방지 */
}

/* 모든 요소 계산 방식 통일 (패딩 때문에 삐져나오는거 방지) */
*,
*::before,
*::after {
  box-sizing: border-box !important;
}

#app {
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
}

/* 🚀 2. 앱 컨테이너 (모바일 주소창 대응) */
#app-container {
  max-width: 600px;
  width: 100%;
  height: 100vh; /* 기본 */
  height: 100dvh; /* 🔥 모바일 브라우저 주소창 뺀 진짜 높이 */
  margin: 0 auto;
  position: relative;
  background: white;
  display: flex;
  flex-direction: column;
  overflow: hidden !important; /* 내부에서도 밖으로 못 나가게 차단 */
}

/* 🚀 3. 토스트 레이어 (격리 및 중앙 정렬) */
.toaster-layer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99999;
  pointer-events: none;
  display: flex !important;
  justify-content: center !important;
}

.toaster-layer > * {
  pointer-events: auto;
}

/* --- 이하 Toaster 및 컴포넌트 스타일 (동일하게 유지하되 확실히 고정) --- */

[data-sonner-toaster] {
  display: flex !important;
  justify-content: center !important;
  width: 100% !important;
}

[data-sonner-toaster] [data-sonner-toast] {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  width: 240px !important;
  padding: 20px !important;
  border-radius: 24px !important;
  margin: 0 auto !important;
  text-align: center !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
  border: none !important;
}

[data-sonner-toast] [data-content],
[data-sonner-toast] [data-content] > div {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  width: 100% !important;
}

[data-sonner-toaster] ol,
[data-sonner-toaster] li {
  list-style: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

[data-sonner-toast] [data-title] {
  font-weight: 700 !important;
  word-break: keep-all !important;
}

/* 쫀득한 토스 스타일 컴포넌트 유지 */
.t-wrapper {
  display: flex;
  position: relative;
  background: var(--t-bg);
  padding: 2px;
  border-radius: 14px;
  overflow: hidden;
}

.t-active-bg {
  position: absolute;
  top: 2px;
  bottom: 2px;
  left: 2px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.06);
  transition: var(--t-ease);
  width: calc(var(--t-width, 50%) - 4px);
  z-index: 1;
}

.t-btn {
  flex: 1 1 0;
  height: 100%;
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  padding: 12px;
  font-size: 15px;
  font-weight: 600;
  color: var(--t-sub);
  transition: all 0.25s ease;
  cursor: pointer;
}

.t-btn.active {
  color: var(--t-blue);
}
.t-push:active {
  transform: scale(0.96);
  transition: transform 0.1s ease;
}
.active-chip {
  background-color: var(--t-blue) !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(49, 130, 246, 0.25) !important;
}
button:focus {
  outline: none !important;
  box-shadow: none !important;
}
</style>
