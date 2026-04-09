<template>
  <div class="dashboard-wrapper bg-f1f1f1 min-vh-100 pt-4 pb-5">
    <div class="container px-4">
      <h3 class="text-center mb-4 text-dark" style="font-weight: 300">
        {{ displayDate }}
      </h3>

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
    </div>
    <router-link
      to="/addTransaction"
      class="btn btn-dark rounded-circle position-fixed shadow floating-add-btn d-flex justify-content-center align-items-center"
    >
      <i class="fa-solid fa-plus fs-3"></i>
    </router-link>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import { useDateStore } from '@/stores/select-date.js';

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
</style>
