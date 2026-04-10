<template>
  <div class="mx-auto bg-white min-vh-100 shadow-sm d-flex flex-column mt-2">
    <header class="p-4 bg-white sticky-top z-3">
      <div class="d-flex justify-content-between align-items-center">
        <h5 class="fw-bold mb-0">최근 거래 내역</h5>
      </div>
    </header>

    <!-- <div class="t-wrapper" style="width: 300px; height: 60px">
      <button class="t-btn t-single t-push active">단일 버튼 테스트</button>
    </div> -->

    <div class="px-4 mb-1 text-center">
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
          금액순
        </button>
      </div>
    </div>

    <main class="px-3 py-4 flex-grow-1">
      <div v-if="displayedItems && displayedItems.length > 0">
        <TransitionGroup name="flip-list" tag="div" class="main-list-container">
          <div
            v-for="(item, index) in displayedItems"
            :key="item.id"
            :data-index="index"
            class="hover-card p-3 mb-2 rounded-4 border-0 shadow-sm bg-white d-flex align-items-center justify-content-between"
          >
            <div class="d-flex align-items-center gap-3 overflow-hidden">
              <div
                class="text-center border-end pe-3 text-secondary"
                style="min-width: 45px"
              >
                <div style="font-size: 10px; text-transform: uppercase">
                  {{ getDayName(item.date) }}
                </div>
                <div class="fw-bold text-dark fs-5 line-height-1">
                  {{ item.date.split('-')[2] }}
                </div>
              </div>

              <div class="overflow-hidden">
                <div class="d-flex align-items-center gap-2 mb-1">
                  <span
                    class="badge rounded-pill"
                    :class="
                      item.transaction_type === 'income'
                        ? 'text-bg-primary'
                        : 'text-bg-danger'
                    "
                    style="font-size: 13px; font-weight: 500; padding: 5px 10px"
                  >
                    {{ item.category }}
                  </span>
                  <span class="text-muted" style="font-size: 11px">
                    {{
                      PAYMENT_LABEL[item.payment_method] || item.payment_method
                    }}
                  </span>
                </div>

                <div
                  class="fw-bold text-dark text-truncate fs-6"
                  style="letter-spacing: -0.5px"
                >
                  {{ item.shop_name }}
                  <span
                    v-if="item.item_name"
                    class="fw-normal text-secondary opacity-75"
                    style="font-size: 13px"
                  >
                    · {{ item.item_name }}
                  </span>
                </div>
              </div>
            </div>

            <div class="text-end ms-2">
              <div
                class="fw-bold fs-5"
                :class="
                  item.transaction_type === 'income'
                    ? 'text-primary'
                    : 'text-danger'
                "
              >
                {{ item.transaction_type === 'income' ? '+' : '-'
                }}{{ item.amount.toLocaleString() }}
                <small style="font-size: 0.7em">원</small>
              </div>
              <div
                v-if="item.memo"
                class="text-muted text-truncate italic small"
                style="max-width: 100px"
              >
                {{ item.memo }}
              </div>
            </div>
          </div>
        </TransitionGroup>

        <div
          v-if="filteredData.length > 5"
          class="text-center py-3 text-muted small"
        >
          최근 5건의 내역만 표시됩니다
        </div>
      </div>

      <div v-else class="text-center mt-5 py-5 opacity-50">
        <div class="display-1 mb-3">🧾</div>
        <p class="fw-bold">이달의 내역이 비어있어요</p>
        <small class="text-muted">새로운 결제 내역을 추가해보세요</small>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useDateStore } from '@/stores/select-date';
import { useTransactionStore } from '@/stores/transaction';
import { useRouter } from 'vue-router'; // 추가
import { PAYMENT_LABEL } from '@/constants/payment';
const router = useRouter();

const dateStore = useDateStore();
const transactionStore = useTransactionStore();
const selectedItem = ref(null);
const sortBy = ref('date');

// ------------------------------

// 요일 계산 헬퍼
const getDayName = (dateString) => {
  const date = new Date(dateString);
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
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

  return sortBy.value === 'date'
    ? [...allTransactions].sort((a, b) => new Date(b.date) - new Date(a.date))
    : [...allTransactions].sort(
        (a, b) => Math.abs(b.amount) - Math.abs(a.amount),
      ); // 절대값 기준 내림차순 정렬
});
// 메인에 보여줄 5개만 추출
const displayedItems = computed(() => filteredData.value.slice(0, 5));

// --- 촤라락 애니메이션 훅 복구 ---
const beforeEnter = (el) => {
  el.style.opacity = 0;
  el.style.transform = 'translateY(30px) scale(0.9)';
};

const enter = (el, done) => {
  const index = el.dataset.index % 10; // 무한스크롤 제거했으니 10 고정
  setTimeout(() => {
    el.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    el.style.opacity = 1;
    el.style.transform = 'translateY(0) scale(1)';
    done();
  }, index * 60); // 60ms 간격으로 하나씩 팝업
};
// ------------------------------

onMounted(async () => {
  // 서버 부하 알빠임? 무조건 안전하게 불러와서 새로고침 ㄱㄱ
  await transactionStore.fetchTransactions();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700;800&display=swap');

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
    'Pretendard',
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
