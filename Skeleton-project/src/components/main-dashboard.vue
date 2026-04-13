<template>
  <div
    class="position-relative bg-light custom-font overflow-hidden"
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
          ? "이전 달로"
          : dragOffset < -50
            ? isFutureMonth
              ? "아직 없네요"
              : "다음 달로"
            : ""
      }}
    </div>

    <div class="dashboard-wrapper pt-2 pb-2">
      <div class="mx-auto px-3" style="max-width: 600px; width: 100%">
        <div class="row gx-2 mb-2">
          <div class="col-7">
            <div class="card border-0 shadow-sm rounded-4 h-100">
              <div
                class="card-body py-3 px-4 d-flex flex-column justify-content-center rounded-4"
              >
                <div
                  class="text-dark fw-bold mb-1"
                  style="font-size: 0.85rem; opacity: 0.8"
                >
                  순수익
                </div>
                <h2
                  class="fw-bold mb-0 text-nowrap"
                  :class="netIncome >= 0 ? 'text-primary' : 'text-danger'"
                  style="font-size: 1.5rem"
                >
                  {{ netIncome > 0 ? "+" : "" }}{{ formatNumber(netIncome) }}
                  <span style="font-size: 1rem">원</span>
                </h2>
              </div>
            </div>
          </div>

          <div class="col-5 d-flex flex-column gap-2">
            <div class="card border-0 shadow-sm rounded-4 flex-grow-1">
              <div
                class="card-body py-2 px-3 d-flex flex-column justify-content-center rounded-4"
              >
                <div class="text-primary fw-bold" style="font-size: 0.75rem">
                  총 수입
                </div>
                <div class="text-primary fw-bold" style="font-size: 0.95rem">
                  +{{ formatNumber(totalIncome) }}
                </div>
              </div>
            </div>

            <div class="card border-0 shadow-sm rounded-4 flex-grow-1">
              <div
                class="card-body py-2 px-3 d-flex flex-column justify-content-center rounded-4"
              >
                <div class="text-danger fw-bold" style="font-size: 0.75rem">
                  총 지출
                </div>
                <div class="text-danger fw-bold" style="font-size: 0.95rem">
                  -{{ formatNumber(totalExpense) }}
                </div>
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
import { ref, computed, watch, onMounted } from "vue";
import axios from "axios";
import { useDateStore } from "@/stores/select-date.js";
import { useTransactionStore } from "@/stores/transaction"; // 💡 에러 방지: 누락된 store 임포트 추가
import recentTransaction from "./main-recentTransaction.vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/stores/userStore.js"; // 💡 누락된 임포트
const userStore = useUserStore(); // 💡 정의 추가

const dateStore = useDateStore();
const transactionStore = useTransactionStore(); // 💡 추가
const router = useRouter();
const route = useRoute();
const transactions = ref([]);

// --------------------------------------------------------
// 🛡️ 1. 유효성 검사 헬퍼 함수 (호이스팅 에러 방지를 위해 최상단 배치)
// --------------------------------------------------------
const isValidYear = (y) => {
  const year = Number(y);
  return !isNaN(year) && year >= 1900 && year <= 2100;
};

const isValidMonth = (m) => {
  const month = Number(m);
  return !isNaN(month) && month >= 1 && month <= 12;
};

// 💡 sortBy 쓰레기값 방어용 화이트리스트
const allowedSortKeys = ["date", "amount"];

// --------------------------------------------------------
// 🛡️ 2. 통합 방어 및 정화 함수 (년, 월, 정렬 한방에 처리)
// --------------------------------------------------------
const validateAndFixQuery = () => {
  const { year, month, sortBy, theme } = route.query; // 👈 theme을 명시적으로 가져와야 함  const today = new Date();
  const today = new Date();

  let fixedYear = Number(year);
  let fixedMonth = Number(month);
  let fixedTheme = theme; // 이제 theme이 정의되어 있어서 에러 안 남
  let fixedSortBy = sortBy;
  let isDirty = false; // URL이 오염되었는지 체크

  // ① 년도 방어
  if (!year || !isValidYear(year)) {
    fixedYear = today.getFullYear();
    isDirty = true;
  }
  // ② 월 방어
  if (!month || !isValidMonth(month)) {
    fixedMonth = today.getMonth() + 1;
    isDirty = true;
  }
  // ③ 정렬 파라미터 방어 (amount33332323 같은 값 컷!)
  if (sortBy !== undefined && !allowedSortKeys.includes(sortBy)) {
    fixedSortBy = "date";
    isDirty = true;
  }

  // 🛡️ 테마 화이트리스트 검사
  if (theme && ["light", "dark"].includes(theme)) {
    // 1. URL에 유효한 테마가 있으면 그걸로 스토어 업데이트
    userStore.setTheme(theme);
  } else if (theme) {
    // 2. URL에 이상한 값이 있으면(darkkkk) 로컬 값으로 정화
    fixedTheme = userStore.theme;
    isDirty = true;
  } else {
    // 3. URL에 테마가 아예 없으면 로컬 값을 URL에 붙여줄지 말지 결정 (취향차이)
    // 붙여주고 싶다면 아래 주석 해제
    // fixedTheme = userStore.theme;
    // isDirty = true;
  }
  // 스토어 업데이트 (이미 있다면)
  if (fixedTheme) userStore.setTheme(fixedTheme);

  // 안전한 값으로 스토어 업데이트
  dateStore.setDate(fixedYear, fixedMonth);

  // URL이 더럽다면 깨끗한 상태로 조용히 덮어씌움 (새로고침 없이)
  if (isDirty) {
    const newQuery = { ...route.query, year: fixedYear, month: fixedMonth };
    if (sortBy !== undefined) newQuery.sortBy = fixedSortBy;

    router.replace({ query: newQuery });
  }
};

