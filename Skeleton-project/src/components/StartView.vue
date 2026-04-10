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
          placeholder="이름 입력 (선택사항)"
          class="form-control form-control-lg fs-6"
        />
        <input
          v-model="userEmail"
          type="id"
          placeholder="아이디 입력"
          class="form-control form-control-lg fs-6"
        />
        <input
          v-model="userPassword"
          type="password"
          placeholder="비밀번호 입력"
          class="form-control form-control-lg fs-6"
        />
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
const userPassword = ref('');
const autoLogin = ref(true);

onMounted(async () => {
  await userStore.fetchUser();
  // 자동 로그인 체크 (이름이 있고 설정이 true일 때)
  if (userStore.name && userStore.autoLogin) {
    try {
      await transactionStore.fetchTransactions();
      router.replace('/mainDashboard');
    } catch (err) {
      console.error('자동 로그인 실패:', err);
    }
  }
});

const goToHome = async () => {
  // 아이디/비번 필수 체크 (고정값이더라도 입력은 받아야 하므로)
  if (!userEmail.value || !userPassword.value) {
    alert('아이디와 비밀번호를 입력해주세요.');
    return;
  }

  const userData = {
    name: userName.value || '사용자', // 이름 미입력 시 기본값
    email: userEmail.value,
    password: userPassword.value, // DB에 함께 저장
    currency: 'KRW',
    last_login: new Date().toISOString().split('T')[0],
    settings: {
      theme: userStore.theme,
      auto_login: autoLogin.value,
    },
  };

  try {
    await userStore.setUserInfo(userData);
    await transactionStore.fetchTransactions();
    router.push('/mainDashboard');
  } catch (err) {
    alert('저장 실패');
  }
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
