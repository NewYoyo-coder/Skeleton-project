<template>
  <header class="bg-black py-3">
    <div class="container">
      <nav class="d-flex justify-content-center align-items-center gap-3">
        <router-link to="/mainDashboard" class="text-white text-decoration-none"
          >홈</router-link
        >
        <span class="text-white-50">|</span>

        <a
          href="#"
          class="text-white text-decoration-none"
          data-bs-toggle="modal"
          data-bs-target="#monthModal"
          @click.prevent
        >
          날짜선택
        </a>

        <span class="text-white-50">|</span>
        <router-link
          to="/transactionHistory"
          class="text-white text-decoration-none"
          >거래내역</router-link
        >
        <span class="text-white-50">|</span>
        <router-link
          to="/profileSettings"
          class="text-white text-decoration-none"
          >프로필&설정</router-link
        >
      </nav>
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
