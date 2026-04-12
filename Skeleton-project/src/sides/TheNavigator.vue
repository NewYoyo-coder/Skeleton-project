<template>
  <nav
    class="gnb-wrapper fixed-bottom z-3 mx-auto"
    style="max-width: 600px; min-width: 320px"
  >
    <div class="gnb-container d-flex align-items-center justify-content-around">
      <router-link
        to="/mainDashboard"
        class="gnb-item d-flex flex-column align-items-center"
        active-class="active"
      >
        <i class="bi bi-house-door-fill fs-5"></i>
        <span class="small-text">메인</span>
      </router-link>

      <router-link
        to="/transactionHistory"
        class="gnb-item d-flex flex-column align-items-center"
        active-class="active"
      >
        <i class="bi bi-receipt fs-5"></i>
        <span class="small-text">거래 내역</span>
      </router-link>

      <router-link
        to="/report"
        class="gnb-item d-flex flex-column align-items-center"
        active-class="active"
      >
        <i class="bi bi-pie-chart fs-5"></i>
        <span class="small-text">리포트</span>
      </router-link>

      <router-link
        to="/settings"
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
// 부트스트랩 아이콘 CDN 추가 필요 (index.html에)
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

/* 🗓️ GNB 래퍼 (유리 질감) */
.gnb-wrapper {
  padding: 0 16px 12px; /* 좌우 하단 여백 */
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.95) 40%
  );
}

/* GNB 컨테이너 */
.gnb-container {
  height: 64px;
  background: rgba(255, 255, 255, 0.85); /* 투명도 */
  backdrop-filter: blur(12px); /* 유리 질감 핵심 */
  -webkit-backdrop-filter: blur(12px);
  border-radius: 32px; /* 둥근 카드 형태 */
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08); /* 세련된 그림자 */
  position: relative;
}

/* 네비 아이템 공통 */
.gnb-item {
  text-decoration: none;
  color: #a0a0a0; /* 비활성화 색상 */
  width: 50px;
  transition: all 0.2s ease;
  position: relative;
}

/* 활성화 상태 색상 */
.gnb-item.active {
  color: #3182f6; /* 토스 블루 */
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
