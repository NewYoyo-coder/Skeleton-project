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
      const backup = localStorage.getItem("user_backup");
      const localTheme = localStorage.getItem("theme"); // 👈 사용자가 바꾼 테마 확인

      if (window.location.hostname !== "localhost" && backup) {
        const data = JSON.parse(backup);
        name.value = data.name;
        email.value = data.email;
        password.value = data.password;

        // [수정] 파일의 테마보다 로컬 스토리지 테마를 우선시
        const finalTheme = localTheme || data.settings?.theme || "light";
        setTheme(finalTheme);
        return;
      }

      const res = await fetch(
        window.location.hostname === "localhost"
          ? "http://localhost:3000/user"
          : "/info_db.json",
      );
      const data = await res.json();
      const userData = data.user || data;

      name.value = userData.name;
      email.value = userData.email;
      password.value = userData.password;

      // [수정] 초기 로드 시에도 로컬에 저장된 테마가 있다면 그걸 사용
      const finalTheme = localTheme || userData.settings?.theme || "light";
      setTheme(finalTheme);
    } catch (err) {
      console.error("유저 로드 실패:", err);
    }
  };
  const setUserInfo = async (userData) => {
    try {
      let updatedData;

      if (window.location.hostname === "localhost") {
        // 1. 로컬 환경: 실제 서버(json-server)에 저장
        const res = await axios.put("http://localhost:3000/user", userData);
        updatedData = res.data;
      } else {
        // 2. 배포 환경: 서버가 없으므로 로컬 스토리지에 임시 저장 및 성공한 척
        console.log(
          "Vercel 환경: db.json 수정 대신 LocalStorage를 사용합니다.",
        );
        localStorage.setItem("user_backup", JSON.stringify(userData));
        updatedData = userData; // 넘겨받은 데이터를 그대로 화면에 반영
      }

      // 공통: 화면 UI 업데이트
      name.value = updatedData.name;
      email.value = updatedData.email;
      password.value = updatedData.password;

      if (updatedData.settings?.theme) {
        setTheme(updatedData.settings.theme);
      }

      return updatedData;
    } catch (err) {
      console.error("유저 정보 업데이트 실패:", err);
      // 배포 환경에서 405 에러 등으로 터지는 걸 방지하기 위해 로컬이 아닐 땐 에러 무시 가능
      if (window.location.hostname === "localhost") throw err;
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
