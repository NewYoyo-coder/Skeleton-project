<template>
  <div class="modal-dialog modal-dialog-centered custom-picker-width">
    <div class="modal-content border-0 shadow rounded-4 overflow-hidden">
      <div
        class="p-3 text-center bg-white border-bottom fw-bold text-primary fs-7"
      >
        연도와 월을 선택하세요
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
            :touchRatio="1.5"
            :resistanceRatio="0"
            :followFinger="true"
            :momentumRatio="2"
            @swiper="onSwiperYear"
            @slideChangeTransitionEnd="onYearChange"
            class="picker-swiper"
          >
            <swiper-slide v-for="y in years" :key="y" class="scroll-item">
              {{ y }}년
            </swiper-slide>
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
            :loop="false"
            :modules="[Mousewheel, FreeMode]"
            :freeMode="{
              enabled: true,
              sticky: true,
              momentumBounce: false,
              momentumRatio: 0.5,
              momentumVelocityRatio: 0.5,
            }"
            :mousewheel="{
              forceToAxis: true,
              sensitivity: 1,
              thresholdDelta: 50,
              thresholdTime: 500,
            }"
            :speed="200"
            :touchRatio="1"
            :resistanceRatio="0"
            :followFinger="true"
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
        <div class="d-flex justify-content-between gap-1 mb-3">
          <button
            @click="quickSet(0)"
            class="btn btn-sm btn-outline-secondary w-100 px-0"
            style="font-size: 11px"
          >
            최근
          </button>
          <button
            @click="quickSet(3)"
            class="btn btn-sm btn-outline-secondary w-100 px-0"
            style="font-size: 11px"
          >
            3개월 전
          </button>
          <button
            @click="quickSet(6)"
            class="btn btn-sm btn-outline-secondary w-100 px-0"
            style="font-size: 11px"
          >
            6개월 전
          </button>
          <button
            @click="quickSet(12)"
            class="btn btn-sm btn-outline-secondary w-100 px-0"
            style="font-size: 11px"
          >
            1년 전
          </button>
        </div>

        <button
          @click="applyDate"
          class="btn btn-primary w-100 fw-bold py-2"
          data-bs-dismiss="modal"
        >
          {{ selectedYear }}년 {{ selectedMonth }}월 이동
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// 🚨 Swiper 필수 기능 임포트
import { ref } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { useDateStore } from '@/stores/select-date.js';
import { Mousewheel, FreeMode } from 'swiper/modules';
import 'swiper/css';

// DB 의존해서 날짜 데이터 체크없이 하드코딩으로 진행
const today = new Date();
const minYear = 2023;
const minMonth = 1;
const currentYear = today.getFullYear();
const currentMonth = today.getMonth() + 1;

const dateStore = useDateStore();
const years = [2023, 2024, 2025, 2026];

// 🚨 1. flatDates 정의를 위로 올리세요 (initialFlatIndex보다 먼저 선언)
const flatDates = [];
years.forEach((y) => {
  for (let m = 1; m <= 12; m++) {
    flatDates.push({ year: y, month: m });
  }
});

const selectedYear = ref(Number(dateStore.selectedYear));
const selectedMonth = ref(Number(dateStore.selectedMonth));

// 🚨 2. 초기 인덱스를 flatDates 기준으로 정확히 계산
const initialFlatIndex = flatDates.findIndex(
  (d) => d.year === selectedYear.value && d.month === selectedMonth.value,
);
const initialYearIndex = years.indexOf(selectedYear.value);

// Swiper 인스턴스 저장용 변수
let swiperYear = null;
let swiperMonth = null;

const onSwiperYear = (swiper) => {
  swiperYear = swiper;
};
const onSwiperMonth = (swiper) => {
  swiperMonth = swiper;
};

// 🚨 상단에 플래그 변수 추가
const isUpdating = ref(false);

// 1. 연도 변경 시: 월 피커에 불필요한 간섭 차단
const onYearChange = (swiper) => {
  if (isUpdating.value) return;

  const newYear = years[swiper.activeIndex];
  selectedYear.value = newYear;

  // 1. 목표가 될 월 결정 (미래라면 현재 월로, 아니면 유지)
  const targetMonth = isFuture(newYear, selectedMonth.value)
    ? currentMonth
    : selectedMonth.value;

  // 2. 전체 리스트(flatDates)에서 해당 연도와 결정된 월의 위치 찾기
  const targetIdx = flatDates.findIndex(
    (d) => d.year === newYear && d.month === targetMonth,
  );

  if (targetIdx !== -1 && swiperMonth) {
    isUpdating.value = true;
    selectedMonth.value = targetMonth; // 변수도 즉시 업데이트

    // 🚨 속도를 0으로 하여 12칸을 굴러가는 UX 참사를 막고 즉시 이동
    swiperMonth.slideToLoop(targetIdx, 0);

    setTimeout(() => (isUpdating.value = false), 10);
  }
};

