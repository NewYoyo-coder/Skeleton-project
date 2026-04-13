<template>
  <div class="modal fade" id="dateModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered custom-picker-width">
      <div class="modal-content border-0 shadow rounded-4 overflow-hidden">
        <div class="p-3 text-center border-bottom fw-bold text-primary fs-7">
          연도와 월을 선택하세요
        </div>

        <div class="d-flex" style="height: 150px">
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
          <div
            class="d-flex justify-content-between gap-2 mb-3 quick-btn-group"
          >
            <button @click="quickSet(0)" class="t-btn t-push w-100 py-2">
              최근
            </button>
            <button @click="quickSet(3)" class="t-btn t-push w-100 py-2">
              3개월
            </button>
            <button @click="quickSet(6)" class="t-btn t-push w-100 py-2">
              6개월
            </button>
            <button @click="quickSet(12)" class="t-btn t-push w-100 py-2">
              1년
            </button>
          </div>

          <button
            @click="applyDate"
            class="btn btn-primary t-push w-100 fw-bold py-3"
            data-bs-dismiss="modal"
          >
            {{ selectedYear }}년 {{ selectedMonth }}월 이동
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 🚨 Swiper 필수 기능 임포트
import { ref } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { useDateStore } from "@/stores/select-date.js";
import { Mousewheel, FreeMode } from "swiper/modules";
import "swiper/css";

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
/* 1. 모달 다이얼로그 가로폭 - 모바일 대응 */
.custom-picker-width {
  width: 90%;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
}

/* 2. 메인 카드 - 토스 특유의 둥근 모서리 */
.modal-content {
  background-color: #ffffff;
  border-radius: 28px !important;
  border: none !important;
}

/* 3. 스와이퍼 영역 및 아이템 스타일 */
.picker-swiper {
  height: 150px;
  width: 100%;
}

.scroll-item {
  height: 50px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 500;
  color: var(--t-sub);
  /* 텍스트 색상 변화도 부드럽게 */
  transition:
    color 0.3s ease,
    font-size 0.3s ease;
}

/* 활성화된 슬라이드 - 토스 블루로 정체성 부여 */
.swiper-slide-active {
  color: var(--t-blue) !important;
  font-size: 19px !important;
  font-weight: 700 !important;
}

/* 4. 중앙 선택 영역 - 인디케이터 */
.selection-indicator {
  position: absolute;
  top: 50%;
  left: 12px;
  right: 12px;
  transform: translateY(-50%);
  height: 46px;
  background-color: var(--t-bg);
  border-radius: 14px;
  z-index: 0;
  pointer-events: none;
}

/* 5. 퀵 버튼 그룹 - 자연스러운 인터랙션 중심 */
.quick-btn-group {
  display: flex;
  background-color: var(--t-bg);
  padding: 5px;
  border-radius: 12px;
  gap: 4px;
}

.quick-btn-group .t-btn {
  flex: 1;
  border: none !important;
  background-color: transparent !important;
  color: var(--t-sub) !important;
  font-size: 12px;
  font-weight: 400;
  border-radius: 14px !important;
  height: 36px;
  /* 쫀득한 트랜지션 설정 */
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 🚨 누를 때(Active): 색상 추가 없이 '상태 변화'만 강조 */
.quick-btn-group .t-btn:active {
  transform: scale(0.95);
  background-color: #ffffff !important; /* 누를 때만 배경이 슥 올라옴 */
  color: var(--t-blue) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

/* 6. 하단 이동 버튼 - 메인 액션 강조 */
.btn-primary {
  background-color: var(--t-blue) !important;
  border: none !important;
  border-radius: 18px !important;
  box-shadow: 0 8px 20px rgba(49, 130, 246, 0.15) !important;
  font-size: 16px;
  font-weight: 700;
  /* 버튼 트랜지션 통일 */
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.btn-primary:active {
  transform: scale(0.97) !important;
  filter: brightness(0.95);
}

.disabled-item {
  opacity: 0.2 !important;
}
</style>
