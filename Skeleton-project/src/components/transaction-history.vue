<template>
  <div class="history">
    <h1>거래내역</h1>

    <ul class="list">
      <li
        v-for="t in pagedTransactions"
        :key="t.id"
        class="item"
        @click="selected = t"
      >
        <div class="left">
          <span class="category-tag">{{ t.category }}</span>
          <div class="names" v-if="t.shop_name || t.item_name">
            <span v-if="t.shop_name">{{ t.shop_name }}</span>
            <span v-if="t.item_name"> · {{ t.item_name }}</span>
          </div>
          <div class="meta">
            <span>{{ t.date }}</span>
            <span>{{ paymentLabel[t.payment_method] }}</span>
          </div>
          <div class="memo" v-if="t.memo">{{ t.memo }}</div>
        </div>
        <div class="amount" :class="t.transaction_type">
          {{ t.transaction_type === 'income' ? '+' : '-'
          }}{{ t.amount.toLocaleString() }}원
        </div>
      </li>
    </ul>

    <div class="pagination">
      <button @click="currentPage--" :disabled="currentPage === 1">이전</button>
      <button
        v-for="p in totalPages"
        :key="p"
        @click="currentPage = p"
        :class="{ active: currentPage === p }"
      >
        {{ p }}
      </button>
      <button @click="currentPage++" :disabled="currentPage === totalPages">
        다음
      </button>
    </div>

    <TransactionDetailModal
      v-if="selected"
      :transaction="selected"
      @close="selected = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import TransactionDetailModal from './transaction-detail-modal.vue';

const transactions = ref([]);
const selected = ref(null);
const currentPage = ref(1);
const PAGE_SIZE = 10;

const paymentLabel = {
  card: '카드',
  cash: '현금',
  account: '계좌이체',
};

const totalPages = computed(() =>
  Math.ceil(transactions.value.length / PAGE_SIZE),
);

const pagedTransactions = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return transactions.value.slice(start, start + PAGE_SIZE);
});

onMounted(async () => {
  const res = await fetch('/api/transactions');
  transactions.value = await res.json();
});
</script>

<style scoped>
.history {
  padding: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}

.item:hover {
  border-color: #bbb;
  background: #fafafa;
}

.category-tag {
  display: inline-block;
  background: #f0f0f0;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 0.75rem;
  margin-bottom: 4px;
}

.names {
  font-size: 0.95rem;
  font-weight: 500;
}

.meta {
  font-size: 0.8rem;
  color: #888;
  display: flex;
  gap: 0.5rem;
  margin-top: 4px;
}

.memo {
  font-size: 0.8rem;
  color: #aaa;
  margin-top: 2px;
}

.amount {
  font-weight: 600;
  font-size: 1rem;
  white-space: nowrap;
}

.amount.income {
  color: #2196f3;
}

.amount.expense {
  color: #f44336;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.4rem;
  margin-top: 1.5rem;
}

.pagination button {
  padding: 0.4rem 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 0.9rem;
}

.pagination button:disabled {
  color: #ccc;
  cursor: default;
}

.pagination button.active {
  background: #2196f3;
  color: #fff;
  border-color: #2196f3;
}
</style>
