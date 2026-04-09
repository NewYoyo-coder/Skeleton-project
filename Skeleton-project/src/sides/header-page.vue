<template>
  <header class="py-3 mx-auto w-100" style="max-width: 600px">
    <div class="d-flex justify-content-between align-items-center px-4">
      <router-link
        to="/mainDashboard"
        class="text-black text-decoration-none fs-5 fw-bold"
      >
        가계부
      </router-link>

      <div class="d-flex align-items-center gap-2 gap-md-3">
        <a
          href="#"
          class="text-black text-decoration-none"
          style="font-size: 0.9rem"
          data-bs-toggle="modal"
          data-bs-target="#monthModal"
          @click.prevent
        >
          날짜선택
        </a>

        <span class="text-secondary" style="font-size: 0.9rem">|</span>

        <router-link
          to="/transactionHistory"
          class="text-black text-decoration-none"
          style="font-size: 0.9rem"
        >
          거래내역
        </router-link>

        <router-link
          to="/profileSettings"
          class="text-black text-decoration-none ms-1"
        >
          <i class="fa-solid fa-gear fs-5 text-dark"></i>
        </router-link>
      </div>
    </div>

    <div class="modal fade" id="monthModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content text-dark">
          <div class="modal-header">
            <h5 class="modal-title">조회할 월 선택</h5>
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
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              취소
            </button>
            <button
              type="button"
              class="btn btn-primary"
              data-bs-dismiss="modal"
              @click="applyDate"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';
import { useDateStore } from '@/stores/select-date.js';

const dateStore = useDateStore();

const displayYear = ref(dateStore.selectedYear);
const displayMonth = ref(dateStore.selectedMonth);

const monthStr =
  displayMonth.value < 10 ? `0${displayMonth.value}` : displayMonth.value;
const tempDate = ref(`${displayYear.value}-${monthStr}`);

const applyDate = (event) => {
  if (tempDate.value) {
    const [year, month] = tempDate.value.split('-');
    displayYear.value = parseInt(year, 10);
    displayMonth.value = parseInt(month, 10);

    //날짜를 Pinia 스토어에 저장
    dateStore.setDate(displayYear.value, displayMonth.value);

    console.log(
      `스토어에 저장 완료: ${dateStore.selectedYear}년 ${dateStore.selectedMonth}월`,
    );
  }
};
</script>

<style scoped></style>
