<template>
  <div
    class="chart-container h-100 d-flex flex-column p-2 gap-2 overflow-hidden bg-light"
  >
    <div
      class="ai-summary p-3 rounded-4 shadow-sm bg-white position-relative flex-shrink-0 border"
    >
      <div
        class="position-absolute top-0 start-0 w-100 h-100 bg-gradient-ai opacity-10 rounded-4"
      ></div>
      <div class="d-flex align-items-center gap-2 mb-1 position-relative z-1">
        <i class="bi bi-robot fs-6 text-warning"></i>
        <span class="fw-bold text-warning" style="font-size: 0.8rem"
          >AI 금융 비서</span
        >
      </div>
      <div class="position-relative z-1 text-dark d-flex flex-column gap-1">
        <div class="d-flex align-items-center gap-1 text-truncate">
          <span style="font-size: 0.85rem">📈</span>
          <span class="fw-bold text-truncate" style="font-size: 0.8rem">{{
            aiIncomeSummaryText
          }}</span>
        </div>
        <div class="d-flex align-items-center gap-1 text-truncate">
          <span style="font-size: 0.85rem">📉</span>
          <span class="fw-bold text-truncate" style="font-size: 0.8rem">{{
            aiExpenseSummaryText
          }}</span>
        </div>
      </div>
    </div>

    <div class="d-flex gap-2 flex-shrink-0" style="height: 220px">
      <div
        class="w-50 bg-white rounded-4 p-2 shadow-sm border d-flex flex-column position-relative"
      >
        <div
          class="text-center fw-bold text-danger mb-1"
          style="font-size: 0.8rem"
        >
          지출 비중
        </div>
        <div class="flex-grow-1 position-relative" style="min-height: 0">
          <apexchart
            v-if="totalExpense > 0"
            type="donut"
            height="100%"
            :options="expenseOptions"
            :series="expenseSeries"
          />
          <div
            v-else
            class="h-100 d-flex align-items-center justify-content-center text-muted"
            style="font-size: 0.75rem"
          >
            무지출 🎉
          </div>
        </div>
      </div>

      <div
        class="w-50 bg-white rounded-4 p-2 shadow-sm border d-flex flex-column position-relative"
      >
        <div
          class="text-center fw-bold text-primary mb-1"
          style="font-size: 0.8rem"
        >
          수입 비중
        </div>
        <div class="flex-grow-1 position-relative" style="min-height: 0">
          <apexchart
            v-if="totalIncome > 0"
            type="donut"
            height="100%"
            :options="incomeOptions"
            :series="incomeSeries"
          />
          <div
            v-else
            class="h-100 d-flex align-items-center justify-content-center text-muted"
            style="font-size: 0.75rem"
          >
            수입 없음 💦
          </div>
        </div>
      </div>
    </div>

    <div
      class="bg-white rounded-4 p-2 shadow-sm border flex-shrink-0 d-flex flex-column mb-1"
      style="height: 200px; min-height: 0"
    >
      <div
        class="text-center fw-bold text-dark mb-0"
        style="font-size: 0.8rem; line-height: 1.2"
      >
        수입 vs 지출 대결
      </div>
      <div
        class="flex-grow-1 position-relative"
        style="min-height: 0; margin-top: -5px"
      >
        <apexchart
          type="bar"
          height="100%"
          :options="vsOptions"
          :series="vsSeries"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useTransactionStore } from "@/stores/transaction";
import { CATEGORY_LABEL } from "@/constants/categories.js";

const props = defineProps(["year", "month"]);
const transactionStore = useTransactionStore();

// ==========================================
// 🔴 지출 (Expense) 데이터 세팅
// ==========================================
const expenseTotals = computed(() => {
  const totals = {};
  transactionStore.transactions
    .filter(
      (t) =>
        new Date(t.date).getFullYear() === props.year &&
        new Date(t.date).getMonth() + 1 === props.month &&
        t.transaction_type === "expense",
    )
    .forEach(
      (t) =>
        (totals[t.category] = (totals[t.category] || 0) + Math.abs(t.amount)),
    );
  return Object.keys(totals)
    .map((key) => ({
      key,
      label: CATEGORY_LABEL[key] || key,
      amount: totals[key],
    }))
    .sort((a, b) => b.amount - a.amount);
});
const totalExpense = computed(() =>
  expenseTotals.value.reduce((sum, i) => sum + i.amount, 0),
);
const expenseSeries = computed(() => expenseTotals.value.map((c) => c.amount));

