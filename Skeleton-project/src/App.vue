<template>
  <div class="min-vh-100 d-flex flex-column">
    <main class="container-fluid py-4 flex-grow-1">
      <Header v-if="!isStartPage" />
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, RouterLink, RouterView } from 'vue-router';
import Header from '@/sides/header-page.vue';

import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/style.css';

const route = useRoute();
const isStartPage = computed(() => route.name === 'startPage');
</script>

<style>
:root {
  --t-blue: #3182f6;
  --t-bg: #f2f4f6;
  --t-sub: #6b7684;
  --t-ease: all 0.35s cubic-bezier(0.4, 0, 0.2, 1.2);
}

/* 전역 스타일 설정 */
html {
  /* 스크롤바가 생겨도 레이아웃 밀림 방지 (핵심) */
  scrollbar-gutter: stable;
}

/* 또는 특정 컨테이너에서만 방지하고 싶을 때 */
.mx-auto {
  scrollbar-gutter: stable;
}

/* 1. 래퍼: 외부에서 width, height를 주면 그에 맞춰 반응함 */
.t-wrapper {
  display: flex; /* 내부 요소 균등 배치를 위해 flex 필수 */
  position: relative;
  background: var(--t-bg);
  padding: 2px;
  border-radius: 14px;
  z-index: 0;
  box-sizing: border-box; /* 크기 설정 시 패딩 포함 계산 */
  overflow: hidden; /* 내부 요소 삐져나감 방지 */
}

/* 2. 슬라이딩 판: 래퍼 높이에 꽉 차게 반응 */
.t-active-bg {
  position: absolute;
  top: 2px;
  bottom: 2px; /* top/bottom 2px로 높이 자동 맞춤 */
  left: 2px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.06);
  transition: var(--t-ease);
  width: calc(var(--t-width, 50%) - 4px); /* 변수값에 따라 너비 결정 */
  z-index: 1;
}

/* 3. 버튼: 높이와 너비를 래퍼에 꽉 채우고 텍스트를 정중앙 배치 */
.t-btn {
  flex: 1 1 0; /* 버튼 개수에 상관없이 1:1:1 비율 유지 */
  height: 100%; /* 래퍼 높이 꽉 채우기 */
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  padding: 0 10px; /* 좌우 최소 여백만 유지 */
  font-size: 15px;
  font-weight: 600;
  color: var(--t-sub);
  transition: color 0.2s ease;
  cursor: pointer;
  white-space: nowrap;
  outline: none !important;
  -webkit-tap-highlight-color: transparent;
  text-decoration: none;
  flex-shrink: 0; /* 버튼이 찌그러지며 너비 변하는 것 방지 */
  backface-visibility: hidden; /* 애니메이션 시 미세한 떨림 방지 */
  transform-origin: center;
}

.t-btn.active {
  color: var(--t-blue);
}

/* 4. 물리 피드백 (쫀득한 클릭) */
.t-push:active {
  transform: scale(0.96); /* 높이/너비 상관없이 비율로 축소 */
  background-color: rgba(0, 0, 0, 0.02) !important;
  transition: transform 0.1s ease;
}

/* 5. 단일 버튼 전용 (독립형 흰색 배경) */
.t-single {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* 6. 부트스트랩/기본 포커스 테두리 제거 */
button:focus {
  outline: none !important;
  box-shadow: none !important;
}

/* 카테고리 칩 전용 활성화 스타일 */
/* 선택되지 않은 기본 상태 (연한 회색 느낌) */
.t-btn.t-single {
  background-color: #ffffff;
  color: var(--t-sub);
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
}

/* 선택된 상태 (토스 블루로 부드럽게 전환) */
.active-chip {
  background-color: var(--t-blue) !important;
  color: #ffffff !important;
  /* 그림자도 파란색 계열로 살짝 넣으면 더 입체적임 */
  box-shadow: 0 4px 12px rgba(49, 130, 246, 0.2) !important;
  border-color: transparent !important;
}
</style>
