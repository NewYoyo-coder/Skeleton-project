<template>
  <header class="pb-3 order-bottom bg-white">
    <div
      class="container d-flex align-items-center justify-content-between"
      style="max-width: 600px; margin-left: auto; margin-right: auto"
    >
      <div style="width: 80px">
        <router-link
          to="/mainDashboard"
          class="text-decoration-none d-flex align-items-center"
        >
          <img
            src="@/assets/logo_transparent.png"
            alt="가계부 로고"
            style="height: 60px; width: auto; object-fit: contain"
          />
        </router-link>
      </div>

      <div class="d-flex justify-content-center align-items-center gap-3">
        <button
          class="btn btn-link text-dark p-0 text-decoration-none"
          @click="changeMonth(-1)"
        >
          <i class="fa-solid fa-chevron-left fs-5"></i>
        </button>

        <h5
          class="text-dark mb-0 fw-bold"
          style="
            min-width: 80px;
            text-align: center;
            letter-spacing: 0.5px;
            cursor: pointer;
          "
          data-bs-toggle="modal"
          data-bs-target="#monthSelectModal"
        >
          {{ displayDate }}
        </h5>

        <div
          class="modal fade"
          id="monthSelectModal"
          tabindex="-1"
          aria-hidden="true"
        >
          <div class="modal-dialog modal-dialog-centered modal-sm">
            <div class="modal-content text-dark">
              <div class="modal-header">
                <h5 class="modal-title">조회 월 선택</h5>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div class="modal-body">
                <input type="month" class="form-control" v-model="tempDate" />
              </div>
              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-primary w-100"
                  data-bs-dismiss="modal"
                  @click="applyDate"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          class="btn btn-link p-0 text-decoration-none text-dark"
          @click="handleNextMonth"
          :style="{ visibility: isFutureMonth ? 'hidden' : 'visible' }"
        >
          <i class="fa-solid fa-chevron-right fs-5"></i>
        </button>
      </div>

      <div
        class="d-flex align-items-center justify-content-end gap-3"
        style="width: 80px"
      >
        <router-link
          to="/transactionHistory"
          class="text-black text-decoration-none fs-6"
        >
          내역
        </router-link>
        <router-link
          to="/profileSettings"
          class="text-black text-decoration-none"
        >
          <i class="fa-solid fa-gear fs-5"></i>
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useDateStore } from '@/stores/select-date.js';

const dateStore = useDateStore();
const tempDate = ref(
  `${dateStore.selectedYear}-${String(dateStore.selectedMonth).padStart(2, '0')}`,
);

watch(
  [() => dateStore.selectedYear, () => dateStore.selectedMonth],
  ([newYear, newMonth]) => {
    tempDate.value = `${newYear}-${String(newMonth).padStart(2, '0')}`;
  },
);
const applyDate = () => {
  if (tempDate.value) {
    const [year, month] = tempDate.value.split('-').map(Number);
    dateStore.setDate(year, month);
  }
};

const displayDate = computed(() => {
  const y = dateStore.selectedYear;
  const m = dateStore.selectedMonth;
  const mm = m < 10 ? `0${m}` : m;
  return `${y}. ${mm}`;
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
</script>

<style scoped></style>
