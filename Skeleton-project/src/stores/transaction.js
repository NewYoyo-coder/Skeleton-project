import { ref } from "vue";
import { defineStore } from "pinia";
import axios from "axios";

export const useTransactionStore = defineStore("transaction", () => {
  const transactions = ref([]);

  // 로컬/배포 주소 결정 로직
  const getUrl = () =>
    window.location.hostname === "localhost"
      ? "http://localhost:3000/transactions"
      : "/transaction_db.json";

  const getSortedData = (sortBy) => {
    const data = [...transactions.value];
    return sortBy === "date"
      ? data.sort((a, b) => new Date(b.date) - new Date(a.date))
      : data.sort((a, b) => b.amount - a.amount);
  };

  // 조회
  async function fetchTransactions() {
    try {
      const res = await axios.get(getUrl());
      // 배포 환경에서 파일 전체를 가져올 경우를 대비해 배열 추출
      transactions.value = res.data.transactions || res.data;
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    }
  }

  // 추가
  async function addTransaction(newData) {
    try {
      let savedData;
      if (window.location.hostname === "localhost") {
        const res = await axios.post(getUrl(), newData);
        savedData = res.data;
      } else {
        // 배포 환경: 서버 없으므로 가짜 ID 생성 후 바로 추가
        savedData = { ...newData, id: Date.now() };
        console.log("Vercel 환경: 메모리에만 추가됨");
      }
      transactions.value.unshift(savedData);
      return savedData;
    } catch (error) {
      console.error("추가 실패:", error);
      throw error;
    }
  }

  // 수정
  async function updateTransaction(id, data) {
    try {
      let updated;
      if (window.location.hostname === "localhost") {
        const res = await axios.put(`${getUrl()}/${id}`, data);
        updated = res.data;
      } else {
        // 배포 환경: 메모리에서 즉시 수정
        updated = { ...data, id };
      }

      const idx = transactions.value.findIndex((t) => t.id === id);
      if (idx !== -1) transactions.value[idx] = updated;
      return updated;
    } catch (error) {
      console.error("수정 중 오류:", error);
    }
  }

  // 삭제
  async function deleteTransaction(id) {
    try {
      if (window.location.hostname === "localhost") {
        await axios.delete(`${getUrl()}/${id}`);
      }
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
