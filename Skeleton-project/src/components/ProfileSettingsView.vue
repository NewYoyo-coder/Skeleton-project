<template>
  <div
    class="profile-page min-vh-100 py-5"
    style="background-color: var(--bg-color); color: var(--text-color)"
  >
    <div class="container">
      <div
        class="card shadow-sm mx-auto"
        style="max-width: 600px; background-color: var(--card-bg)"
      >
        <div class="card-body p-4">
          <h2 class="h4 mb-4 fw-bold">프로필 & 설정</h2>

          <div class="customProfile mb-3 text-start">
            <label class="form-label small fw-bold">이름</label>
            <input
              v-model="editName"
              type="text"
              class="form-control form-control-lg"
              placeholder="이름을 입력하세요"
            />
          </div>

          <div class="customProfile mb-3 text-start">
            <label class="form-label small fw-bold">이메일</label>
            <input
              v-model="editEmail"
              type="email"
              class="form-control form-control-lg"
              placeholder="example@mail.com"
            />
          </div>
          <button
            class="btn btn-warning w-100 fw-bold py-2 text-white"
            style="background-color: #f4a261; border: none"
            @click="saveProfile"
          >
            저장하기
          </button>

          <div class="theme-section m-4" />

          <div class="theme-section mb-4 text-start">
            <p class="small fw-bold mb-2">화면 모드</p>
            <div class="btn-group w-100 theme-btn-group" role="group">
              <button
                type="button"
                class="btn btn-outline-secondary"
                :class="{ active: userStore.theme === 'light' }"
                @click="changeTheme('light')"
              >
                ☀️ 라이트
              </button>
              <button
                type="button"
                class="btn btn-outline-secondary"
                :class="{ active: userStore.theme === 'dark' }"
                @click="changeTheme('dark')"
              >
                🌙 다크
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useUserStore } from '../../src/stores/userStore';

const userStore = useUserStore();

const editName = ref(userStore.name ?? '');
const editEmail = ref(userStore.email ?? '');

watch(
  () => [userStore.name, userStore.email],
  ([newName, newEmail]) => {
    editName.value = newName;
    editEmail.value = newEmail;
  },
);

onMounted(() => {
  editName.value = userStore.name || '';
  editEmail.value = userStore.email || '';
});

const saveProfile = () => {
  if (!editName.value.trim() || !editEmail.value.trim()) {
    alert('이름과 이메일을 입력해주세요.');
    return;
  }

  userStore.updateProfile(editName.value, editEmail.value);
  alert('저장되었습니다.');
};

const changeTheme = (theme) => {
  userStore.setTheme(theme);
};
</script>

<style scoped>
/* 1. 컨테이너: 배경색이 가장 넓으므로 여기서 흐름을 잡아줌 */
.profile-page {
  transition:
    background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 2. 카드 및 내부 요소: 배경, 테두리, 그림자 일괄 트랜지션 */
.card,
.form-control,
.btn,
.form-label {
  transition:
    background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    color 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 3. 카드 디테일 */
.card {
  border: none;
  border-radius: 1rem;
}

/* 4. 입력창 포커스: 테마 전환과 별개로 부드러운 반응 */
.form-control:focus {
  border-color: #f4a261;
  box-shadow: 0 0 0 0.25rem rgba(244, 162, 97, 0.25);
}

/* 5. 버튼 쫀득한 클릭 효과 */
.btn-group .btn {
  cursor: pointer;
}

.btn-group .btn:active {
  transform: scale(0.96);
  transition: transform 0.1s ease !important; /* 클릭 반응은 빨라야 함 */
}

/* 6. 레이블 배경 (기존 요청사항 유지) */
[data-theme='dark'] .form-label {
  background-color: var(--border) !important;
  transition: background-color 0.4s ease;
}
</style>
