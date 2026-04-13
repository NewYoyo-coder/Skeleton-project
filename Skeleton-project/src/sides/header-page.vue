<template>
  <header class="w-100 px-3 mt-3">
    <div
      class="d-flex align-items-center justify-content-between mx-auto bg-white border-bottom rounded-4 px-2"
      style="max-width: 600px; height: 50px"
    >
      <div class="d-flex align-items-center h-100" style="width: 100px">
        <router-link
          to="/mainDashboard"
          class="text-decoration-none d-flex align-items-center"
        >
          <img
            src="@/assets/logo_transparent.png"
            alt="가계부 로고"
            style="height: 32px; width: auto; object-fit: contain"
          />
        </router-link>
      </div>

      <div
        class="d-flex justify-content-center align-items-center gap-2 flex-grow-1 bg-transparent"
      >
        <template v-if="isMainPage">
          <div style="width: 32px; height: 32px">
            <button
              class="t-btn t-push t-single p-0 d-flex align-items-center justify-content-center w-100 h-100"
              style="border-radius: 10px"
              @click="changeMonth(-1)"
            >
              <i class="fa-solid fa-chevron-left" style="font-size: 1rem"></i>
            </button>
          </div>

          <div
            class="t-push t-single d-flex align-items-center justify-content-center px-3"
            style="
              height: 36px;
              min-width: 110px;
              cursor: pointer;
              border-radius: 12px;
              background-color: rgba(255, 255, 255, 0.05);
            "
            @click.stop="openDateModal"
          >
            <h5
              class="text-dark mb-0 fw-bold"
              style="font-size: 1.1rem; line-height: 1; pointer-events: none"
            >
              {{ displayDate }}
            </h5>
          </div>

          <div style="width: 32px; height: 32px">
            <button
              class="t-btn t-push t-single p-0 d-flex align-items-center justify-content-center w-100 h-100"
              style="border-radius: 10px"
              :disabled="isFutureMonth"
              :class="{ 'opacity-25': isFutureMonth }"
              @click="handleNextMonth"
            >
              <i class="fa-solid fa-chevron-right" style="font-size: 1rem"></i>
            </button>
          </div>
        </template>

        <template v-else>
          <h5
            class="text-dark mb-0 fw-bold animate-fade"
            style="font-size: 1.1rem"
          >
            {{ pageTitle }}
          </h5>
        </template>
      </div>

      <div style="width: 100px"></div>
    </div>
    <Picker ref="modalRef" id="dateModal" />
  </header>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useDateStore } from "@/stores/select-date.js";
import Picker from "../sides/header-datePicker.vue";
import { Modal } from "bootstrap";
import { useRoute } from "vue-router";

const route = useRoute();
const isMainPage = computed(() => route.name === "main");
// 현재 페이지가 메인인지 체크 (라우터 name 기준)

const pageTitle = computed(() => {
  const titles = {
    report: "통계 및 차트 리포트",
    history: "세부 거래내역",
    profile: "프로필 및 설정",
  };
  return titles[route.name] || "";
});

const dateStore = useDateStore();
const tempDate = ref(
  `${dateStore.selectedYear}-${String(dateStore.selectedMonth).padStart(2, "0")}`,
);

watch(
  [() => dateStore.selectedYear, () => dateStore.selectedMonth],
  ([newYear, newMonth]) => {
    tempDate.value = `${newYear}-${String(newMonth).padStart(2, "0")}`;
  },
);
const applyDate = () => {
  if (tempDate.value) {
    const [year, month] = tempDate.value.split("-").map(Number);
    dateStore.setDate(year, month);
  }
};

const displayDate = computed(() => {
  const yy = String(dateStore.selectedYear).slice(-2);
  const mm = String(dateStore.selectedMonth).padStart(2, "0");

  return `${yy}. ${mm}`;
});

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

// 실제 월 변경 및 스토어 업데이트 함수
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

  // 변경된 날짜를 Pinia 스토어에 바로 저장
  dateStore.setDate(year, month);
};

// 다음 달 화살표 클릭 시 실행 (미래가 아닐 때만 작동)
const handleNextMonth = () => {
  if (!isFutureMonth.value) {
    changeMonth(1);
  }
};

// 1. ref 연결
const modalRef = ref(null);
let bsModal = null;

// 2. onMounted에서 제거
onMounted(() => {});

// 3. 모달 열기 함수
// 기존 openDateModal 함수를 아래로 교체
const openDateModal = () => {
  // 💡 onMounted에서 이미 선언한 bsModal을 바로 사용
  if (bsModal) {
    bsModal.show();
  } else {
    // 혹시라도 bsModal이 초기화 전이라면 직접 찾기 (안전장치)
    const modalElem = document.getElementById("dateModal");
    if (modalElem) {
      const myModal = new Modal(modalElem);
      myModal.show();
    }
  }
};
</script>

<style scoped></style>
