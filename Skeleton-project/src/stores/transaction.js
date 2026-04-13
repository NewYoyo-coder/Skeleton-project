import { ref } from "vue";
import { defineStore } from "pinia";
import axios from "axios";

export const useTransactionStore = defineStore("transaction", () => {
  const transactions = ref([]);
  const getSortedData = (sortBy) => {
    const data = [...transactions.value]; // 원본 보존을 위해 복사
    return sortBy === "date"
      ? data.sort((a, b) => new Date(b.date) - new Date(a.date))
      : data.sort((a, b) => b.amount - a.amount);
  };

  async function fetchTransactions() {
    try {
      const res = await axios.get("/api/transactions");
      transactions.value = res.data;
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    }
  }

  // 추가
  async function addTransaction(newData) {
    try {
      const res = await axios.post("/api/transactions", newData);
      transactions.value.unshift(res.data);
      return res.data;
    } catch (error) {
      console.error("추가 실패:", error);
      throw error;
    }
  }

  //수정
  async function updateTransaction(id, data) {
    try {
      const res = await axios.put(`/api/transactions/${id}`, data);
      const updated = res.data;

      const idx = transactions.value.findIndex((t) => t.id === id);
      if (idx !== -1) transactions.value[idx] = updated;
      return updated;
    } catch (error) {
      notify.error("수정 중 오류가 발생했습니다.");
    }
  }

  //삭제
  async function deleteTransaction(id) {
    try {
      await axios.delete(`/api/transactions/${id}`);
      transactions.value = transactions.value.filter((t) => t.id !== id);
    } catch (error) {
      console.error("삭제 실패:", error);
    }
  }

  return {
    transactions,
    getSortedData,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
});
