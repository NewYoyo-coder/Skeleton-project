import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUserStore = defineStore('user', () => {
  const name = ref('');
  const email = ref('');
  const theme = ref('light');

  const isDarkMode = computed(() => theme.value === 'dark');

  const setUserInfo = (userName, userEmail) => {
    name.value = userName;
    email.value = userEmail;
  };

  const updateProfile = (userName, userEmail) => {
    name.value = userName;
    email.value = userEmail;
  };

  const setTheme = (newTheme) => {
    theme.value = newTheme;
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return {
    name,
    email,
    theme,
    isDarkMode,
    setUserInfo,
    updateProfile,
    setTheme,
  };
});
