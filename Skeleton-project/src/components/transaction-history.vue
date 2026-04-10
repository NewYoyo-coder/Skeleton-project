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
        {{ cat }}
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
    <!-- 💡 페이지 최대 10개만 보여주도록 -->
    <nav v-if="totalPages > 1" class="mt-4 d-flex justify-content-center">
      <ul class="pagination pagination-sm mb-0">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link" @click="currentPage--">이전</button>
        </li>
        <!-- visiblePages로 10개만 보이도록 -->
        <li
          v-for="p in visiblePages"
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

import TransactionDetailModal from './transaction-detail-modal.vue';
import TransactionItem from './transaction-item.vue';

import { TRANSACTION_TYPE } from '../constants/transactionType';
import { CATEGORY_LABEL, CATEGORIES } from '../constants/categories';
import { useTransactionStore } from '../stores/transaction';

const store = useTransactionStore();
const { transactions } = storeToRefs(store);

//상세 보기 & 페이지네이션 관련
const selectedId = ref(null);
const selected = computed(
  () => transactions.value.find((t) => t.id === selectedId.value) ?? null,
);
const currentPage = ref(1);
const PAGE_SIZE = 5; //한번에 보여줄 아이템 수

//날짜 계산 로직 추가
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const day = String(now.getDate()).padStart(2, '0');

const firstDayOfMonth = `${year}-${month}-01`;
const today = `${year}-${month}-${day}`;

//날짜 초기값 수정
const filterFrom = ref(firstDayOfMonth); // '' 에서 수정
const filterTo = ref(today); // '' 에서 수정
const selectedType = ref(TRANSACTION_TYPE.ALL);
const selectedCategory = ref('전체');
const sortOrder = ref('desc');

const typeOptions = [
  { value: TRANSACTION_TYPE.ALL, label: '전체' },
  { value: TRANSACTION_TYPE.INCOME, label: '수입' },
  { value: TRANSACTION_TYPE.EXPENSE, label: '지출' },
];

// 💡수정
// 상수사용
function typeButtonClass(value) {
  if (selectedType.value !== value) return 'btn-outline-secondary';
  if (value === TRANSACTION_TYPE.INCOME) return 'btn-primary';
  if (value === TRANSACTION_TYPE.EXPENSE) return 'btn-danger';
  return 'btn-dark';
}

// 💡 수정
// 💡 💡 💡 categories.js 사용
const categoryOptions = computed(() => {
  // 1. 타입이 '전체'일 때는 카테고리 버튼 영역을 완전히 숨김
  if (selectedType.value === TRANSACTION_TYPE.ALL) {
    return [];
  }

  // 2. 현재 탭(수입/지출)에 맞는 영어 키 배열 가져오기
  // 예: ['food', 'cafe', ...]
  const keys = CATEGORIES[selectedType.value];

  // 3. 영어 키를 한글 라벨로 변환 (.map 활용)
  // 예: ['식비', '카페', ...]
  const koreanLabels = keys.map((key) => CATEGORY_LABEL[key]);

  // 4. 맨 앞에 '전체' 버튼을 붙여서 반환
  return ['전체', ...koreanLabels];
});

//💡 수정
// 필터링 및 정렬
const filteredTransactions = computed(() => {
  return transactions.value
    .filter((t) => {
      if (filterFrom.value && t.date < filterFrom.value) return false;
      if (filterTo.value && t.date > filterTo.value) return false;

      // 타입 필터링 (영문 값으로 비교됨)
      if (
        selectedType.value !== TRANSACTION_TYPE.ALL &&
        t.transaction_type !== selectedType.value
      )
        return false;

      // 카테고리 필터링 (DB에 있는 한글문자열 꺼내와서 그대로 비교)
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

// 페이지네이션 부분
const totalPages = computed(() =>
  Math.ceil(filteredTransactions.value.length / PAGE_SIZE),
);

const pagedTransactions = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return filteredTransactions.value.slice(start, start + PAGE_SIZE);
});

//💡 보여줄 페이지 번호 계산
const MAX_VISIBLE_PAGES = 10;

const visiblePages = computed(() => {
  //현재 페이지를 중심으로 표시할 시작 페이지 계산
  let startPage = Math.max(
    1,
    currentPage.value - Math.floor(MAX_VISIBLE_PAGES / 2),
  );
  let endPage = startPage + MAX_VISIBLE_PAGES - 1;

  //끝 페이지가 전체 페이지 수를 넘어가면 조정
  if (endPage > totalPages.value) {
    endPage = totalPages.value;
    startPage = Math.max(1, endPage - MAX_VISIBLE_PAGES + 1);
  }

  //시작부터 끝 페이지까지의 배열 생성
  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return pages;
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
  // 초기화 버튼을 눌렀을 때 다시 '이번 달 1일'과 '오늘'로 설정
  filterFrom.value = firstDayOfMonth;
  filterTo.value = today;

  // 나머지 필터들도 초기값으로 변경
  selectedType.value = TRANSACTION_TYPE.ALL;
  selectedCategory.value = '전체';
  sortOrder.value = 'desc';
}

onMounted(() => {
  store.fetchTransactions();
});
</script>
