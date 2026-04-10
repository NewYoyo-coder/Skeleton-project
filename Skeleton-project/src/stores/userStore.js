import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

export const useUserStore = defineStore('user', () => {
  const name = ref('');
  const email = ref('');
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

  const setTheme = (newTheme) => {
    theme.value = newTheme;
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return {
    name, email, theme, autoLogin,
    isDarkMode, setUserInfo, setTheme, fetchUser
  };
});