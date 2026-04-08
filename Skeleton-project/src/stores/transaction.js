import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useTransactionStore = defineStore('transaction', () => {
  const transactions = ref([])

  async function fetchTransactions() {
    const res = await fetch('/api/transactions')
    transactions.value = await res.json()
  }

  async function updateTransaction(id, data) {
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const updated = await res.json()
    const idx = transactions.value.findIndex((t) => t.id === id)
    if (idx !== -1) transactions.value[idx] = updated
    return updated
  }

  async function deleteTransaction(id) {
    await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
    transactions.value = transactions.value.filter((t) => t.id !== id)
  }

  return { transactions, fetchTransactions, updateTransaction, deleteTransaction }
})
