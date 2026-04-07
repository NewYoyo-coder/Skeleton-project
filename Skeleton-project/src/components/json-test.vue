<template>
  <div class="kmj-light-container">
    <header class="kmj-dashboard">
      <div class="stat-card balance">
        <p class="label">남은 재산</p>
        <h2 class="value">
          {{ kmj_totalBalance.toLocaleString() }}<span>원</span>
        </h2>
        <div class="deco-circle"></div>
      </div>
      <div class="stat-group">
        <div class="stat-card income">
          <p class="label">총 수입</p>
          <h3 class="value">+{{ kmj_totalIncome.toLocaleString() }}</h3>
        </div>
        <div class="stat-card expense">
          <p class="label">총 지출</p>
          <h3 class="value">-{{ kmj_totalExpense.toLocaleString() }}</h3>
        </div>
      </div>
    </header>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>데이터 동기화 중...</p>
    </div>

    <main v-else class="transaction-grid">
      <div v-for="item in kmj_items" :key="item.id" class="wide-card">
        <div class="card-left">
          <div class="date-box">
            <span class="day">{{ item.date.split("-")[2] }}</span>
            <span class="month">{{ item.date.split("-")[1] }}월</span>
          </div>
          <div class="info-group">
            <h4 class="shop">{{ item.shop_name }}</h4>
            <p class="item">{{ item.item_name }}</p>
            <div class="tags">
              <span class="tag cat">#{{ item.category }}</span>
              <span class="tag method">{{ item.payment_method }}</span>
            </div>
          </div>
        </div>

        <div class="card-right">
          <div :class="['amount', item.transaction_type]">
            {{ item.transaction_type === "income" ? "+" : "-"
            }}{{ item.amount.toLocaleString() }}원
          </div>
          <p v-if="item.memo" class="memo">"{{ item.memo }}"</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const kmj_items = ref([]);
const loading = ref(true);

// 통계 계산 (computed)
const kmj_totalIncome = computed(() =>
  kmj_items.value
    .filter((i) => i.transaction_type === "income")
    .reduce((acc, cur) => acc + cur.amount, 0),
);

const kmj_totalExpense = computed(() =>
  kmj_items.value
    .filter((i) => i.transaction_type === "expense")
    .reduce((acc, cur) => acc + cur.amount, 0),
);

const kmj_totalBalance = computed(
  () => kmj_totalIncome.value - kmj_totalExpense.value,
);

const kmj_loadData = async () => {
  try {
    // transaction_db.json 서버 연결
    const res = await fetch("http://localhost:3000/transactions");
    const data = await res.json();
    kmj_items.value = Array.isArray(data) ? data : data.transactions;
  } catch (e) {
    console.error("데이터 로드 실패", e);
  } finally {
    loading.value = false;
  }
};

onMounted(kmj_loadData);
</script>

<style scoped>
/* 폰트 및 기본 설정 */
@import url("https://fonts.googleapis.com/css2?family=Pretendard:wght@400;600;800&display=swap");

.kmj-light-container {
  background: #f0f7ff;
  min-height: 100vh;
  padding: 40px 5%;
  color: #1e293b;
  font-family: "Pretendard", sans-serif;
  box-sizing: border-box;
}

/* 대시보드 요약 영역 */
.kmj-dashboard {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto 50px;
  display: flex; /* 그리드 대신 플렉스로 유연성 확보 */
  gap: 25px;
  flex-wrap: wrap; /* 화면 좁아지면 아래로 내려가게 */
}

.stat-card {
  flex: 1;
  min-width: 300px; /* 너무 좁아지지 않게 방지 */
  background: #ffffff;
  padding: 35px;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(58, 134, 255, 0.05);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(58, 134, 255, 0.1);
}

.stat-card.balance {
  flex: 1.5;
  background: linear-gradient(135deg, #3a86ff 0%, #8338ec 100%);
  color: #ffffff;
}

.stat-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 300px;
}

.stat-group .stat-card {
  padding: 20px 35px;
}

.label {
  font-size: 1rem;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 600;
}
.balance .label {
  color: rgba(255, 255, 255, 0.8);
}
.value {
  margin: 0;
  font-weight: 800;
  white-space: nowrap;
} /* 글자 줄바꿈 방지 */
.balance .value {
  font-size: clamp(2rem, 4vw, 3.5rem);
} /* 화면에 따라 폰트 크기 가변 */
.income .value {
  color: #3a86ff;
  font-size: 2rem;
}
.expense .value {
  color: #8338ec;
  font-size: 2rem;
}

/* 거래 내역 리스트 영역 */
.transaction-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
}

/* 와이드 카드 디자인: 글자 깨짐 방지 핵심 로직 */
.wide-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 30px 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px; /* 요소 간 최소 간격 */
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(58, 134, 255, 0.05);
  overflow: hidden; /* 영역 삐져나감 방지 */
}

.wide-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(58, 134, 255, 0.1);
}

.card-left {
  display: flex;
  align-items: center;
  gap: 40px;
  flex: 1; /* 왼쪽 영역이 공간을 최대한 차지 */
  min-width: 0; /* flex 자식의 글자 깨짐 방지 핵심 */
}

.date-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: 2px solid #f0f4f8;
  padding-right: 30px;
  min-width: 80px;
  flex-shrink: 0; /* 날짜 상자는 크기 유지 */
}

.day {
  font-size: 1.8rem;
  font-weight: 900;
  color: #1e293b;
}
.month {
  font-size: 0.9rem;
  color: #94a3b8;
}

.info-group {
  min-width: 0; /* 텍스트 생략 기능을 위해 필요 */
  flex: 1;
}

.shop {
  font-size: 1.5rem;
  margin: 0;
  color: #1e293b;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* 긴 가게 이름 생략 처리 */
}

.item {
  font-size: 1rem;
  color: #64748b;
  margin: 6px 0 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.tag {
  font-size: 0.8rem;
  padding: 5px 12px;
  border-radius: 50px;
  font-weight: 600;
  white-space: nowrap;
}
.tag.cat {
  background: rgba(58, 134, 255, 0.1);
  color: #3a86ff;
}
.tag.method {
  background: #f1f5f9;
  color: #475569;
}

/* 오른쪽 영역 (금액) */
.card-right {
  text-align: right;
  flex-shrink: 0; /* 금액은 줄어들지 않게 */
}

.amount {
  font-size: 2rem;
  font-weight: 900;
  white-space: nowrap;
}
.amount.income {
  color: #3a86ff;
}
.amount.expense {
  color: #8338ec;
}

.memo {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-top: 10px;
  background: #f8fbff;
  padding: 6px 12px;
  border-radius: 10px;
  display: inline-block;
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 로딩 애니메이션 */
.loading-state {
  text-align: center;
  padding: 80px 0;
  color: #3a86ff;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #fff;
  border-top-color: #3a86ff;
  border-radius: 50%;
  animation: spin 1s infinite linear;
  margin: 0 auto 15px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 모바일 대응 (반응형 최적화) */
@media (max-width: 768px) {
  .kmj-light-container {
    padding: 20px 15px;
  }
  .wide-card {
    flex-direction: column;
    align-items: flex-start;
    padding: 25px;
    gap: 15px;
  }
  .card-left {
    gap: 20px;
    width: 100%;
  }
  .card-right {
    width: 100%;
    text-align: left;
    border-top: 1px solid #f0f4f8;
    padding-top: 15px;
  }
  .date-box {
    padding-right: 20px;
    min-width: 60px;
  }
}
</style>
