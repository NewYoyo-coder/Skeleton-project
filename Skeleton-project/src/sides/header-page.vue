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

const today = new Date();
const displayYear = ref(today.getFullYear());
const displayMonth = ref(today.getMonth() + 1);

const monthStr =
  displayMonth.value < 10 ? `0${displayMonth.value}` : displayMonth.value;
const tempDate = ref(`${displayYear.value}-${monthStr}`);

const applyDate = () => {
  if (tempDate.value) {
    const [year, month] = tempDate.value.split('-');
    displayYear.value = parseInt(year, 10);
    displayMonth.value = parseInt(month, 10);

    console.log(`선택된 날짜: ${displayYear.value}년 ${displayMonth.value}월`);
  }
};
</script>

<style scoped></style>