// --------------------------------------------------------
// 🔄 3. 데이터 패칭 로직
// --------------------------------------------------------
const fetchTransactions = async () => {
  try {
    const res = await fetch(
      window.location.hostname === "localhost"
        ? "http://localhost:3000/transactions"
        : "/transaction_db.json",
    );

    const data = await res.json(); // 1. 필수: json 변환
    const allData = data.transactions || data; // 2. 필수: 배포/로컬 분기 대응

    // 3. 수정 포인트: response.data 대신 allData 사용
    transactions.value = allData.filter((tx) => {
      const txDate = new Date(tx.date);
      return (
        txDate.getFullYear() === dateStore.selectedYear &&
        txDate.getMonth() + 1 === dateStore.selectedMonth
      );
    });
  } catch (error) {
    console.error("데이터 통신 에러:", error);
  }
};

// --------------------------------------------------------
// 🚀 4. 라이프사이클 및 감시자 (Watchers)
// --------------------------------------------------------
onMounted(async () => {
  validateAndFixQuery(); // 진입하자마자 URL 검사 및 정화
  fetchTransactions(); // 해당 월 데이터 패칭
  await transactionStore.fetchTransactions(); // 전체 데이터 패칭
});

// ① 스와이프 등으로 스토어 날짜가 바뀌면 -> URL 업데이트 & 데이터 재호출
watch(
  [() => dateStore.selectedYear, () => dateStore.selectedMonth],
  ([newYear, newMonth]) => {
    router.replace({
      query: { ...route.query, year: newYear, month: newMonth },
    });
    fetchTransactions();
  },
);

// ② 유저가 주소창에서 엔터를 치거나 뒤로가기를 눌렀을 때 -> 방어막 작동
watch(
  () => route.query,
  (newQuery, oldQuery) => {
    // 단순히 내부 로직으로 바뀐 게 아니라, 진짜 파라미터가 변했을 때만 검사
    if (
      newQuery.year !== oldQuery?.year ||
      newQuery.month !== oldQuery?.month ||
      newQuery.sortBy !== oldQuery?.sortBy
    ) {
      validateAndFixQuery();
    }
  },
  { deep: true },
);

// --------------------------------------------------------
// 📊 5. 금액 계산 (Computed)
// --------------------------------------------------------
const totalIncome = computed(() => {
  return transactions.value
    .filter((t) => t.transaction_type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
});

const totalExpense = computed(() => {
  return transactions.value
    .filter((t) => t.transaction_type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
});

const netIncome = computed(() => totalIncome.value - totalExpense.value);

const formatNumber = (num) => {
  return num.toLocaleString("ko-KR");
};

// --------------------------------------------------------
// 👆 6. 드래그/스와이프 로직
// --------------------------------------------------------
const startX = ref(0);
const dragOffset = ref(0);
const isDragging = ref(false);

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
  if (e.target.closest(".modal")) return;
  isDragging.value = true;
  startX.value = e.pageX;
};

const startTouch = (e) => {
  if (e.target.closest(".modal")) return;
  startX.value = e.touches[0].pageX;
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
    if (!isFutureMonth.value) changeMonth(1);
  }
  isDragging.value = false;
  dragOffset.value = 0;
};

const onTouch = (e) => {
  dragOffset.value = e.touches[0].pageX - startX.value;
};

const endTouch = () => {
  if (dragOffset.value > 70) {
    changeMonth(-1);
  } else if (dragOffset.value < -70) {
    if (!isFutureMonth.value) changeMonth(1);
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

  // 스토어 날짜만 바꾸면 위의 watch가 알아서 URL 바꾸고 데이터 다시 불러옴 (개꿀)
  dateStore.setDate(year, month);
};
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