// 🚨 과거 날짜인지 확인하는 함수
const isPast = (year, month) => {
  if (year < minYear) return true;
  if (year === minYear && month < minMonth) return true;
  return false;
};

// 🚨 미래 날짜인지 확인하는 함수
const isFuture = (year, month) => {
  if (year > currentYear) return true;
  if (year === currentYear && month > currentMonth) return true;
  return false;
};

// 2. 월 변경 시 (onFlatChange): 연도 피커 동기화
const onFlatChange = (swiper) => {
  if (isUpdating.value) return;

  const current = flatDates[swiper.realIndex];
  if (!current) return;

  // 🚨 1. 미래 날짜 차단
  if (isFuture(current.year, current.month)) {
    const todayIdx = flatDates.findIndex(
      (d) => d.year === currentYear && d.month === currentMonth,
    );
    swiper.slideToLoop(todayIdx, 100); // 부드럽게 현재로 견인
    return;
  }

  // 🚨 2. 과거 날짜 차단 (2023년 1월 이전 점프 방지)
  if (isPast(current.year, current.month)) {
    const minIdx = flatDates.findIndex(
      (d) => d.year === minYear && d.month === minMonth,
    );
    swiper.slideToLoop(minIdx, 100); // 최하단인 23년 1월로 견인
    return;
  }

  selectedYear.value = current.year;
  selectedMonth.value = current.month;

  const yIdx = years.indexOf(current.year);
  if (swiperYear && swiperYear.activeIndex !== yIdx) {
    isUpdating.value = true;
    swiperYear.slideTo(yIdx);
    setTimeout(() => (isUpdating.value = false), 100);
  }
};

// 퀵 버튼 로직 보정
const quickSet = (monthsAgo) => {
  const baseDate = new Date();
  baseDate.setMonth(baseDate.getMonth() - monthsAgo);

  let targetYear = baseDate.getFullYear();
  let targetMonth = baseDate.getMonth() + 1;

  if (targetYear < 2023) {
    targetYear = 2023;
    targetMonth = 1;
  }

  // 🚨 미래로 가는 퀵 버튼 클릭 방어
  if (isFuture(targetYear, targetMonth)) {
    targetYear = currentYear;
    targetMonth = currentMonth;
  }

  selectedYear.value = targetYear;
  selectedMonth.value = targetMonth;

  // 🚨 flatDates에서 위치를 찾아야 정확하게 이동합니다.
  const targetIdx = flatDates.findIndex(
    (d) => d.year === targetYear && d.month === targetMonth,
  );

  if (swiperYear) swiperYear.slideTo(years.indexOf(targetYear));
  if (swiperMonth && targetIdx !== -1) swiperMonth.slideToLoop(targetIdx, 300);
};

// 적용 버튼
const applyDate = () => {
  dateStore.setDate(selectedYear.value, selectedMonth.value);
};
</script>

<style scoped>
.custom-picker-width {
  /* 모바일에서는 화면의 90%, 데스크톱에서는 400px 고정 */
  width: 80%;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

/* Swiper 컨테이너 높이 강제 (중앙 정렬의 핵심) */
.picker-swiper {
  height: 150px;
  width: 100%;
}

/* 각 아이템의 높이를 50px로 고정 (3개가 보이면 150px) */
.scroll-item {
  height: 50px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: #aaa;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

/* 🚨 미래 날짜 스타일 */
.disabled-item {
  opacity: 0.15 !important;
  filter: grayscale(100%);
  cursor: not-allowed !important;
}

/* 중앙에 선택된 아이템 스타일 (Swiper 내장 클래스 활용) */
.swiper-slide-active {
  color: #000;
  font-size: 1.3rem;
  font-weight: 800;
}

/* 중앙 회색 선택 박스 (배경용) */
.selection-indicator {
  position: absolute;
  top: 50%;
  left: 5%;
  transform: translateY(-50%);
  width: 90%;
  height: 50px;
  background-color: #f1f3f5;
  opacity: 0.5;
  border-radius: 12px;
  z-index: -1;
  pointer-events: none;
}
</style>
