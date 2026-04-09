import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useDateStore = defineStore('date', () => {
  const today = new Date();
  const selectedYear = ref(today.getFullYear());
  const selectedMonth = ref(today.getMonth() + 1);

  const setDate = (year, month) => {
    selectedYear.value = parseInt(year);
    selectedMonth.value = parseInt(month);
  };

  return { selectedYear, selectedMonth, setDate };
});
