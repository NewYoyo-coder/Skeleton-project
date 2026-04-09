<template>
  <div
    class="position-relative overflow-hidden min-vh-100 bg-white mx-auto custom-font d-flex flex-column"
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
    <transition name="value-pop" mode="out-in"> </transition>
    <div class="px-4 mb-3 text-center">
      <div
        class="d-inline-block py-2 px-4 rounded-pill bg-light border shadow-sm mb-3"
      >
        <h6 class="fw-bold text-dark mb-0">
          최근 거래 내역
          <span class="text-primary" style="font-size: 0.9em">(10건)</span>
        </h6>
      </div>
      <div class="tab-wrapper">
        <div
          class="active-bg"
          :style="{
            transform: `translateX(${sortBy === 'date' ? '0' : '100'}%)`,
          }"
        ></div>
        <button :class="{ on: sortBy === 'date' }" @click="sortBy = 'date'">
          최근순
        </button>
        <button :class="{ on: sortBy === 'amount' }" @click="sortBy = 'amount'">
          금액순
        </button>
      </div>
    </div>

    <main class="px-3 pb-5 flex-grow-1">
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
          class="hover-card p-3 mb-2 bg-white rounded-4 border-0 shadow-sm"
        >
          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-3">
              <!-- <div
                class="d-flex justify-content-center align-items-center rounded-3 bg-light fs-4"
                style="width: 52px; height: 52px"
              >
                {{ getRandomIcon(item.category_id) }}
              </div> -->

              <div>
                <div class="d-flex align-items-center gap-2 mb-1">
                  <span
                    class="badge rounded-pill"
                    :class="
                      item.transaction_type === 'income'
                        ? 'text-bg-primary'
                        : 'text-bg-danger'
                    "
                    style="font-size: 11px; font-weight: 500; padding: 4px 8px"
                  >
                    {{ item.category_id }}
                  </span>
                </div>

                <div
                  class="fw-semibold text-dark text-truncate"
                  style="max-width: 180px; font-size: 17px"
                >
                  <span>{{ item.shop_name }}</span>
                  <span
                    v-if="item.item_name"
                    class="text-muted fw-normal"
                    style="font-size: 14px"
                  >
                    · {{ item.item_name }}
                  </span>
                </div>

                <div
                  class="text-secondary d-flex gap-2 mt-1"
                  style="font-size: 12px"
                >
                  <span>{{ item.date.split('-')[2] }}일</span>
                  <span v-if="item.payment_method">{{
                    item.payment_method
                  }}</span>
                </div>

                <div
                  v-if="item.memo"
                  class="text-muted text-truncate mt-1"
                  style="font-size: 12px; max-width: 180px; font-style: italic"
                >
                  "{{ item.memo }}"
                </div>
              </div>
            </div>

            <div
              class="text-end fw-bold text-nowrap ms-2"
              :class="
                item.transaction_type === 'income'
                  ? 'text-primary'
                  : 'text-danger'
              "
              style="font-size: 18px; letter-spacing: -0.3px"
            >
              {{ item.transaction_type === 'income' ? '+' : '-' }}
              {{ item.amount.toLocaleString() }}원
            </div>
          </div>
        </div>
      </TransitionGroup>

      <!-- <div
        v-show="hasMore"
        ref="loadMoreTrigger"
        class="d-flex justify-content-center py-5"
      >
        <div
          class="spinner-border text-primary border-3"
          style="width: 24px; height: 24px"
          role="status"
        ></div>
      </div> -->
    </main>

    <div class="swipe-hint" :style="{ opacity: dragOffset !== 0 ? 0.9 : 0 }">
      {{ dragOffset > 50 ? '이전 달로' : dragOffset < -50 ? '다음 달로' : '' }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useDateStore } from '@/stores/select-date';
import { useTransactionStore } from '@/stores/transaction';

const dateStore = useDateStore();
const transactionStore = useTransactionStore();

const displayedItems = ref([]);
const sortBy = ref('date');
const slideDir = ref('slide-right');

// 무한 스크롤 관련
const page = ref(1);
const perPage = 10;
const hasMore = ref(true);
const loadMoreTrigger = ref(null);
const loading = ref(false);

// 드래그/스와이프 로직
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
  if (dragOffset.value > 70) changeMonth(-1);
  else if (dragOffset.value < -70) changeMonth(1);
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

  dateStore.setDate(year, month); // Store 값 변경 -> 컴포넌트는 자동 반응
};

const filteredData = computed(() => {
  let filtered = allTransactions.value.filter((item) => {
    if (!item.date) return false;
    const [y, m] = item.date.split('-').map(Number);
    return y === currentYear.value && m === currentMonth.value;
  });
  return sortBy.value === 'date'
    ? [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date))
    : [...filtered].sort((a, b) => b.amount - a.amount);
});

const resetAndFetch = () => {
  page.value = 1;
  displayedItems.value = [];
  hasMore.value = true;
  fetchMore();
};

const fetchMore = () => {
  const sortedData = transactionStore.getSortedData(sortBy.value); // 스토어에서 가져오기
  const start = (page.value - 1) * perPage;
  const nextItems = sortedData.slice(start, start + perPage);

  if (nextItems.length > 0) {
    displayedItems.value.push(...nextItems);
    page.value++;
  }
  hasMore.value = displayedItems.value.length < sortedData.length;
};

let observer;
const initObserver = () => {
  if (observer) observer.disconnect();
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMore.value) fetchMore();
    },
    { threshold: 0.1 },
  );
  nextTick(() => {
    if (loadMoreTrigger.value) observer.observe(loadMoreTrigger.value);
  });
};

// 날짜나 정렬 방식이 바뀌면 무조건 리스트 리셋하고 새로 가져옴
watch(
  [() => dateStore.selectedYear, () => dateStore.selectedMonth, sortBy],
  () => resetAndFetch(),
);

onMounted(async () => {
  await transactionStore.fetchTransactions(); // 직접 fetch 대신 스토어 호출
  resetAndFetch();
  initObserver();
});

const getRandomIcon = (cat) => {
  const icons = { food: '🍕', cafe: '☕', salary: '💰' };
  return icons[cat] || '💸';
};

const monthlyIncome = computed(() =>
  filteredData.value
    .filter((i) => i.transaction_type === 'income')
    .reduce((acc, cur) => acc + cur.amount, 0),
);
const monthlyExpense = computed(() =>
  filteredData.value
    .filter((i) => i.transaction_type === 'expense')
    .reduce((acc, cur) => acc + cur.amount, 0),
);

const beforeEnter = (el) => {
  el.style.opacity = 0;
  el.style.transform = 'translateY(30px) scale(0.9)';
};

const enter = (el, done) => {
  const index = el.dataset.index % perPage;
  setTimeout(() => {
    el.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    el.style.opacity = 1;
    el.style.transform = 'translateY(0) scale(1)';
    done();
  }, index * 60);
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700;800&display=swap');

.custom-font {
  font-family:
    'Pretendard',
    -apple-system,
    sans-serif;
  color: #191f28;
}

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
  color: #3182f6; /* 활성화 파란색 */
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
  transition:
    opacity 0.2s ease,
    transform 0.1s linear;
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
</style>
