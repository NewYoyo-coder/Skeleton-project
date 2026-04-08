<template>
  <div class="container py-4" style="max-width: 600px">
    <h5 class="fw-bold mb-4 text-center">거래내역</h5>

    <!-- 날짜 필터 -->
    <div class="d-flex align-items-center gap-2 mb-3">
      <input
        v-model="filterFrom"
        type="date"
        class="form-control form-control-sm flex-fill"
      />
      <span class="text-muted">~</span>
      <input
        v-model="filterTo"
        type="date"
        class="form-control form-control-sm flex-fill"
      />
    </div>

    <!-- 타입 필터 -->
    <div class="d-flex gap-2 mb-3">
      <button
        v-for="type in typeOptions"
        :key="type.value"
        :class="['btn btn-sm', typeButtonClass(type.value)]"
        style="flex: 1 1 0%"
        @click="toggleType(type.value)"
      >
        {{ type.label }}
      </button>
    </div>

    <!-- 카테고리 필터 -->
    <div class="d-flex flex-wrap gap-1 mb-3">
      <button
        v-for="cat in categoryOptions"
        :key="cat"
        :class="[
          'btn btn-sm rounded-pill px-3',
          selectedCategory === cat ? 'btn-dark' : 'btn-outline-secondary',
        ]"
        @click="toggleCategory(cat)"
      >
        {{ cat === '전체' ? '전체' : (CATEGORY_LABEL[cat] ?? cat) }}
      </button>
    </div>

    <!-- 정렬 -->
    <div class="d-flex justify-content-end align-items-center gap-2 mb-2">
      <button class="btn btn-sm btn-light border" @click="resetFilter">
        초기화
      </button>
      <div class="dropdown">
        <button
          class="btn btn-sm btn-light border dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
        >
          {{ sortOrder === 'desc' ? '최신순' : '오래된순' }}
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li>
            <button
              class="dropdown-item"
              :class="{ active: sortOrder === 'desc' }"
              @click="sortOrder = 'desc'"
            >
              최신순
            </button>
          </li>
          <li>
            <button
              class="dropdown-item"
              :class="{ active: sortOrder === 'asc' }"
              @click="sortOrder = 'asc'"
            >
              오래된순
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- 거래 목록 -->
    <div class="d-flex flex-column gap-2">
      <TransactionItem
        v-for="t in pagedTransactions"
        :key="t.id"
        :transaction="t"
        @click="selectedId = t.id"
      />
    </div>
    <!-- item클릭을 받음 -->

    <p
      v-if="filteredTransactions.length === 0"
      class="text-center text-muted mt-5"
    >
      해당 기간의 거래내역이 없습니다.
    </p>

    <!-- 페이지네이션 -->
    <nav v-if="totalPages > 1" class="mt-4 d-flex justify-content-center">
      <ul class="pagination pagination-sm mb-0">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link" @click="currentPage--">이전</button>
        </li>
        <li
          v-for="p in totalPages"
          :key="p"
          class="page-item"
          :class="{ active: currentPage === p }"
        >
          <button class="page-link" @click="currentPage = p">{{ p }}</button>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button class="page-link" @click="currentPage++">다음</button>
        </li>
      </ul>
    </nav>

    <TransactionDetailModal
      v-if="selected"
      :transaction="selected"
      @close="selectedId = null"
    />
    <!-- close 부분! 모달 사라짐 -->
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { TRANSACTION_TYPE } from '../constants/transactionType';
import { CATEGORY_LABEL } from '../constants/categories';
import { useTransactionStore } from '../stores/transaction';
import TransactionDetailModal from './transaction-detail-modal.vue';
import TransactionItem from './transaction-item.vue';

const store = useTransactionStore();
const { transactions } = storeToRefs(store);
const selectedId = ref(null);
const selected = computed(
  () => transactions.value.find((t) => t.id === selectedId.value) ?? null,
);
const currentPage = ref(1);
const PAGE_SIZE = 10;

const filterFrom = ref('');
const filterTo = ref('');
const selectedType = ref(TRANSACTION_TYPE.ALL);
const selectedCategory = ref('전체');
const sortOrder = ref('desc');

const typeOptions = [
  { value: TRANSACTION_TYPE.ALL, label: '전체' },
  { value: TRANSACTION_TYPE.INCOME, label: '수입' },
  { value: TRANSACTION_TYPE.EXPENSE, label: '지출' },
];

function typeButtonClass(value) {
  if (selectedType.value !== value) return 'btn-outline-secondary';
  if (value === TRANSACTION_TYPE.INCOME) return 'btn-primary';
  if (value === TRANSACTION_TYPE.EXPENSE) return 'btn-danger';
  return 'btn-dark';
}

const categoryOptions = computed(() => {
  const base =
    selectedType.value === TRANSACTION_TYPE.ALL
      ? transactions.value
      : transactions.value.filter(
          (t) => t.transaction_type === selectedType.value,
        );
  const cats = [...new Set(base.map((t) => t.category))];
  return ['전체', ...cats];
});

//필터링 및 정렬
const filteredTransactions = computed(() => {
  return transactions.value
    .filter((t) => {
      if (filterFrom.value && t.date < filterFrom.value) return false;
      if (filterTo.value && t.date > filterTo.value) return false;
      if (
        selectedType.value !== 'all' &&
        t.transaction_type !== selectedType.value
      )
        return false;
      if (
        selectedCategory.value !== '전체' &&
        t.category !== selectedCategory.value
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      if (sortOrder.value === 'desc') return a.date < b.date ? 1 : -1;
      return a.date > b.date ? 1 : -1;
    });
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
  selectedType.value = TRANSACTION_TYPE.ALL;
  selectedCategory.value = '전체';
}

onMounted(() => {
  store.fetchTransactions();
});
</script>
