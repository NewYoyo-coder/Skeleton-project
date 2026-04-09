<template>
  <div class="d-flex justify-content-center align-items-center bg-light">
    <div
      class="p-4 p-md-5 rounded-4 shadow-sm text-center mt-5"
      style="max-width: 360px; width: 100%"
    >
      <div class="mb-4">
        <img
          class="piggy-image fade-slide-in"
          src="https://cdn-icons-png.flaticon.com/512/216/216687.png"
          alt="piggy bank"
          style="width: 100px"
        />
      </div>

      <h1 class="h4 fw-bold mb-2">가계부 앱 시작</h1>
      <p class="text-secondary small mb-4">이름을 입력하고 시작하세요.</p>

      <form class="d-grid gap-3" @submit.prevent="goToHome">
        <input
          v-model="userName"
          type="text"
          placeholder="이름 입력"
          class="form-control form-control-lg fs-6"
        />
        <input
          v-model="userEmail"
          type="email"
          placeholder="이메일 입력(선택사항)"
          class="form-control form-control-lg fs-6"
        />
        <button
          type="submit"
          class="btn btn-warning btn-lg text-white fw-bold shadow-sm"
        >
          시작하기
        </button>
      </form>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../src/stores/userStore';

const router = useRouter();
const userStore = useUserStore();

const userName = ref('');
const userEmail = ref('');

const goToHome = async () => {
  // 1. 유저 정보 먼저 저장
  if (!userName.value.trim()) {
    alert('이름을 입력해주세요.');
    return;
  }
  userStore.setUserInfo(userName.value, userEmail.value);

  // 2. [핵심] 대시보드 가기 전에 데이터 선로딩
  try {
    await transactionStore.fetchTransactions();
  } catch (err) {
    console.error('데이터 미리 가져오기 실패:', err);
  }

  // 3. 데이터 로딩 완수 후 이동 (이래야 대시보드 가자마자 뜸)
  // router.push('/home');
  router.push('/mainDashboard');
};
</script>
<style scoped>
/* 애니메이션은 부트스트랩에 없으므로 이것만 남겨둡니다 */
.fade-slide-in {
  animation: fadeSlideIn 1s ease forwards;
}
@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
