<template>
  <div
    class="mx-auto bg-white min-vh-100 shadow-sm d-flex flex-column"
    style="max-width: 600px"
  >
    <header class="p-4 border-bottom bg-white sticky-top z-3">
      <div class="d-flex justify-content-between align-items-center">
        <h5 class="fw-bold mb-0">최근 거래</h5>
        <span class="text-muted small">
          {{ dateStore.selectedYear }}년 {{ dateStore.selectedMonth }}월
        </span>
      </div>
    </header>

    <div class="px-4 py-3 bg-white border-bottom">
      <div
        class="tab-wrapper p-1 bg-light rounded-3 d-flex"
        style="height: 44px"
      >
        <button
          @click="setSort('date')"
          class="flex-grow-1 border-0 rounded-2 small fw-bold transition-all d-flex align-items-center justify-content-center"
          :class="
            sortBy === 'date'
              ? 'bg-white shadow-sm text-primary'
              : 'bg-transparent text-secondary'
          "
        >
          최근순
        </button>
        <button
          @click="setSort('amount')"
          class="flex-grow-1 border-0 rounded-2 small fw-bold transition-all d-flex align-items-center justify-content-center"
          :class="
            sortBy === 'amount'
              ? 'bg-white shadow-sm text-primary'
              : 'bg-transparent text-secondary'
          "
        >
          금액순
        </button>
      </div>
    </div>

    <main class="px-3 py-4 flex-grow-1">
      <div v-if="displayedItems && displayedItems.length > 0">
        <TransitionGroup
          name="flip-list"
          tag="div"
          @before-enter="beforeEnter"
          @enter="enter"
        >
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
                    {{ item.category_id }}
                  </span>
                  <span class="text-muted" style="font-size: 11px">
                    {{ item.payment_method }}
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
          v-if="filteredData.length > 10"
          class="text-center py-3 text-muted small"
        >
          최근 10건의 내역만 표시됩니다.
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
  const filtered = transactionStore.transactions.filter((item) => {
    if (!item.date) return false;
    const [y, m] = item.date.split('-').map(Number);
    return y === dateStore.selectedYear && m === dateStore.selectedMonth;
  });

  return sortBy.value === 'date'
    ? [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date))
    : [...filtered].sort((a, b) => b.amount - a.amount);
});

// 메인에 보여줄 10개만 추출
const displayedItems = computed(() => filteredData.value.slice(0, 10));

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
  // 이미 StartView에서 가져왔다면 다시 호출 안 함 (캐싱 효과)
  if (transactionStore.transactions.length === 0) {
    await transactionStore.fetchTransactions();
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700;800&display=swap');

/* ---------------------------------------------------
   아래 항목들은 부트스트랩으로 대체 불가한 커스텀 UI 입니다.
   절대 지우지 마세요! (레이아웃 깨짐 방지)
--------------------------------------------------- */

/* 1. 슬라이딩 탭 (Toss 스타일) */
.tab-wrapper {
  position: relative;
  display: flex;
  background: #f2f4f6;
  border-radius: 12px;
  padding: 2px;
}
.active-bg {
  position: absolute;
  width: calc(50% - 2px);
  height: calc(100% - 4px);
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.tab-wrapper button {
  line-height: 1; /* 텍스트 찐빠 방지 핵심 */
  flex: 1;
  z-index: 1;
  border: none;
  background: none;
  padding: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #6b7684;
  cursor: pointer;
  transition: color 0.3s ease;
}
.tab-wrapper button.on {
  color: #3182f6;
}

/* 2. 카드 터치 리플 (간지용) */
.hover-card {
  position: relative;
  overflow: hidden;
  transition:
    background 0.2s ease,
    transform 0.1s ease;
}
.hover-card:active {
  background: #f2f4f6 !important;
  transform: scale(0.98);
}
.hover-card:active::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background: rgba(49, 130, 246, 0.1);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  animation: ripple 0.4s ease-out;
}
@keyframes ripple {
  to {
    scale: 4;
    opacity: 0;
  }
}

/* 4. Vue 트랜지션 로직 */
.flip-list-move {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-left-enter-active,
.slide-right-enter-active {
  transition: all 0.4s cubic-bezier(0.5, 0, 0.5, 1.5);
}
.slide-left-enter-from {
  transform: translateY(20px) rotateX(-90deg);
  opacity: 0;
}
.slide-right-enter-from {
  transform: translateY(-20px) rotateX(90deg);
  opacity: 0;
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

.line-height-1 {
  line-height: 1;
}

/* 호버/액티브 시 카드 반응 강화 */
.hover-card {
  border: 1px solid rgba(0, 0, 0, 0.03) !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-card:active {
  transform: scale(0.97) translateY(2px);
  background-color: #f8f9fa !important;
}

/* 600px 이상에서 플로팅 버튼 위치 미세조정 */
@media (max-width: 650px) {
  .floating-btn {
    left: auto !important;
    right: 20px !important;
    transform: none !important;
  }
}

/* 슬라이딩 탭 전환 애니메이션 */
.transition-all {
  transition: all 0.2s ease-in-out;
}
</style>
