<template>
  <div class="calendar-container p-3">
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

    <div
      class="selected-day-list pt-3 d-flex flex-column"
      style="height: 300px"
    >
      <h6 class="fw-bold mb-3 px-1">{{ month }}월 {{ selectedDate }}일 내역</h6>

      <div
        class="flex-grow-1 overflow-y-auto px-1 custom-scroll"
        style="max-height: 100%"
      >
        <div v-if="selectedTransactions.length > 0">
          <div
            v-for="t in selectedTransactions"
            :key="t.id"
            class="d-flex justify-content-between align-items-center p-3 mb-2 bg-light rounded-4 transition-all"
          >
            <div class="d-flex align-items-center gap-2">
              <div
                class="px-2 py-1 rounded-3 fw-bold"
                style="
                  background-color: rgba(0, 0, 0, 0.05);
                  font-size: 0.75rem;
                  color: #6b7684;
                "
              >
                {{ t.category }}
              </div>

              <div class="fw-bold text-dark" style="font-size: 0.9rem">
                {{ t.description }}
              </div>
            </div>

            <div class="text-end">
              <div
                class="fw-bold"
                :class="
                  t.transaction_type === 'income'
                    ? 'text-primary'
                    : 'text-danger'
                "
                style="font-size: 0.95rem"
              >
                {{ t.transaction_type === "income" ? "+" : "-" }}
                {{ Number(t.amount).toLocaleString() }}원
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center text-muted py-4 small">
          이날은 거래 내역이 없네요 🍃
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useTransactionStore } from "@/stores/transaction";
import { CATEGORY_LABEL } from "@/constants/categories.js";

// 🚀 부모로부터 연도와 월을 주입받음
const props = defineProps(["year", "month"]);
const transactionStore = useTransactionStore();

const selectedDate = ref(1);

// 부모의 연/월이 바뀔 때마다 1일로 초기화
watch(
  () => [props.year, props.month],
  () => {
    selectedDate.value = 1;
  },
);

const daysInMonth = computed(() =>
  new Date(props.year, props.month, 0).getDate(),
);
const firstDayOffset = computed(() =>
  new Date(props.year, props.month - 1, 1).getDay(),
);

const currentMonthTransactions = computed(() => {
  return transactionStore.transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === props.year && d.getMonth() + 1 === props.month;
  });
});

const dailySummary = computed(() => {
  const map = {};
  currentMonthTransactions.value.forEach((t) => {
    const day = new Date(t.date).getDate();
    if (!map[day]) map[day] = { hasIncome: false, hasExpense: false };
    if (t.transaction_type === "income") map[day].hasIncome = true;
    if (t.transaction_type === "expense") map[day].hasExpense = true;
  });
  return map;
});

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
}
.custom-scroll::-webkit-scrollbar {
  width: 4px; /* 아주 얇게 */
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}
</style>
