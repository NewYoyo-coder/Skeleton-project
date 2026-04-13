<template>
  <div class="w-100 mt-2 bg-white shadow-sm d-flex flex-column rounded-4">
    <header class="p-2 bg-transparent sticky-top z-2 rounded-4">
      <!-- <div class="d-flex justify-content-between align-items-center">
        거래 내역 요약
      </div> -->
    </header>

    <!-- <div class="t-wrapper" style="width: 300px; height: 60px">
      <button class="t-btn t-single t-push active">단일 버튼 테스트</button>
    </div> -->

    <div class="px-2 mb-2 text-center">
      <div class="t-wrapper w-100" style="height: 40px; --t-width: 50%">
        <div
          class="t-active-bg"
          :style="{
            transform: `translateX(${sortBy === 'date' ? '0' : '100'}%)`,
          }"
        ></div>

        <button
          class="t-btn t-push"
          :class="{ active: sortBy === 'date' }"
          @click="sortBy = 'date'"
        >
          최근순
        </button>

        <button
          class="t-btn t-push"
          :class="{ active: sortBy === 'amount' }"
          @click="sortBy = 'amount'"
        >
          큰 금액순
        </button>
      </div>
    </div>

    <main class="px-2">
      <div v-if="displayedItems && displayedItems.length > 0">
        <TransitionGroup name="flip-list" tag="div" class="main-list-container">
          <template v-for="(item, index) in displayedItems" :key="item.id">
            <div
              v-if="item.isDivider"
              class="d-flex align-items-center my-2 w-50 px-1"
            >
              <span class="fw-bold text-dark me-2" style="font-size: 14px">{{
                item.label
              }}</span>
              <div class="flex-grow-1 border-bottom opacity-10"></div>
            </div>

            <div v-else-if="item.isMessage" class="px-1 mb-3">
              <p
                class="text-secondary m-0"
                style="font-size: 12px; letter-spacing: -0.5px"
              >
                {{ item.text }}
              </p>
            </div>

            <div
              v-else
              :data-index="index"
              class="hover-card p-1 mb-2 rounded-4 border-0 shadow-sm bg-white d-flex align-items-center justify-content-between"
              @click="
                router.push({
                  path: '/transactionHistory',
                  query: { from: item.date, to: item.date },
                })
              "
            >
              <div class="d-flex align-items-center gap-2 overflow-hidden">
                <div
                  v-if="item.date"
                  class="text-center border-end pe-2 text-secondary"
                  style="min-width: 45px"
                >
                  <div style="font-size: 10px">{{ getDayName(item.date) }}</div>
                  <div class="fw-bold text-dark fs-5">
                    {{ item.date.split("-")[2] }}
                  </div>
                </div>

                <div class="overflow-hidden">
                  <span
                    class="badge rounded-pill"
                    :class="
                      item.transaction_type === 'income'
                        ? 'text-bg-primary'
                        : 'text-bg-danger'
                    "
                    style="font-size: 12px; padding: 4px 10px"
                  >
                    {{ item.category }}
                  </span>
                </div>
              </div>

              <div class="text-end m-2">
                <div
                  class="fw-bold fs-5"
                  :class="
                    item.transaction_type === 'income'
                      ? 'text-primary'
                      : 'text-danger'
                  "
                >
                  {{ item.transaction_type === "income" ? "+" : "-"
                  }}{{ item.amount.toLocaleString() }}
                  <small style="font-size: 0.7em">원</small>
                </div>
              </div>
            </div>
          </template>
        </TransitionGroup>

        <div v-if="filteredData.length > 5" class="mt-3 mb-2 text-center">
          <p class="mt-1 mb-1 text-muted opacity-50" style="font-size: 11px">
            간단하게 {{ transactionCount }}건의 내역만 요약해 드렸어요
          </p>
          <router-link
            :to="{ path: '/transactionHistory', query: dateRangeQuery }"
            class="btn btn-link text-decoration-none d-inline-flex align-items-center gap-2 py-2 px-4 rounded-pill transition-all"
            style="
              background: rgba(0, 0, 0, 0.03);
              color: #666;
              font-size: 12px;
              font-weight: 800;
            "
          >
            <span>{{ dateStore.selectedMonth }}월 내역 보러가기 →</span>
          </router-link>
        </div>

        <div
          v-else-if="transactionCount > 0"
          class="text-center py-4 text-muted small opacity-50"
        >
          이번 달 기록은 이게 전부에요!
        </div>
      </div>

      <div v-else class="text-center mt-5 py-5 opacity-50">
        <div class="display-1 mb-3">🧾</div>
        <p class="fw-bold">기록이 하나도 없네요</p>
        <small>수입이나 지출을 추가해보세요</small>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useDateStore } from "@/stores/select-date";
