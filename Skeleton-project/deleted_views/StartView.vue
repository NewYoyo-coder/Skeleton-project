<template>
  <div class="start-page">
    <div class="intro-box">
      <div class="image-box">
        <img
          class="piggy-image"
          src="https://cdn-icons-png.flaticon.com/512/216/216687.png"
          alt="piggy bank"
        />
      </div>

      <h1 class="title">가계부 앱 시작</h1>
      <p class="sub-text">이름 과 이메일 을 입력하고 시작하세요.</p>

      <form class="user-form" @submit.prevent="goToHome">
        <input
          v-model="userName"
          type="text"
          placeholder="이름 입력"
          class="form-input"
        />
        <input
          v-model="userEmail"
          type="email"
          placeholder="이메일 입력"
          class="form-input"
        />
        <button type="submit" class="start-btn">시작하기</button>
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

const goToHome = () => {
  if (!userName.value.trim() || !userEmail.value.trim()) {
    alert('이름과 이메일을 모두 입력해주세요.');
    return;
  }

  userStore.setUserInfo(userName.value, userEmail.value);
  router.push('/home');
};
</script>

<style scoped>
.start-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--bg-color);
}

.intro-box {
  width: 360px;
  padding: 32px;
  border-radius: 20px;
  background: var(--card-bg);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.image-box {
  margin-bottom: 16px;
}

.piggy-image {
  width: 100px;
  animation: fadeSlideIn 1s ease;
}

.title {
  margin: 0 0 8px;
}

.sub-text {
  margin-bottom: 20px;
  font-size: 14px;
}

.user-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-input {
  padding: 12px;
  border: 1px solid #cccccc;
  border-radius: 10px;
}

.start-btn {
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: #f4a261;
  color: white;
  font-weight: bold;
  cursor: pointer;
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
