<template>
  <div class="report-wrapper d-flex flex-column h-100 bg-white mt-2 px-2">
    <header class="px-3 sticky-top bg-white z-2 shadow-sm">
      <div class="d-flex justify-content-between align-items-center mb-3 px-2">
        <button
          class="btn btn-sm btn-light rounded-circle t-push"
          style="background-color: rgba(255, 255, 255, 0.1)"
          @click="moveMonth(-1)"
        >
          <i class="bi bi-chevron-left"></i>
        </button>

        <h4
          class="m-0 fw-bold text-dark d-flex align-items-center gap-2 cursor-pointer"
          data-bs-toggle="modal"
          data-bs-target="#reportDateModal"
          @click="openPicker"
        >
          {{ currentYear }}년 {{ currentMonth }}월
          <i class="bi bi-chevron-down fs-7 text-secondary"></i>
        </h4>

        <button
          class="btn btn-sm btn-light rounded-circle t-push"
          style="background-color: rgba(255, 255, 255, 0.1)"
          @click="moveMonth(1)"
        >
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>

      <div
        class="t-wrapper w-100 mx-auto"
        style="height: 44px; max-width: 400px; --t-width: 50%"
      >
        <div
          class="t-active-bg"
          :style="{
            transform: `translateX(${currentTab === 'calendar' ? '0' : '100'}%)`,
          }"
        ></div>
        <button
          class="t-btn t-push fw-bold"
          :class="{ active: currentTab === 'calendar' }"
          @click="currentTab = 'calendar'"
        >
          🗓️ 달력
        </button>
        <button
          class="t-btn t-push fw-bold"
          :class="{ active: currentTab === 'chart' }"
          @click="currentTab = 'chart'"
        >
          📊 통계
        </button>
      </div>
    </header>

    <main class="flex-grow-1 overflow-auto pt-3 px-3">
      <template v-if="isLoaded">
        <transition name="fade-slide" mode="out-in">
          <ReportCalendar
            v-if="currentTab === 'calendar'"
            :year="currentYear"
            :month="currentMonth"
          />
          <ReportChart v-else :year="currentYear" :month="currentMonth" />
        </transition>
      </template>

      <div
        v-else
        class="d-flex justify-content-center align-items-center h-100"
      >
        <div class="spinner-border text-primary" role="status"></div>
      </div>
    </main>

    <div
      class="modal fade"
      id="reportDateModal"
      tabindex="-1"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered custom-picker-width">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div
            class="p-3 text-center bg-white border-bottom fw-bold"
            style="color: #3182f6"
          >
            분석할 연도와 월을 선택하세요
          </div>

          <div class="d-flex bg-white" style="height: 150px">
            <div class="w-50 border-end position-relative">
              <swiper
                direction="vertical"
                :slidesPerView="3"
                :centeredSlides="true"
                :initialSlide="initialYearIndex"
                :slideToClickedSlide="true"
                :mousewheel="true"
                :observer="true"
                :observeParents="true"
                :modules="[Mousewheel]"
                :speed="200"
                @swiper="onSwiperYear"
                @slideChangeTransitionEnd="onYearChange"
                class="picker-swiper"
              >
                <swiper-slide v-for="y in years" :key="y" class="scroll-item"
                  >{{ y }}년</swiper-slide
                >
              </swiper>
              <div class="selection-indicator"></div>
            </div>

            <div class="w-50 position-relative">
              <swiper
                direction="vertical"
                :slidesPerView="3"
                :centeredSlides="true"
                :initialSlide="initialFlatIndex"
                :slideToClickedSlide="true"
                :observer="true"
                :observeParents="true"
                :modules="[Mousewheel, FreeMode]"
                :freeMode="{ enabled: true, sticky: true }"
                :mousewheel="{ forceToAxis: true }"
                :speed="200"
                @swiper="onSwiperMonth"
                @slideChange="onFlatChange"
                class="picker-swiper"
              >
                <swiper-slide
                  v-for="(d, idx) in flatDates"
                  :key="idx"
                  class="scroll-item"
                >
                  <div :class="{ 'disabled-item': isFuture(d.year, d.month) }">
                    {{ d.month }}월
                  </div>
                </swiper-slide>
              </swiper>
              <div class="selection-indicator"></div>
            </div>
          </div>

          <div class="p-3 bg-light border-top">
            <div
              class="d-flex justify-content-between gap-2 mb-3 quick-btn-group"
            >
              <button @click="quickSet(0)" class="t-btn t-push w-100 py-2">
                이번 달
              </button>
              <button @click="quickSet(3)" class="t-btn t-push w-100 py-2">
                3개월 전
              </button>
              <button @click="quickSet(6)" class="t-btn t-push w-100 py-2">
                6개월 전
              </button>
            </div>
            <button
              @click="applyDate"
              class="btn btn-primary t-push w-100 fw-bold py-3"
              data-bs-dismiss="modal"
            >
              {{ tempYear }}년 {{ tempMonth }}월로 이동
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"; // 1. onMounted 추가
import { useUserStore } from "@/stores/userStore"; // 2. 스토어 임포트 확인
import ReportCalendar from "@/sides/report-calendar.vue";
import ReportChart from "@/sides/report-chart.vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Mousewheel, FreeMode } from "swiper/modules";
import { useTransactionStore } from "@/stores/transaction";
import "swiper/css";

