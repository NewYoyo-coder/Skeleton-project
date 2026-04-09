<template>
  <div
    class="flat-container"
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
    <header class="slim-header">
      <div class="month-display">
        <transition :name="slideDir" mode="out-in">
          <h2 :key="currentMonth" class="month-text">
            {{ currentYear }}년 {{ currentMonth }}월
          </h2>
        </transition>
      </div>
    </header>

    <section class="flat-summary">
      <div class="summary-box">
        <label>이번 달 지출</label>
        <transition name="value-pop" mode="out-in">
          <div :key="monthlyExpense" class="main-val">
            {{ monthlyExpense.toLocaleString() }}원
          </div>
        </transition>
      </div>
    </section>

    <div class="filter-tabs">
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

    <main class="list-wrapper">
      <TransitionGroup
        name="flip-list"
        tag="div"
        class="item-container"
        @before-enter="beforeEnter"
        @enter="enter"
      >
        <div
          v-for="(item, index) in displayedItems"
          :key="item.id"
          :data-index="index"
          class="flat-item hover-card"
        >
          <div class="item-left">
            <span class="flat-icon">{{ getRandomIcon(item.category_id) }}</span>
            <div class="content">
              <div class="shop-name">{{ item.shop_name }}</div>
              <div class="sub-info">
                {{ item.date.split('-')[2] }}일 · {{ item.category_id }}
              </div>
            </div>
          </div>
          <div class="item-right">
            <div :class="['price', item.transaction_type]">
              {{ item.transaction_type === 'income' ? '+' : ''
              }}{{ item.amount.toLocaleString() }}
            </div>
          </div>
        </div>
      </TransitionGroup>

      <div v-show="hasMore" ref="loadMoreTrigger" class="scroll-loader">
        <div class="mini-spinner"></div>
      </div>
    </main>

    <div class="swipe-hint" :style="{ opacity: dragOffset !== 0 ? 0.5 : 0 }">
      {{ dragOffset > 50 ? '이전 달로' : dragOffset < -50 ? '다음 달로' : '' }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';

const allTransactions = ref([]);
const displayedItems = ref([]);
const sortBy = ref('date');
const currentMonth = ref(4);
const currentYear = ref(2026);
const slideDir = ref('slide-right');

// 무한 스크롤 관련
const page = ref(1);
const perPage = 10;
const hasMore = ref(true);
const loadMoreTrigger = ref(null);
const loading = ref(false);

// [UX 개선] 드래그/스와이프 로직
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

// 터치 이벤트 (모바일용)
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
  slideDir.value = diff > 0 ? 'slide-left' : 'slide-right';
  currentMonth.value += diff;
  if (currentMonth.value > 12) {
    currentMonth.value = 1;
    currentYear.value++;
  } else if (currentMonth.value < 1) {
    currentMonth.value = 12;
    currentYear.value--;
  }
  resetAndFetch();
};

const loadData = async () => {
  const res = await fetch('http://localhost:3000/transactions');
  const data = await res.json();
  allTransactions.value = Array.isArray(data) ? data : data.transactions;
  resetAndFetch();
};

const filteredData = computed(() => {
  let filtered = allTransactions.value.filter((item) => {
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
  const start = (page.value - 1) * perPage;
  const nextItems = filteredData.value.slice(start, start + perPage);
  if (nextItems.length > 0) {
    displayedItems.value.push(...nextItems);
    page.value++;
  }
  if (displayedItems.value.length >= filteredData.value.length)
    hasMore.value = false;
};

// 무한 스크롤 Observer
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

watch(sortBy, () => resetAndFetch());
onMounted(() => {
  loadData();
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
  }, index * 60); // 0.06초 간격으로 순차적 실행 (파도 효과)
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700;800&display=swap');

/* 1. 컨테이너 & 기본 폰트 설정 */
.flat-container {
  max-width: 480px;
  margin: 0 auto;
  background: #ffffff;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  user-select: none;
  font-family:
    'Pretendard',
    -apple-system,
    sans-serif;
  color: #191f28; /* 토스 표준 텍스트 컬러 */
}

/* 2. 헤더: 글자 크기 및 자간 최적화 */
.slim-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 20px;
  background: #fff;
}
.month-text {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin: 0 20px;
}
.arrow-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #b0b8c1;
  cursor: pointer;
  padding: 10px;
  transition: color 0.2s;
}
.arrow-btn:hover {
  color: #4e5968;
}

/* 3. 요약 섹션: 숫자 가독성 강조 */
.flat-summary {
  padding: 24px 24px 32px;
}
.summary-box label {
  font-size: 14px;
  font-weight: 500;
  color: #4e5968;
  display: block;
  margin-bottom: 6px;
}
.main-val {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -1px;
  color: #191f28;
}

/* 4. 슬라이딩 탭: 버튼 간격 및 텍스트 정렬 */
.filter-tabs {
  padding: 0 20px 16px;
}
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  color: #3182f6;
}