const expenseOptions = computed(() => ({
  labels: expenseTotals.value.map((c) => c.label),
  chart: {
    type: "donut",
    fontFamily: "inherit",
    animations: { dynamicAnimation: { speed: 400 } },
  },
  colors: ["#ff6b6b", "#fcc419", "#ff922b", "#f06595", "#cc5de8"],
  plotOptions: {
    pie: {
      donut: {
        size: "70%",
        labels: {
          show: true,
          name: { show: false },
          value: {
            show: true,
            fontSize: "12px",
            fontWeight: "bold",
            formatter: () => "총 지출",
          },
          total: {
            showAlways: true,
            show: true,
            label: "총 지출",
            color: "#ff6b6b",
            formatter: () => "지출",
          },
        },
      },
    },
  },
  dataLabels: { enabled: false }, // 🚀 좁으니까 글씨 싹 다 없앰!
  legend: { show: false }, // 🚀 범례도 과감히 생략 (터치하면 툴팁 뜸)
  stroke: { width: 1, colors: ["#fff"] },
  tooltip: { y: { formatter: (val) => val.toLocaleString() + "원" } },
}));

const aiExpenseSummaryText = computed(() => {
  if (totalExpense.value === 0) return "지갑 봉인 완료! 완벽한 무지출입니다.";
  const top = expenseTotals.value[0];
  return `이번 달은 ${top.label} 지출이 1위! 텅장 주의보 💸`;
});

// ==========================================
// 🔵 수입 (Income) 데이터 세팅
// ==========================================
const incomeTotals = computed(() => {
  const totals = {};
  transactionStore.transactions
    .filter(
      (t) =>
        new Date(t.date).getFullYear() === props.year &&
        new Date(t.date).getMonth() + 1 === props.month &&
        t.transaction_type === "income",
    )
    .forEach(
      (t) =>
        (totals[t.category] = (totals[t.category] || 0) + Math.abs(t.amount)),
    );
  return Object.keys(totals)
    .map((key) => ({
      key,
      label: CATEGORY_LABEL[key] || key,
      amount: totals[key],
    }))
    .sort((a, b) => b.amount - a.amount);
});
const totalIncome = computed(() =>
  incomeTotals.value.reduce((sum, i) => sum + i.amount, 0),
);
const incomeSeries = computed(() => incomeTotals.value.map((c) => c.amount));

const incomeOptions = computed(() => ({
  labels: incomeTotals.value.map((c) => c.label),
  chart: {
    type: "donut",
    fontFamily: "inherit",
    animations: { dynamicAnimation: { speed: 400 } },
  },
  colors: ["#3182f6", "#20c997", "#51cf66", "#339af0", "#8ce99a"],
  plotOptions: {
    pie: {
      donut: {
        size: "70%",
        labels: {
          show: true,
          name: { show: false },
          value: {
            show: true,
            fontSize: "12px",
            fontWeight: "bold",
            formatter: () => "총 수입",
          },
          total: {
            showAlways: true,
            show: true,
            label: "총 수입",
            color: "#3182f6",
            formatter: () => "수입",
          },
        },
      },
    },
  },
  dataLabels: { enabled: false }, // 🚀 글씨 생략
  legend: { show: false }, // 🚀 범례 생략
  stroke: { width: 1, colors: ["#fff"] },
  tooltip: { y: { formatter: (val) => val.toLocaleString() + "원" } },
}));

const aiIncomeSummaryText = computed(() => {
  if (totalIncome.value === 0)
    return "수입 0원... 숨만 쉬어도 돈이 나갑니다 💦";
  const top = incomeTotals.value[0];
  return `${top.label} 덕분에 숨통이 트이네요! 나이스 💰`;
});

// ==========================================
// 🥊 수입 vs 지출 대결 (Vs Chart)
// ==========================================
const vsSeries = computed(() => [
  {
    name: "금액",
    data: [totalIncome.value, totalExpense.value],
  },
]);

const vsOptions = computed(() => ({
  chart: { type: "bar", fontFamily: "inherit", toolbar: { show: false } },
  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 6,
      barHeight: "50%",
      distributed: true,
    },
  },
  colors: ["#3182f6", "#ff6b6b"], // 수입 파랑, 지출 빨강
  dataLabels: {
    enabled: true,
    textAnchor: "start",
    style: { colors: ["#fff"], fontSize: "11px" },
    formatter: (val) => val.toLocaleString() + "원",
    offsetX: 10,
  },
  xaxis: {
    categories: ["수입", "지출"],
    labels: { show: false },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: { labels: { style: { fontWeight: "bold", fontSize: "12px" } } },
  grid: { show: false },
  legend: { show: false },
  tooltip: { y: { formatter: (val) => val.toLocaleString() + "원" } },
}));
</script>

<style scoped>
.min-h-0 {
  min-height: 0;
}
.bg-gradient-ai {
  background: linear-gradient(135deg, #3182f6 0%, #845ef7 100%);
}
/* 텍스트가 넘치면 말줄임표(...) 처리 */
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