import { useTransactionStore } from "@/stores/transaction";
import { useRoute, useRouter } from "vue-router"; // 추가
import { PAYMENT_LABEL } from "@/constants/payment";

const router = useRouter(); // 💡 추가
const route = useRoute(); // 💡 추가

const dateStore = useDateStore();
const transactionStore = useTransactionStore();
const selectedItem = ref(null);
// 💡 sortBy 정의 수정
const sortBy = ref(route.query.sortBy || "date");

// 💡 sortBy 감시 추가
watch(sortBy, (newVal) => {
  router.replace({ query: { ...route.query, sortBy: newVal } });
});

// ------------------------------

// 요일 계산 헬퍼
const getDayName = (dateString) => {
  if (!dateString) return ""; // 방어 코드 추가
  const date = new Date(dateString);
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  return days[date.getDay()];
};

// 정렬 변경 (상단 스크롤 이동은 유지)
const setSort = (type) => {
  sortBy.value = type;
  // window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 필터링된 데이터 (Pinia 연동)
const filteredData = computed(() => {
  const allTransactions = transactionStore.transactions;

  return sortBy.value === "date"
    ? [...allTransactions].sort((a, b) => new Date(b.date) - new Date(a.date))
    : [...allTransactions].sort(
        (a, b) => Math.abs(b.amount) - Math.abs(a.amount),
      ); // 절대값 기준 내림차순 정렬
});
// 메인에 보여줄 5개만 추출
const displayedItems = computed(() => {
  const all = [...transactionStore.transactions];
  if (all.length === 0) return [];

  const selYear = dateStore.selectedYear;
  const selMonth = dateStore.selectedMonth;
  const result = [];
  let count = 0;

  let currY = selYear;
  let currM = selMonth;
  let attempts = 0;

  // 1. 최근순 정렬 로직 (날짜 역순)
  if (sortBy.value === "date") {
    const sortedAll = [...all].sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );

    while (count < 7 && attempts < 12) {
      const monthData = sortedAll.filter((t) => {
        const d = new Date(t.date);
        return d.getFullYear() === currY && d.getMonth() + 1 === currM;
      });

      if (monthData.length > 0) {
        result.push({
          id: `div-${currY}-${currM}`,
          isDivider: true,
          label: `${currM}월`,
        });

        if (attempts === 0 && monthData.length < 5) {
          result.push({
            id: "msg-only",
            isMessage: true,
            text: "이번 달은 이게 전부에요!",
          });
        }

        for (const item of monthData) {
          // ✅ 이번 달은 7개, 과거 달 보충은 총합 5개까지
          if (attempts === 0) {
            if (count >= 7) break;
          } else {
            if (count >= 5) break;
          }

          result.push(item);
          count++;
        }
      }
      // 💡 이번 달에서 5개 이상 채웠다면 굳이 과거 달로 안 넘어감
      if (count >= 5) break;

      currM--;
      if (currM === 0) {
        currM = 12;
        currY--;
      }
      attempts++;
    }
  }

  // 2. 큰 금액순 정렬 로직 (절대값 역순)
  else {
    while (count < 7 && attempts < 12) {
      const monthData = all
        .filter((t) => {
          const d = new Date(t.date);
          return d.getFullYear() === currY && d.getMonth() + 1 === currM;
        })
        .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));

      if (monthData.length > 0) {
        result.push({
          id: `div-amt-${currY}-${currM}`,
          isDivider: true,
          label: `${currM}월의 큰 금액`,
        });

        for (const item of monthData) {
          // ✅ 여기도 최근순과 동일하게 '이번 달 7개' 로직 적용
          if (attempts === 0) {
            if (count >= 7) break;
          } else {
            if (count >= 5) break;
          }

          result.push(item);
          count++;
        }
      }
      if (count >= 5) break;

      currM--;
      if (currM === 0) {
        currM = 12;
        currY--;
      }
      attempts++;
    }
  }

  return result;
});

