<template>
  <div class="profile-page">
    <TopNav />

    <div class="profile-card">
      <h2>프로필 & 설정</h2>

      <div class="form-group">
        <label>이름</label>
        <input v-model="editName" type="text" />
      </div>

      <div class="form-group">
        <label>이메일</label>
        <input v-model="editEmail" type="email" />
      </div>

      <div class="theme-section">
        <p>화면 모드</p>
        <div class="theme-buttons">
          <button @click="changeTheme('light')">라이트모드</button>
          <button @click="changeTheme('dark')">다크모드</button>
        </div>
      </div>

      <button class="save-btn" @click="saveProfile">저장</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import TopNav from "../components/TopNav.vue";
import { useUserStore } from "../../src/stores/userStore";

const userStore = useUserStore();

const editName = ref(userStore.name);
const editEmail = ref(userStore.email);

const saveProfile = () => {
  if (!editName.value.trim() || !editEmail.value.trim()) {
    notify.error("이름과 이메일을 입력해주세요.");
    return;
  }

  userStore.updateProfile(editName.value, editEmail.value);
  notify.success("저장되었습니다.");
};

const changeTheme = (theme) => {
  userStore.setTheme(theme);
};
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: var(--bg-color);
  color: var(--text-color);
}

.profile-card {
  width: 420px;
  margin: 40px auto;
  padding: 24px;
  border-radius: 16px;
  background: var(--card-bg);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #cccccc;
}

.theme-section {
  margin: 20px 0;
}

.theme-buttons {
  display: flex;
  gap: 10px;
}

.theme-buttons button,
.save-btn {
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.save-btn {
  margin-top: 10px;
  background: #f4a261;
  color: white;
}
</style>
