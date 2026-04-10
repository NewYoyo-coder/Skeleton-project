<template>
  <div class="d-flex justify-content-center align-items-center bg-light">
    <div
      class="p-4 p-md-5 rounded-4 shadow-sm text-center mt-5"
      style="max-width: 360px; width: 100%"
    >
      <div class="mb-4">
        <img
          class="piggy-image fade-slide-in"
          src="../assets/logo_transparent.png"
          alt="사진이 없어요"
          style="width: 150px"
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
        <!-- <button
          type="submit"
          class="btn btn-warning btn-lg text-white fw-bold shadow-sm"
        >
          시작하기
        </button> -->

        <!-- <div class="d-flex align-items-center gap-2 px-1">
          <input
            v-model="autoLogin"
            type="checkbox"
            id="auto-login"
            class="form-check-input"
          />
          <label
            for="auto-login"
            class="text-secondary small"
            style="cursor: pointer"
          >
            내 정보를 기억할게요
          </label>
        </div> -->
        <div class="t-wrapper" style="width: 300px; height: 60px">
          <button type="submit" class="t-btn t-single t-push active">
            시작하기
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useTransactionStore } from '@/stores/transaction';

const router = useRouter();
const userStore = useUserStore();
const transactionStore = useTransactionStore();

const userName = ref('');
const userEmail = ref('');
const autoLogin = ref(true);

onMounted(async () => {
  // 스토어 내부의 user 객체를 바로 확인
  const savedUser = userStore.user;

  if (savedUser?.name && savedUser?.settings?.auto_login) {
    try {
      await transactionStore.fetchTransactions();
      router.replace('/mainDashboard');
    } catch (err) {
      console.error('자동 로그인 실패:', err);
    }
  }
});

const goToHome = async () => {
  if (!userName.value.trim()) {
    alert('이름을 입력해주세요.');
    return;
  }

  // 1. 요청하신 JSON 규격 그대로 생성
  const userData = {
    name: userName.value,
    email: userEmail.value,
    currency: 'KRW',
    last_login: new Date().toISOString().split('T')[0],
    settings: {
      theme: 'light',
      auto_login: autoLogin.value,
    },
  };

  // 2. 유저 정보 저장 (객체 통째로 전달)
  userStore.setUserInfo(userData);

  // 3. 데이터 로딩 후 이동
  try {
    await transactionStore.fetchTransactions();
  } catch (err) {
    console.error('로딩 에러:', err);
  }

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