// 해당 월의 시작일과 마지막 일을 계산하는 computed
const dateRangeQuery = computed(() => {
  const year = dateStore.selectedYear;
  const month = dateStore.selectedMonth;

  // 시작일: YYYY-MM-01
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;

  // 종료일: 다음달의 0번째 날은 이번달의 마지막 날입니다.
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  return {
    from: startDate,
    to: endDate,
  };
});

// 실제 렌더링된 거래 내역(아이템)의 개수만 체크
const transactionCount = computed(() => {
  return displayedItems.value.filter(
    (item) => !item.isDivider && !item.isMessage,
  ).length;
});

// --- 촤라락 애니메이션 훅 복구 ---
const beforeEnter = (el) => {
  el.style.opacity = 0;
  el.style.transform = "translateY(30px) scale(0.9)";
};

const enter = (el, done) => {
  const index = el.dataset.index % 10; // 무한스크롤 제거했으니 10 고정
  setTimeout(() => {
    el.style.transition = "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    el.style.opacity = 1;
    el.style.transform = "translateY(0) scale(1)";
    done();
  }, index * 60); // 60ms 간격으로 하나씩 팝업
};
// ------------------------------

onMounted(async () => {
  // 💡 추가: 주소창에 날짜 있으면 스토어 동기화 (새로고침 대응)
  const query = route.query;
  if (query.year && query.month) {
    dateStore.setDate(Number(query.year), Number(query.month));
  }
  await transactionStore.fetchTransactions();
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700;800&display=swap");

/* ---------------------------------------------------
   아래 항목들은 부트스트랩으로 대체 불가한 커스텀 UI 입니다.
   절대 지우지 마세요! (레이아웃 깨짐 방지)
--------------------------------------------------- */

/* 2. 카드 터치 리플 (간지용) */
.hover-card {
  position: relative;
  overflow: hidden;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.03) !important;
  /* transition에 transform과 background를 모두 포함 */
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-card:active {
  background-color: #f8f9fa !important;
  transform: scale(0.97) translateY(2px);
}
@keyframes ripple {
  to {
    scale: 4;
    opacity: 0;
  }
}

/* 4. Vue 트랜지션 로직 */
.main-list-container {
  position: relative; /* 자식인 absolute 카드들의 기준점 */
  width: 100%;
}
.flip-list-leave-active {
  position: absolute; /* 핵심: 나가는 놈이 자리를 비켜줘야 꿀렁이지 않음 */
  width: 100%; /* 폭 고정 */
  z-index: 0;
  opacity: 0;
}
.flip-list-move {
  z-index: 1;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.flip-list-enter-active {
  transition: all 0.3s ease-out;
}
.flip-list-enter-from {
  opacity: 0;
  transform: translateY(10px); /* 살짝만 올라오게 */
}

/* 폰트 및 기본 웨이트 설정 */
.custom-font {
  font-family:
    "Pretendard",
    -apple-system,
    sans-serif;
  color: #191f28;
  letter-spacing: -0.02em;
}

/* 600px 이상에서 플로팅 버튼 위치 미세조정 */
@media (max-width: 650px) {
  .floating-btn {
    left: auto !important;
    right: 20px !important;
    transform: none !important;
  }
}
</style>
