<template>
  <div class="d-flex flex-column justify-content-center align-items-center">
    <div
      class="p-4 p-md-5 rounded-4 shadow-sm text-center"
      style="max-width: 380px; width: 100%; background: white"
    >
      <div class="mb-4">
        <img
          class="piggy-image fade-slide-in"
          src="../assets/logo_transparent.png"
          style="width: 120px"
        />
      </div>

      <h1 class="h4 fw-bold mb-2">
        {{ isLoginMode ? "가계부 시작" : "회원가입 신청" }}
      </h1>
      <p class="text-secondary small mb-4">
        {{
          isLoginMode
            ? "정보를 입력하고 시작하세요."
            : "신규 계정 생성을 위한 정보를 입력하세요."
        }}
      </p>

      <form
        class="d-grid gap-3"
        @submit.prevent="isLoginMode ? goToHome() : null"
      >
        <input
          v-if="!isLoginMode"
          v-model="regName"
          type="text"
          placeholder="사용할 이름"
          class="form-control form-control-lg fs-6"
        />
        <input
          v-model="userEmail"
          type="text"
          placeholder="아이디(이메일)"
          class="form-control form-control-lg fs-6"
        />
        <input
          v-model="userPassword"
          type="password"
          placeholder="비밀번호"
          class="form-control form-control-lg fs-6"
        />

        <div class="t-wrapper w-100" style="height: 60px">
          <button
            type="submit"
            class="t-btn t-single t-push active"
            :class="{ 'opacity-50': !isLoginMode }"
            :disabled="!isLoginMode"
          >
            {{ isLoginMode ? "시작하기" : "가입 불가" }}
          </button>
        </div>
      </form>

      <div class="mt-4 pt-3 border-top">
        <p class="small text-muted mb-2">
          {{
            isLoginMode ? "아직 계정이 없으신가요?" : "이미 계정이 있으신가요?"
          }}
        </p>
        <button
          @click="isLoginMode = !isLoginMode"
          class="btn btn-outline-primary btn-sm rounded-pill px-4 fw-bold"
        >
          {{ isLoginMode ? "회원가입 하러가기" : "로그인으로 돌아가기" }}
        </button>
      </div>

      <div class="mt-3 p-2 border rounded-3 bg-light opacity-75">
        <p class="mb-1 fw-bold text-dark" style="font-size: 0.7rem">
          테스트 계정 정보
        </p>
        <div
          class="d-flex justify-content-center gap-2 text-secondary"
          style="font-size: 0.65rem"
        >
          <span>이름: <strong>홍길동</strong></span>
          <span>아이디: <strong>root@naver.com</strong></span>
          <span>PW: <strong>root</strong></span>
        </div>
      </div>

      <div v-if="!isLoginMode" class="mt-3 px-3">
        <p
          class="small text-danger fw-bold mb-2"
          style="font-size: 0.75rem; letter-spacing: -0.5px"
        >
          현재는 프로토타입의 JSON Server를 운영 중이에요!
        </p>

        <div
          class="text-secondary m-0"
          style="
            font-size: 0.6rem;
            line-height: 1.6;
            word-break: keep-all;
            letter-spacing: -0.3px;
          "
        >
          <p class="mb-1">
            • PostgreSQL, MySQL 등 관계형 DB 기반의 안정적인 설계 예정
          </p>
          <p class="mb-1">
            • MongoDB 또는 Firebase를 활용한 실시간 데이터 동기화 검토
          </p>
          <p class="mb-1">
            • 패스워드 솔트(Salt) 및 단방향 해시 알고리즘 기반의 보안
          </p>
          <p class="mb-1">
            • Redis 캐싱 도입을 통한 최적화 및 데이터 마이그레이션
          </p>
          <p class="mb-1">• 저희는 개인정보 보호를 최우선으로 삼을게요</p>

          <div class="text-primary fw-bold mt-2" style="font-size: 0.75rem">
            더 안전하고 든든한 모습으로 추후에 다시 만나요!
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/userStore";
import { useTransactionStore } from "@/stores/transaction";

const router = useRouter();
const userStore = useUserStore();
const transactionStore = useTransactionStore();

// 💡 폼 모드 전환 변수
const isLoginMode = ref(true);

const userName = ref(""); // 로그인용 (이름 입력 시)
const regName = ref(""); // 가입용
const userEmail = ref("");
const userPassword = ref("");

onMounted(async () => {
  await userStore.fetchUser();
  // 자동 로그인 로직 (생략 - 기존 유지)
});

const goToHome = async () => {
  // 로그인 검증 로직 (기존 유지)
  if (
    userEmail.value !== userStore.email ||
    userPassword.value !== userStore.password
  ) {
    notify.error("아이디 또는 비밀번호가 일치하지 않습니다.");
    return;
  }

  localStorage.setItem("isLoggedIn", "true");
  await transactionStore.fetchTransactions();
  router.push("/mainDashboard");
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
