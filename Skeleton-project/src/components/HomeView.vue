<template>
  <div class="home-page">
    <TopNav />

    <div class="container">
      <div class="welcome-card">
        <h2>홈 화면</h2>
        <p><strong>이름:</strong> {{ userStore.name }}</p>
        <p><strong>이메일:</strong> {{ userStore.email }}</p>
      </div>

      <div class="summary-section">
        <div class="summary-card income">이번 달 수입: 0원</div>
        <div class="summary-card expense">이번 달 지출: 0원</div>
        <div class="summary-card balance">현재 잔액: 0원</div>
      </div>

      <div class="recent-card">
        <h3>최근 거래 내역</h3>
        <p>아직 거래 내역이 없습니다.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import TopNav from '../components/TopNav.vue';
import { useUserStore } from '../../src/stores/userStore';

const userStore = useUserStore();
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: var(--bg-color);
  color: var(--text-color);
}

.container {
  max-width: 800px;
  margin: 30px auto;
  padding: 0 16px;
}

.welcome-card,
.recent-card {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.summary-section {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.summary-card {
  flex: 1;
  padding: 18px;
  border-radius: 14px;
  color: white;
  text-align: center;
  font-weight: bold;
}

.income {
  background: #4caf50;
}

.expense {
  background: #e76f51;
}

.balance {
  background: #457b9d;
}
</style>
