<template>
  <div class="calendar-container p-3">
    <div class="d-flex justify-content-between align-items-center mb-3 px-2">
      <button
        class="btn btn-sm btn-light rounded-circle"
        @click="changeMonth(-1)"
      >
        <i class="bi bi-chevron-left"></i>
      </button>
      <h5 class="m-0 fw-bold">{{ currentYear }}년 {{ currentMonth }}월</h5>
      <button
        class="btn btn-sm btn-light rounded-circle"
        @click="changeMonth(1)"
      >
        <i class="bi bi-chevron-right"></i>
      </button>
    </div>

    <div class="cal-grid mb-4">
      <div
        class="text-center small text-muted fw-bold pb-2"
        v-for="d in ['일', '월', '화', '수', '목', '금', '토']"
        :key="d"
      >
        {{ d }}
      </div>

      <div
        v-for="n in firstDayOffset"
        :key="'empty-' + n"
        class="cal-cell empty"
      ></div>

      <div
        v-for="day in daysInMonth"
        :key="day"
        class="cal-cell"
        :class="{ active: selectedDate === day }"
        @click="selectedDate = day"
      >
        <span class="day-num">{{ day }}</span>
        <div class="dots-wrapper d-flex gap-1 justify-content-center mt-1">
          <span
            v-if="dailySummary[day]?.hasIncome"
            class="dot income-dot"
          ></span>
          <span
            v-if="dailySummary[day]?.hasExpense"
            class="dot expense-dot"
          ></span>
        </div>
      </div>
    </div>

    <div class="selected-day-list border-top pt-3">
      <h6 class="fw-bold mb-3 px-1">
        {{ currentMonth }}월 {{ selectedDate }}일 내역
      </h6>

      <div v-if="selectedTransactions.length > 0">
        <div
          v-for="t in selectedTransactions"
          :key="t.id"
          class="d-flex justify-content-between align-items-center p-3 mb-2 bg-light rounded-4"
        >
          <div>
            <span
              class="badge"
              :class="
                t.transaction_type === 'income'
                  ? 'text-bg-primary'
                  : 'text-bg-danger'
              "
            >
              {{ CATEGORY_LABEL[t.category] || t.category }}
            </span>
            <span class="ms-2 small text-secondary">{{
              t.memo || '내역'
            }}</span>
          </div>
          <div
            class="fw-bold"
            :class="
              t.transaction_type === 'income' ? 'text-primary' : 'text-danger'
            "
          >
            {{ t.transaction_type === 'income' ? '+' : '-'
            }}{{ t.amount.toLocaleString() }}원
          </div>
        </div>
      </div>
      <div v-else class="text-center text-muted py-4 small">
        이날은 거래 내역이 없네요 🍃
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useTransactionStore } from '@/stores/transaction';
// 합치신 상수를 임포트 (경로는 본인 프로젝트에 맞게 수정)
import { CATEGORY_LABEL } from '@/constants/categories.js';

const transactionStore = useTransactionStore();

const today = new Date();
const currentYear = ref(today.getFullYear());
const currentMonth = ref(today.getMonth() + 1);
const selectedDate = ref(today.getDate());

// 달력 계산 로직
const daysInMonth = computed(() =>
  new Date(currentYear.value, currentMonth.value, 0).getDate(),
);
const firstDayOffset = computed(() =>
  new Date(currentYear.value, currentMonth.value - 1, 1).getDay(),
);

// 월 변경 함수
const changeMonth = (delta) => {
  let newM = currentMonth.value + delta;
  let newY = currentYear.value;
  if (newM > 12) {
    newM = 1;
    newY++;
  } else if (newM < 1) {
    newM = 12;
    newY--;
  }
  currentMonth.value = newM;
  currentYear.value = newY;
  selectedDate.value = 1; // 달 바뀌면 1일로 초기화
};

// 이번 달 전체 데이터 필터링
const currentMonthTransactions = computed(() => {
  return transactionStore.transactions.filter((t) => {
    const d = new Date(t.date);
    return (
      d.getFullYear() === currentYear.value &&
      d.getMonth() + 1 === currentMonth.value
    );
  });
});

// 날짜별 수입/지출 점 찍기용 요약 맵 생성
const dailySummary = computed(() => {
  const map = {};
  currentMonthTransactions.value.forEach((t) => {
    const day = new Date(t.date).getDate();
    if (!map[day]) map[day] = { hasIncome: false, hasExpense: false };
    if (t.transaction_type === 'income') map[day].hasIncome = true;
    if (t.transaction_type === 'expense') map[day].hasExpense = true;
  });
  return map;
});

// 선택한 날짜의 상세 내역
const selectedTransactions = computed(() => {
  return currentMonthTransactions.value.filter(
    (t) => new Date(t.date).getDate() === selectedDate.value,
  );
});
</script>

<style scoped>
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}
.cal-cell {
  height: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.cal-cell:not(.empty):active {
  transform: scale(0.9);
}
.cal-cell.active {
  background-color: #3182f6;
  color: white;
  box-shadow: 0 4px 12px rgba(49, 130, 246, 0.3);
}
.day-num {
  font-size: 14px;
  font-weight: 500;
}
.dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
}
.income-dot {
  background-color: #3182f6;
}
.expense-dot {
  background-color: #f04452;
}
.cal-cell.active .dot {
  background-color: rgba(255, 255, 255, 0.7);
} /* 선택시 점 색상 반전 */
</style>
