import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

export const useUserStore = defineStore('user', () => {
  const name = ref('');
  const email = ref(''); // email 대신 id로 통일
  const theme = ref('light');
  const autoLogin = ref(true);
  const isDarkMode = computed(() => theme.value === 'dark');

  // DB에서 정보 가져오기
  const fetchUser = async () => {
    try {
      const res = await axios.get('http://localhost:3000/user');
      const data = res.data;
      name.value = data.name;
      email.value = data.email;
      theme.value = data.settings?.theme || 'light';
      autoLogin.value = data.settings?.auto_login ?? true;
      setTheme(theme.value);
    } catch (err) {
      console.error('유저 로드 실패:', err);
    }
  };

  // DB에 덮어쓰기 (PUT)
  const setUserInfo = async (userData) => {
    try {
      const res = await axios.put('http://localhost:3000/user', userData);
      name.value = res.data.name;
      email.value = res.data.email;
      theme.value = res.data.settings.theme;
      autoLogin.value = res.data.settings.auto_login;
    } catch (err) {
      console.error('유저 저장 실패:', err);
      throw err;
    }
  };

  // userStore.js 내부의 updateProfile 예시
  const updateProfile = async (newName, newEmail) => {
    const userData = {
      name: newName,
      email: newEmail,
      currency: 'KRW', // 기본값 혹은 기존값
      last_login: new Date().toISOString().split('T')[0],
      settings: {
        theme: theme.value, // 현재 스토어의 theme ref
        auto_login: autoLogin.value,
      },
    };
    // 기존에 만든 setUserInfo(userData)를 호출하여 서버에 PUT
    await setUserInfo(userData);
  };

  const setTheme = (newTheme) => {
    theme.value = newTheme;
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return {
    name, email, theme, autoLogin,
    isDarkMode, setUserInfo, setTheme, fetchUser, updateProfile
  };
});