const userStore = useUserStore(); // 3. 스토어 사용 선언
const isLoaded = ref(false); // 4. 데이터 로드 상태 플래그

const transactionStore = useTransactionStore();

onMounted(async () => {
  try {
    // 🚀 2. 순차적으로 데이터를 땡겨옵니다.
    // 유저 정보가 없으면 가져오고
    if (!userStore.name) {
      await userStore.fetchUser();
    }

    // 트랜잭션 내역도 새로고침 시 날아가니까 다시 땡겨옵니다.
    await transactionStore.fetchTransactions();
  } catch (err) {
    console.error("데이터 로딩 중 사고 발생:", err);
  } finally {
    isLoaded.value = true; // 3. 모든 준비가 끝나면 화면을 엽니다.
  }
});

// --- 공통 상태 관리 ---
const today = new Date();
const currentYear = ref(today.getFullYear());
const currentMonth = ref(today.getMonth() + 1);
const currentTab = ref("calendar");

// --- 화살표 퀵 이동 로직 ---
const moveMonth = (delta) => {
  let newM = currentMonth.value + delta;
  let newY = currentYear.value;

  if (newM > 12) {
    newM = 1;
    newY++;
  } else if (newM < 1) {
    newM = 12;
    newY--;
  }

  if (isFuture(newY, newM)) return; // 미래 이동 차단

  currentYear.value = newY;
  currentMonth.value = newM;
};

// --- 피커 모달 전용 로직 (임시 저장용) ---
const tempYear = ref(currentYear.value);
const tempMonth = ref(currentMonth.value);
const years = [2023, 2024, 2025, 2026];
const flatDates = [];
years.forEach((y) => {
  for (let m = 1; m <= 12; m++) flatDates.push({ year: y, month: m });
});

let swiperYear = null;
let swiperMonth = null;
const isUpdating = ref(false);

const initialYearIndex = computed(() => years.indexOf(tempYear.value));
const initialFlatIndex = computed(() =>
  flatDates.findIndex(
    (d) => d.year === tempYear.value && d.month === tempMonth.value,
  ),
);

const onSwiperYear = (s) => (swiperYear = s);
const onSwiperMonth = (s) => (swiperMonth = s);

const isFuture = (y, m) =>
  y > today.getFullYear() ||
  (y === today.getFullYear() && m > today.getMonth() + 1);

