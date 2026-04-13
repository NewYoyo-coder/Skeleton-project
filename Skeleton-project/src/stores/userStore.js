import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";

export const useUserStore = defineStore("user", () => {
  const name = ref("");
  const email = ref("");
  const password = ref(""); // 💡 JSON의 password와 매칭

  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const theme = ref(getInitialTheme());
  const isDarkMode = computed(() => theme.value === "dark");

  const setTheme = (newTheme) => {
    theme.value = newTheme;
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const fetchUser = async () => {
    try {
      const res = await axios.get("http://localhost:3000/user");
      const data = res.data;
      name.value = data.name;
      email.value = data.email;
      password.value = data.password; // 💡 오타 교정된 password 읽기
    } catch (err) {
      console.error("유저 로드 실패:", err);
    }
  };

  const setUserInfo = async (userData) => {
    try {
      const res = await axios.put("http://localhost:3000/user", userData);
      name.value = res.data.name;
      email.value = res.data.email;
      password.value = res.data.password;
      // 💡 settings가 없을 경우를 대비한 안전장치
      if (res.data.settings?.theme) {
        setTheme(res.data.settings.theme);
      }
    } catch (err) {
      console.error("유저 저장 실패:", err);
      throw err;
    }
  };

  const updateProfile = async (newName, newEmail) => {
    const userData = {
      name: newName,
      email: newEmail,
      password: password.value, // 💡 기존 비번 유지 필수!
      currency: "KRW",
      last_login: new Date().toISOString().split("T")[0],
      settings: {
        theme: theme.value, // 💡 현재 테마 설정 유지 필수!
      },
    };
    await setUserInfo(userData);
  };

  // 💡 리셋 함수 (아까 에러 났던 거 방지용)
  const reset = () => {
    name.value = "";
    email.value = "";
    password.value = "";
    setTheme("light");
  };

  return {
    name,
    email,
    password, // 💡 이거 누락됐었음! 추가 완료
    theme,
    isDarkMode,
    setUserInfo,
    setTheme,
    fetchUser,
    updateProfile,
    reset,
  };
});
