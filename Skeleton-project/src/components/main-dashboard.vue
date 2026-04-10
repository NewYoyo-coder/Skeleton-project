<template>
  <div
    class="position-relative min-vh-100 bg-light custom-font overflow-hidden"
    style="user-select: none"
    @mousedown="startDrag"
    @mousemove="onDrag"
    @mouseup="endDrag"
    @mouseleave="endDrag"
    @touchstart="startTouch"
    @touchmove="onTouch"
    @touchend="endTouch"
  >
    <div
      class="swipe-overlay"
      :style="{
        transform: `translateX(${dragOffset > 0 ? '-100%' : '100%'})`,
        left: `${dragOffset}px`,
        opacity: Math.abs(dragOffset) / 200,
      }"
    ></div>
    <div class="swipe-hint" :style="{ opacity: dragOffset !== 0 ? 0.9 : 0 }">
      {{
        dragOffset > 50
          ? '이전 달로'
          : dragOffset < -50
            ? isFutureMonth
              ? '이동 불가'
              : '다음 달로'
            : ''
      }}
    </div>

    <div class="dashboard-wrapper pt-4 pb-2">
      <div
        class="container"
        style="max-width: 600px; margin-left: auto; margin-right: auto"
      >
        <div class="card border-0 shadow-sm rounded-4 mb-3">
          <div
            class="card-body p-4 d-flex justify-content-between align-items-center"
          >
            <div>
              <div class="text-dark fw-bold mb-1" style="font-size: 0.9rem">
                순수익
              </div>
              <h2 class="fw-bold mb-0 text-dark">
                {{ formatNumber(netIncome) }}
                <span style="font-size: 1.2rem">원</span>
              </h2>
            </div>
          </div>
        </div>

        <div class="row g-3">
          <div class="col-6">
            <div class="card border-0 shadow-sm rounded-4 h-100">
              <div class="card-body text-center p-3">
                <div
                  class="text-primary mb-1"
                  style="font-size: 0.85rem; font-weight: 600"
                >
                  총 수입
                </div>
                <h5 class="text-primary mb-0">
                  {{ formatNumber(totalIncome) }}원
                </h5>
              </div>
            </div>
          </div>

          <div class="col-6">
            <div class="card border-0 shadow-sm rounded-4 h-100">
              <div class="card-body text-center p-3">
                <div
                  class="text-danger mb-1"
                  style="font-size: 0.85rem; font-weight: 600"
                >
                  총 지출
                </div>
                <h5 class="text-danger mb-0">
                  {{ totalExpense > 0 ? '-' : ''
                  }}{{ formatNumber(totalExpense) }} 원
                </h5>
              </div>
            </div>
          </div>
        </div>

        <recentTransaction />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import { useDateStore } from '@/stores/select-date.js';
import recentTransaction from './main-recentTransaction.vue';

const dateStore = useDateStore();
const transactions = ref([]);

// 💡 displayDate 변수는 헤더로 갔으므로 삭제됨

const fetchTransactions = async () => {
  try {
    const response = await axios.get('http://localhost:3000/transactions');
    transactions.value = response.data.filter((tx) => {
      const txDate = new Date(tx.date);
      return (
        txDate.getFullYear() === dateStore.selectedYear &&
        txDate.getMonth() + 1 === dateStore.selectedMonth
      );
    });
  } catch (error) {
    console.error('데이터 통신 에러:', error);
  }
};

watch(
  [() => dateStore.selectedYear, () => dateStore.selectedMonth],
  () => {
    fetchTransactions();
  },
  { immediate: true },
);

onMounted(() => {
  fetchTransactions();
});

const totalIncome = computed(() => {
  return transactions.value
    .filter((t) => t.transaction_type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
});

const totalExpense = computed(() => {
  return transactions.value
    .filter((t) => t.transaction_type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
});

const netIncome = computed(() => totalIncome.value - totalExpense.value);

const formatNumber = (num) => {
  return num.toLocaleString('ko-KR');
};

// --- 드래그/스와이프 로직 ---
const startX = ref(0);
const dragOffset = ref(0);
const isDragging = ref(false);

// 💡 스와이프 시 미래 달력 차단을 위한 변수 (에러 수정됨)
const isFutureMonth = computed(() => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  return (
    dateStore.selectedYear > currentYear ||
    (dateStore.selectedYear === currentYear &&
      dateStore.selectedMonth >= currentMonth)
  );
});

const startDrag = (e) => {
  isDragging.value = true;
  startX.value = e.pageX;
};
const onDrag = (e) => {
  if (!isDragging.value) return;
  dragOffset.value = e.pageX - startX.value;
};
const endDrag = () => {
  if (!isDragging.value) return;
  if (dragOffset.value > 100) {
    changeMonth(-1);
  } else if (dragOffset.value < -100) {
    if (!isFutureMonth.value) changeMonth(1); // 마우스 드래그 시 미래 차단
  }
  isDragging.value = false;
  dragOffset.value = 0;
};

const startTouch = (e) => {
  startX.value = e.touches[0].pageX;
};
const onTouch = (e) => {
  dragOffset.value = e.touches[0].pageX - startX.value;
};
const endTouch = () => {
  if (dragOffset.value > 70) {
    changeMonth(-1);
  } else if (dragOffset.value < -70) {
    if (!isFutureMonth.value) changeMonth(1); // 모바일 터치 시 미래 차단
  }
  dragOffset.value = 0;
};

const changeMonth = (diff) => {
  let year = dateStore.selectedYear;
  let month = dateStore.selectedMonth + diff;

  if (month > 12) {
    month = 1;
    year++;
  } else if (month < 1) {
    month = 12;
    year--;
  }

  dateStore.setDate(year, month);
};

// 💡 triggerSwipe 함수는 버튼 전용이었으므로 삭제됨
</script>

<style scoped>
.bg-f1f1f1 {
  background-color: #f1f1f1;
}

/* 💡 App.vue로 이사간 floating-add-btn 스타일 삭제됨 */

.swipe-overlay {
  position: absolute;
  top: 5%;
  height: 80%;
  width: 100%;
  background: radial-gradient(
    circle at center,
    rgba(49, 130, 246, 0.8) 0%,
    rgba(131, 56, 236, 0.4) 60%,
    transparent 100%
  );
  filter: blur(20px);
  border-radius: 50% 100% 100% 50%;
  z-index: 9999;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.swipe-hint {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #3182f6;
  color: #fff;
  padding: 12px 24px;
  border-radius: 30px;
  font-weight: 700;
  pointer-events: none;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(49, 130, 246, 0.3);
  transition: opacity 0.2s ease;
}
</style>
