<template>
  <div class="history">
    <h1>거래내역</h1>

    <div class="filter">
      <input v-model="filterFrom" type="date" />
      <span>~</span>
      <input v-model="filterTo" type="date" />
      <button class="reset-btn" @click="resetFilter">초기화</button>
    </div>

    <div class="type-filter">
      <button
        v-for="type in typeOptions"
        :key="type.value"
        :class="[
          'type-btn',
          type.value,
          { active: selectedType === type.value },
        ]"
        @click="toggleType(type.value)"
      >
        {{ type.label }}
      </button>
    </div>

    <div class="category-filter">
      <button
        v-for="cat in categoryOptions"
        :key="cat"
        :class="['cat-btn', { active: selectedCategory === cat }]"
        @click="toggleCategory(cat)"
      >
        {{ cat }}
      </button>
    </div>

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

    <p v-if="filteredTransactions.length === 0" class="empty">
      해당 기간의 거래내역이 없습니다.
    </p>

    <div class="pagination" v-if="totalPages > 1">
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
import { ref, computed, watch, onMounted } from 'vue';
import TransactionDetailModal from './transaction-detail-modal.vue';

const transactions = ref([]);
const selected = ref(null);
const currentPage = ref(1);
const PAGE_SIZE = 10;

const filterFrom = ref(''); //0월0일부터
const filterTo = ref(''); //0월0일까지
const selectedType = ref('all');
const selectedCategory = ref('전체');

const paymentLabel = {
  card: '카드',
  cash: '현금',
  account: '계좌이체',
};

const typeOptions = [
  { value: 'all', label: '전체' },
  { value: 'income', label: '수입' },
  { value: 'expense', label: '지출' },
];

const categoryOptions = computed(() => {
  const base =
    selectedType.value === 'all'
      ? transactions.value
      : transactions.value.filter(
          (t) => t.transaction_type === selectedType.value,
        );
  const cats = [...new Set(base.map((t) => t.category))];
  return ['전체', ...cats];
});

const filteredTransactions = computed(() => {
  return transactions.value
    .filter((t) => {
      //날짜 필터링
      if (filterFrom.value && t.date < filterFrom.value) return false;
      if (filterTo.value && t.date > filterTo.value) return false;

      //타입 필터링
      if (
        selectedType.value !== 'all' &&
        t.transaction_type !== selectedType.value
      )
        return false;

      //카테고리 필터링
      if (
        selectedCategory.value !== '전체' &&
        t.category !== selectedCategory.value
      )
        return false;
      return true;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
});

const totalPages = computed(() =>
  Math.ceil(filteredTransactions.value.length / PAGE_SIZE),
);

const pagedTransactions = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return filteredTransactions.value.slice(start, start + PAGE_SIZE);
});

watch([filterFrom, filterTo, selectedType, selectedCategory], () => {
  currentPage.value = 1;
});

function toggleType(type) {
  selectedType.value = type;
  selectedCategory.value = '전체';
}

function toggleCategory(cat) {
  selectedCategory.value = cat;
}

function resetFilter() {
  filterFrom.value = '';
  filterTo.value = '';
  selectedType.value = 'all';
  selectedCategory.value = '전체';
}

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

.filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.type-filter {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}

.type-btn {
  flex: 1;
  padding: 0.4rem 0;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  color: #555;
}

.type-btn.active.all {
  background: #555;
  color: #fff;
  border-color: #555;
}
.type-btn.active.income {
  background: #2196f3;
  color: #fff;
  border-color: #2196f3;
}
.type-btn.active.expense {
  background: #f44336;
  color: #fff;
  border-color: #f44336;
}

.filter input {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 0.3rem 0.5rem;
  font-size: 0.9rem;
}

.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.cat-btn {
  padding: 0.25rem 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 999px;
  background: #fff;
  cursor: pointer;
  font-size: 0.85rem;
  color: #555;
}

.cat-btn:hover {
  border-color: #2196f3;
  color: #2196f3;
}

.cat-btn.active {
  background: #2196f3;
  color: #fff;
  border-color: #2196f3;
}

.reset-btn {
  padding: 0.3rem 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 0.85rem;
  color: #555;
}

.reset-btn:hover {
  background: #f5f5f5;
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

.empty {
  text-align: center;
  color: #aaa;
  margin-top: 2rem;
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
