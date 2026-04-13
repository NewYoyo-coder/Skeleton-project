<template>
  <nav
    class="gnb-wrapper fixed-bottom z-3 mx-auto"
    style="max-width: 600px; min-width: 320px"
  >
    <div class="gnb-container d-flex align-items-center justify-content-around">
      <router-link
        :to="{ path: '/mainDashboard', query: route.query }"
        class="gnb-item d-flex flex-column align-items-center"
        active-class="active"
      >
        <i class="bi bi-house-door-fill fs-5"></i>
        <span class="small-text">메인</span>
      </router-link>

      <router-link
        :to="{ path: '/transactionHistory', query: route.query }"
        class="gnb-item d-flex flex-column align-items-center"
        active-class="active"
      >
        <i class="bi bi-receipt fs-5"></i>
        <span class="small-text">거래 내역</span>
      </router-link>

      <router-link
        :to="{ path: '/report', query: route.query }"
        class="gnb-item d-flex flex-column align-items-center"
        active-class="active"
      >
        <i class="bi bi-pie-chart fs-5"></i>
        <span class="small-text">리포트</span>
      </router-link>

      <router-link
        :to="{ path: '/settings', query: route.query }"
        class="gnb-item d-flex flex-column align-items-center"
        active-class="active"
      >
        <i class="bi bi-gear fs-5"></i>
        <span class="small-text">설정</span>
      </router-link>
    </div>
  </nav>
</template>
<script setup>
import { useRoute } from "vue-router";
const route = useRoute();

// 💡 팁: 부트스트랩 아이콘은 index.html에 추가되어 있어야 합니다.
</script>

<style scoped>
/* 앱 전체 래퍼 */
.app-wrapper {
  height: 100vh;
  background-color: #f8f9fa;
}

/* 메인 콘텐츠 영역 여백 (네비바에 가려지지 않게) */
main {
  padding-bottom: 90px !important; /* 네비바 높이 + 알파 */
}

/* 🗓️ GNB 래퍼 (그라데이션 투명도 조절) */
.gnb-wrapper {
  padding: 0 16px 12px;
  /* 배경 그라데이션이 다크모드일 때도 자연스럽게 변수 처리 */
  background: linear-gradient(
    180deg,
    transparent 0%,
    var(--bg) 40% /* 💡 흰색 대신 테마 배경색 변수 사용 */
  );
}

/* GNB 컨테이너 (핵심) */
.gnb-container {
  height: 64px;
  /* 💡 다크모드에서는 var(--card-bg)가 적용되도록 수정 */
  background: var(--card-bg);
  opacity: 0.9; /* 투명도 살짝 유지 */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 32px;
  /* 💡 보더 색상도 변수 처리 */
  border: 1px solid var(--border);
  box-shadow: var(--shadow); /* 💡 정의한 묵직한 다크 그림자 상속 */
  position: relative;
}

/* 네비 아이템 (비활성화 상태) */
.gnb-item {
  text-decoration: none;
  color: var(--text); /* 💡 회색(#a0a0a0) 대신 변수 사용 */
  opacity: 0.6; /* 비활성화는 불투명도로 조절하는 게 다크모드에서 더 예쁨 */
  transition: all 0.2s ease;
}

/* 활성화 상태 */
.gnb-item.active {
  color: var(--accent); /* 💡 토스블루 대신 포인트 컬러 변수 사용 */
  opacity: 1;
}

/* 작은 글씨 스타일 */
.small-text {
  font-size: 10px;
  font-weight: 600;
  margin-top: 1px;
  letter-spacing: -0.5px;
}

/* ➕ 중앙 플로팅 버튼 래퍼 */
.gnb-fab-wrapper {
  position: relative;
  width: 64px;
  height: 64px;
}

/* 플로팅 버튼 본체 */
.gnb-fab-button {
  position: absolute;
  left: 50%;
  top: 70%;
  transform: translate(-50%, -70%); /* 위로 살짝 띄우기 */
  width: 48px;
  height: 48px;
  border-radius: 28px;
  background-color: #3182f6; /* 주인공 색상 */
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 6px 16px rgba(49, 130, 246, 0.4) !important;
}

/* 버튼 hover/active 효과 (쫀득하게) */
.gnb-fab-button:active {
  transform: translate(-50%, -65%) scale(0.95);
  background-color: #1b64da;
}

/* 화면 전환 애니메이션 (선택사항) */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