const openPicker = () => {
  tempYear.value = currentYear.value;
  tempMonth.value = currentMonth.value;
  // 오픈 시 현재 날짜로 스와이퍼 위치 동기화
  if (swiperYear) swiperYear.slideTo(years.indexOf(tempYear.value), 0);
  if (swiperMonth)
    swiperMonth.slideToLoop(
      flatDates.findIndex(
        (d) => d.year === tempYear.value && d.month === tempMonth.value,
      ),
      0,
    );
};

const onYearChange = (s) => {
  if (isUpdating.value) return;
  const newY = years[s.activeIndex];
  tempYear.value = newY;
  const targetM = isFuture(newY, tempMonth.value)
    ? today.getMonth() + 1
    : tempMonth.value;
  const targetIdx = flatDates.findIndex(
    (d) => d.year === newY && d.month === targetM,
  );
  if (targetIdx !== -1 && swiperMonth) {
    isUpdating.value = true;
    tempMonth.value = targetM;
    swiperMonth.slideToLoop(targetIdx, 0);
    setTimeout(() => (isUpdating.value = false), 10);
  }
};

const onFlatChange = (s) => {
  if (isUpdating.value) return;
  const current = flatDates[s.realIndex];
  if (!current || isFuture(current.year, current.month)) return;
  tempYear.value = current.year;
  tempMonth.value = current.month;
  const yIdx = years.indexOf(current.year);
  if (swiperYear && swiperYear.activeIndex !== yIdx) {
    isUpdating.value = true;
    swiperYear.slideTo(yIdx);
    setTimeout(() => (isUpdating.value = false), 100);
  }
};

const quickSet = (monthsAgo) => {
  const base = new Date();
  base.setMonth(base.getMonth() - monthsAgo);
  const targetY = base.getFullYear();
  const targetM = base.getMonth() + 1;
  tempYear.value = targetY;
  tempMonth.value = targetM;
  if (swiperYear) swiperYear.slideTo(years.indexOf(targetY));
  if (swiperMonth)
    swiperMonth.slideToLoop(
      flatDates.findIndex((d) => d.year === targetY && d.month === targetM),
      300,
    );
};

const applyDate = () => {
  currentYear.value = tempYear.value;
  currentMonth.value = tempMonth.value;
};
</script>

<style scoped>
.t-wrapper {
  position: relative;
  display: flex;
  background-color: #f1f3f5;
  border-radius: 12px;
  padding: 4px;
}
.t-active-bg {
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 4px;
  width: calc(var(--t-width) - 4px);
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.t-btn {
  flex: 1;
  border: none;
  background: transparent;
  z-index: 1;
  color: #868e96;
  font-size: 14px;
  transition: color 0.3s;
}
.t-btn.active {
  color: #212529;
}
.cursor-pointer {
  cursor: pointer;
}
.custom-picker-width {
  width: 90%;
  max-width: 320px;
  margin: auto;
}
.picker-swiper {
  height: 150px;
}
.scroll-item {
  height: 50px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #6b7684;
  transition: 0.3s;
}
.swiper-slide-active {
  color: #3182f6 !important;
  font-size: 19px !important;
  font-weight: 700 !important;
}
.selection-indicator {
  position: absolute;
  top: 50%;
  left: 12px;
  right: 12px;
  transform: translateY(-50%);
  height: 46px;
  background-color: #f2f4f6;
  border-radius: 14px;
  z-index: 0;
  pointer-events: none;
}
.quick-btn-group {
  display: flex;
  background-color: #f2f4f6;
  padding: 5px;
  border-radius: 12px;
  gap: 4px;
}
.quick-btn-group .t-btn {
  flex: 1;
  border-radius: 14px !important;
  height: 36px;
}
.btn-primary {
  background-color: #3182f6 !important;
  border: none !important;
  border-radius: 18px !important;
}
.disabled-item {
  opacity: 0.2 !important;
}
</style>
