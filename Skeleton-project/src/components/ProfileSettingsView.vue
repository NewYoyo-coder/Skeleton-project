<template>
  <div class="profile-page h-100 d-flex align-items-center">
    <div class="container px-3 py-2">
      <div
        class="card shadow-sm mx-auto border-0 rounded-4 overflow-hidden p-4 custom-card"
      >
        <h2 class="h4 mb-4 fw-bold text-h">프로필 & 설정</h2>

        <div class="mb-4">
          <div
            class="mb-4 p-3 rounded-4 transition-all"
            :style="{
              backgroundColor: isPasswordCorrect
                ? 'rgba(49, 130, 246, 0.15)'
                : 'rgba(150, 150, 150, 0.1)',
              backdropFilter: 'blur(10px)',
              border: isPasswordCorrect
                ? '1px solid rgba(49, 130, 246, 0.2)'
                : '1px solid rgba(150, 150, 150, 0.1)',
            }"
          >
            <label
              class="form-label small fw-bold"
              :class="isPasswordCorrect ? 'text-primary' : 'text-danger'"
            >
              본인 인증 {{ isPasswordCorrect ? "✅" : "🔒" }}
            </label>
            <input
              v-model="confirmPassword"
              type="password"
              class="form-control form-control-lg border-0 shadow-none"
              style="
                background-color: rgba(255, 255, 255, 0.05) !important;
                color: inherit;
              "
              placeholder="기존 비밀번호 입력"
            />
          </div>

          <div class="mb-2 text-start px-1">
            <label
              class="form-label small fw-bold mb-1"
              :class="{ 'opacity-50': !isPasswordCorrect }"
              >이름</label
            >
            <input
              v-model="editName"
              type="text"
              class="form-control form-control-lg border-0"
              :readonly="!isPasswordCorrect"
              :placeholder="isPasswordCorrect ? '이름 입력' : '잠겨있음'"
            />
          </div>

          <div class="mb-3 text-start px-1">
            <label
              class="form-label small fw-bold mb-1"
              :class="{ 'opacity-50': !isPasswordCorrect }"
              >이메일</label
            >
            <input
              v-model="editEmail"
              type="email"
              class="form-control form-control-lg border-0 bg-light-subtle"
              :readonly="!isPasswordCorrect"
              :placeholder="isPasswordCorrect ? '이메일 입력' : '잠겨있음'"
            />
          </div>
        </div>

        <button
          class="t-btn t-push w-100 py-3 mb-3 rounded-4 fw-bold"
          :class="
            isPasswordCorrect
              ? 'active-chip'
              : 'bg-secondary opacity-50 text-white'
          "
          :disabled="!isPasswordCorrect"
          @click="saveProfile"
        >
          설정 저장하기
        </button>

        <button
          class="btn w-100 d-flex justify-content-between align-items-center py-2 px-1 border-top logout-row mb-3"
          @click="handleLogout"
        >
          <span class="fw-medium text-secondary small">로그아웃</span>
          <i class="fa-solid fa-chevron-right text-secondary small"></i>
        </button>

        <div class="text-start">
          <p class="small fw-bold mb-2">화면 모드</p>
          <div class="t-wrapper w-100" style="height: 40px; --t-width: 50%">
            <div
              class="t-active-bg"
              :style="{
                transform: `translateX(${userStore.theme === 'light' ? '0' : '100'}%)`,
              }"
            ></div>
            <button
              class="t-btn t-push"
              :class="{ active: userStore.theme === 'light' }"
              @click="userStore.setTheme('light')"
            >
              ☀️ 라이트
            </button>
            <button
              class="t-btn t-push"
              :class="{ active: userStore.theme === 'dark' }"
              @click="userStore.setTheme('dark')"
            >
              🌙 다크
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "vue-router";

const router = useRouter();
const userStore = useUserStore();

const editName = ref("");
const editEmail = ref("");
const confirmPassword = ref("");

// 💡 쫀득 로직: 비밀번호 실시간 검증
const isPasswordCorrect = computed(
  () =>
    confirmPassword.value === userStore.password &&
    confirmPassword.value.length > 0,
);

onMounted(async () => {
  await userStore.fetchUser();
  editName.value = userStore.name;
  editEmail.value = userStore.email;
});

const saveProfile = async () => {
  if (!isPasswordCorrect.value) return;
  await userStore.updateProfile(editName.value, editEmail.value);
  confirmPassword.value = "";
  notify.success("수정 완료!");
};

const handleLogout = () => {
  if (notify.success("로그아웃 하시겠습니까?")) {
    localStorage.removeItem("isLoggedIn");
    router.replace("/");
  }
};
</script>

<style scoped>
.profile-page {
  background-color: var(--bg);
  color: var(--text);
  overflow: hidden; /* 페이지 자체 스크롤 방지 */
  height: 100vh;
}

.custom-card {
  background-color: var(--card-bg) !important;
  max-width: 450px;
  max-height: 95vh; /* 카드가 화면을 넘지 않게 조절 */
  overflow-y: auto; /* 내용이 넘치면 카드 안에서만 스크롤 */
}

/* 카드 내부 스크롤바 숨기기 (토스 감성) */
.custom-card::-webkit-scrollbar {
  display: none;
}

.form-control {
  background-color: rgba(150, 150, 150, 0.1) !important;
  color: var(--text-h) !important;
  font-size: 0.95rem;
}

.logout-row {
  border-color: var(--border) !important;
  transition: all 0.2s;
}

.logout-row:active {
  background-color: rgba(150, 150, 150, 0.1);
}

[data-theme="dark"] .text-h {
  color: #ffffff !important;
}
</style>
