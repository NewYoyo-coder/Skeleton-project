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
            ? isFuture
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
        <div
          class="d-flex justify-content-center align-items-center mb-4 gap-4"
        >
          <button
            class="btn btn-link text-dark p-0 text-decoration-none"
            @click="triggerSwipe(-1)"
          >
            <i class="fa-solid fa-chevron-left fs-4"></i>
          </button>

          <h3
            class="text-dark mb-0"
            style="font-weight: 300; min-width: 130px; text-align: center"
          >
            {{ displayDate }}
          </h3>

          <button
            class="btn btn-link text-dark p-0 text-decoration-none"
            @click="triggerSwipe(1)"
          >
            <i class="fa-solid fa-chevron-right fs-4"></i>
          </button>
        </div>
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

const displayDate = computed(() => {
  const y = dateStore.selectedYear;
  const m = dateStore.selectedMonth;
  const mm = m < 10 ? `0${m}` : m;
  return `${y}. ${mm}`;
});

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
  // 마운트 되기 전에도 바로 실행함
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

// --- 드래그/스와이프 로직 복구 ---
const startX = ref(0);
const dragOffset = ref(0);
const isDragging = ref(false);

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
  if (dragOffset.value > 100) changeMonth(-1);
  else if (dragOffset.value < -100) changeMonth(1);
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
  const today = new Date();
  const isFuture =
    year.value > today.getFullYear() ||
    (year.value === today.getFullYear() && month.value >= today.getMonth());

  if (dragOffset.value > 70) {
    changeMonth(-1);
  } else if (dragOffset.value < -70) {
    // 미래가 아닐 때만 다음 달로 이동
    if (!isFuture) changeMonth(1);
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

  dateStore.setDate(year, month); // Pinia 스토어 업데이트 -> 자동 반응
};

const triggerSwipe = (diff) => {
  // 1. 먼저 이펙트부터 확실하게 보여줌
  // 이전 달(diff: -1)이면 오른쪽으로 밀리는 느낌(150), 다음 달이면 왼쪽(-150)
  dragOffset.value = diff === -1 ? 150 : -150;

  // 2. 이펙트가 사용자 눈에 인지될 시간을 충분히 줌 (150ms~200ms)
  setTimeout(() => {
    // 3. 실제 데이터 변경
    changeMonth(diff);

    // 4. 데이터 변경 후 바로 오프셋을 0으로 날리지 않고,
    // 다음 프레임에서 부드럽게 초기화되도록 살짝 지연 (애니메이션 끊김 방지)
    setTimeout(() => {
      dragOffset.value = 0;
    }, 50);
  }, 200);
};
</script>

<style scoped>
.bg-f1f1f1 {
  background-color: #f1f1f1;
}
.floating-add-btn {
  width: 60px;
  height: 60px;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
  transition: transform 0.2s ease;
}
/* 3. 스와이프 관련 UI */
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
  /* ✨ transform 삭제하고 opacity만 부드럽게 남김 */
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
