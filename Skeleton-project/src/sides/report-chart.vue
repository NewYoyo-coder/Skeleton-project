<template>
  <div class="chart-container p-3">
    <div class="d-flex gap-2 justify-content-center mb-4">
      <button
        v-for="p in [1, 3, 6]"
        :key="p"
        class="period-chip btn rounded-pill px-4 py-1 fw-bold"
        :class="period === p ? 'active shadow-sm' : 'inactive'"
        @click="period = p"
      >
        {{ p }}개월
      </button>
    </div>

    <div
      class="ai-summary p-4 mb-4 rounded-4 position-relative overflow-hidden shadow-sm"
    >
      <div
        class="position-absolute top-0 start-0 w-100 h-100 bg-gradient-ai opacity-10"
      ></div>
      <div class="d-flex align-items-center gap-2 mb-2 position-relative z-1">
        <i class="bi bi-robot fs-5 text-primary"></i>
        <span class="fw-bold text-primary" style="font-size: 13px"
          >AI 지출 분석</span
        >
      </div>
      <h6
        class="m-0 fw-bold lh-base position-relative z-1 text-dark"
        style="word-break: keep-all"
      >
        {{ aiSummaryText }}
      </h6>
    </div>

    <div
      class="chart-wrapper bg-white rounded-4 p-3 shadow-sm"
      style="min-height: 300px"
    >
      <h6 class="fw-bold mb-3 text-center">지출 카테고리 비중</h6>
      <div v-if="totalExpense > 0">
        <apexchart
          type="donut"
          height="300"
          :options="chartOptions"
          :series="chartSeries"
        />
      </div>
      <div v-else class="text-center text-muted py-5 mt-4">
        해당 기간에 지출 내역이 없습니다! 🎉
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useTransactionStore } from '@/stores/transaction';
import { CATEGORY_LABEL } from '@/constants/categories.js';

const transactionStore = useTransactionStore();
const period = ref(1); // 1, 3, 6개월

// 선택된 기간만큼의 데이터 필터링
const filteredData = computed(() => {
  const now = new Date();
  const past = new Date(
    now.getFullYear(),
    now.getMonth() - period.value + 1,
    1,
  ); // 지정한 개월 수 전의 1일

  return transactionStore.transactions.filter((t) => {
    const d = new Date(t.date);
    return d >= past && d <= now && t.transaction_type === 'expense'; // '지출'만 차트로 분석
  });
});

// 카테고리별 합산
const categoryTotals = computed(() => {
  const totals = {};
  filteredData.value.forEach((t) => {
    totals[t.category] = (totals[t.category] || 0) + Math.abs(t.amount);
  });

  // 큰 금액 순으로 정렬된 배열 생성
  return Object.keys(totals)
    .map((key) => ({
      key,
      label: CATEGORY_LABEL[key] || key,
      amount: totals[key],
    }))
    .sort((a, b) => b.amount - a.amount);
});

const totalExpense = computed(() =>
  categoryTotals.value.reduce((sum, item) => sum + item.amount, 0),
);

// ApexCharts 옵션 바인딩
const chartSeries = computed(() => categoryTotals.value.map((c) => c.amount));
const chartOptions = computed(() => ({
  labels: categoryTotals.value.map((c) => c.label),
  chart: { type: 'donut', fontFamily: 'inherit' },
  colors: ['#3182f6', '#56b6f7', '#ff6b6b', '#fcc419', '#20c997', '#845ef7'], // 좃깐지 색상 조합
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        labels: {
          show: true,
          total: {
            showAlways: true,
            show: true,
            label: '총 지출',
            fontSize: '14px',
            formatter: (w) =>
              `${w.globals.seriesTotals.reduce((a, b) => a + b, 0).toLocaleString()}원`,
          },
        },
      },
    },
  },
  dataLabels: { enabled: false }, // 차트 위에 글씨 뜨는거 끄기 (지저분함)
  legend: { position: 'bottom' },
  stroke: { width: 0 },
}));

// 🤖 AI 1줄 요약 로직 생성기
const aiSummaryText = computed(() => {
  if (totalExpense.value === 0)
    return '지출 0원! 무지출 챌린지 대성공인가요? 갓벽합니다 💸';

  const top = categoryTotals.value[0];
  const percent = ((top.amount / totalExpense.value) * 100).toFixed(1);
  const catKey = top.key;

  // 카테고리별 뼈 때리는 멘트 매핑
  const jokes = {
    food: `엥겔지수 폭발! 식비로만 전체 지출의 ${percent}%를 태웠습니다. 맛있는 거 많이 드셨네요 🍔`,
    cafe: `혈중 카페인 농도 MAX... 커피값으로 ${percent}%가 날아갔어요. 카페인 줄이셔야 할 듯 ☕`,
    shopping: `지름신 강림! 택배 뜯는 재미에 ${percent}%를 바치셨군요. 다음 달 카드값 조심하세요 🎁`,
    transportation: `길바닥에 돈 뿌리기 장인! 교통비 비중이 ${percent}%나 됩니다. 🚕`,
    housing: `숨만 쉬어도 나가는 주거비... 뼈 아픈 고정 지출이 ${percent}%를 차지했어요 🏠`,
    taxes: `성실한 납세자 등장! 세금으로 뭉칫돈(${percent}%)이 나갔습니다. 국세청이 좋아합니다 💸`,
    insurance: `미래를 위한 투자지만 꽤 큽니다. 보험료 비중이 ${percent}%를 차지했네요 🏥`,
    etc: `기타 지출이 1위(${percent}%)? 어딘가 은밀한 곳에 돈을 쓰고 계신 건 아니겠죠? 👀`,
  };

  return (
    jokes[catKey] ||
    `이번 기간은 ${top.label} 지출이 ${percent}%로 압도적 1위네요!`
  );
});
</script>

<style scoped>
.period-chip {
  font-size: 13px;
  background-color: #f1f3f5;
  color: #adb5bd;
  border: 1px solid transparent;
  transition: all 0.2s;
}
.period-chip.active {
  background-color: #fff;
  color: #3182f6;
  border-color: #3182f6;
}
.bg-gradient-ai {
  background: linear-gradient(135deg, #3182f6 0%, #845ef7 100%);
}
.ai-summary {
  background-color: #f8f9fc;
  border: 1px solid #e2e8f0;
}
</style>