/* 5. 리스트 카드: 항목별 텍스트 밸런스 */
.item-container {
  padding: 0 12px 100px;
}
.hover-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  margin-bottom: 4px;
  border-radius: 16px;
  background: #fff;
  transition:
    background 0.2s ease,
    transform 0.1s ease;
}
.hover-card:active {
  background: #f2f4f6;
  transform: scale(0.98);
}

.item-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.flat-icon {
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #f9fafb;
  border-radius: 14px;
}
.shop-name {
  font-size: 17px;
  font-weight: 600;
  color: #333d4b;
  line-height: 1.3;
}
.sub-info {
  font-size: 13px;
  color: #8b95a1;
  margin-top: 2px;
  font-weight: 400;
}

/* 6. 금액 표시: 수입/지출 위계 */
.item-right {
  text-align: right;
}
.price {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.3px;
}
.price.income {
  color: #3182f6;
}
.price.expense {
  color: #191f28;
}

/* 7. 기타 애니메이션 및 UI 요소 */
.swipe-hint {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(49, 130, 246, 0.9);
  color: #fff;
  padding: 12px 24px;
  border-radius: 30px;
  font-weight: 700;
  pointer-events: none;
  z-index: 100;
}

.scroll-loader {
  padding: 40px 0;
  display: flex;
  justify-content: center;
}
.mini-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid #f2f4f6;
  border-top-color: #3182f6;
  border-radius: 50%;
  animation: spin 1s infinite linear;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* FLIP & Slide 트랜지션 로직 */
.flip-list-move {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-left-enter-active,
.slide-right-enter-active {
  transition: all 0.3s ease-out;
}
.slide-left-enter-from {
  transform: translateX(50px);
  opacity: 0;
}
.slide-right-enter-from {
  transform: translateX(-50px);
  opacity: 0;
}
/* 월 전환 롤링 효과 */
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

/* 카드 터치 리플 (간지용) */
.hover-card {
  position: relative;
  overflow: hidden;
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
/* 화면 전체를 덮는 촤아악 레이어 */
/* 끝단이 연하고 둥근 촤아악 레이어 */
.swipe-overlay {
  position: absolute;
  top: 5%; /* 상하단 살짝 띄워서 둥근 느낌 강조 */
  height: 90%;
  width: 120%; /* 화면보다 넓게 설정해서 부드럽게 진입 */
  background: radial-gradient(
    circle at center,
    rgba(49, 130, 246, 0.8) 0%,
    rgba(131, 56, 236, 0.4) 60%,
    transparent 100%
  );
  filter: blur(20px); /* 끝단을 흐릿하게 뭉개기 */
  border-radius: 50% 100% 100% 50%; /* 비대형 라운딩으로 파도 느낌 */
  z-index: 9999;
  pointer-events: none;
  transition:
    opacity 0.2s ease,
    transform 0.1s linear;
}

/* 전환 시 전체 화면 대비감 살리기 */
.slide-left-enter-active,
.slide-right-enter-active {
  animation: smooth-wave 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

@keyframes smooth-wave {
  0% {
    opacity: 0.5;
    transform: scale(0.98);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes wave-flash {
  0% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.2) contrast(1.1);
  }
  100% {
    filter: brightness(1);
  }
}
</style>
