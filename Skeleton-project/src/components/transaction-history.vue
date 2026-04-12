<template>
  <div class="container py-4 bg-white" style="max-width: 600px">
    <!-- <h5 class="fw-bold mb-4 text-center">거래내역</h5> -->

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
    <div class="px-0 mb-3 text-center">
      <div class="t-wrapper w-100" style="height: 40px; --t-width: 33.33%">
        <div
          class="t-active-bg"
          :style="{
            transform: `translateX(${
              selectedType === TRANSACTION_TYPE.ALL
                ? '0'
                : selectedType === TRANSACTION_TYPE.INCOME
                  ? '100'
                  : '200'
            }%)`,
          }"
        ></div>
        <button
          v-for="type in typeOptions"
          :key="type.value"
          class="t-btn t-push"
          :class="{ active: selectedType === type.value }"
          @click="toggleType(type.value)"
        >
          {{ type.label }}
        </button>
      </div>
    </div>

    <!-- 카테고리 필터 -->
    <div class="d-flex flex-wrap gap-2 mb-3">
      <button
        v-for="cat in categoryOptions"
        :key="cat"
        class="t-btn t-single t-push"
        :class="{ 'active-chip': selectedCategory === cat }"
        style="
          display: inline-flex;
          flex: none !important; /* ← 이거 추가 (혼자 있을 때 꽉 차는 것 방지) */
          min-width: auto;
          height: 34px;
          padding: 0 16px;
          border-radius: 17px;
          font-size: 13px;
          transition:
            background-color 0.3s ease,
            color 0.3s ease,
            transform 0.1s ease;
        "
        @click="toggleCategory(cat)"
      >
        {{ cat }}
      </button>
    </div>

    <!-- 정렬 -->
    <div class="d-flex justify-content-end align-items-center gap-2 mb-2">
      <div class="d-flex justify-content-end align-items-center gap-2 mb-2">
        <button
          class="t-btn t-single t-push"
          style="
            height: 32px;
            padding: 0 14px;
            border-radius: 16px;
            font-size: 13px;
          "
          @click="resetFilter"
        >
          초기화
        </button>

        <button
          class="t-btn t-single t-push fw-bold"
          :class="{ 'active-chip': sortBy === 'date' }"
          style="
            height: 32px;
            padding: 0 14px;
            border-radius: 16px;
            font-size: 13px;
            min-width: 100px;
          "
          @click="
            () => {
              if (sortBy === 'date')
                sortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
              else {
                sortBy = 'date';
                sortOrder = 'desc';
              }
            }
          "
        >
          {{
            sortBy === 'date'
              ? sortOrder === 'desc'
                ? '최신순 ↓'
                : '오래된순 ↑'
              : '날짜순'
          }}
        </button>

        <button
          class="t-btn t-single t-push fw-bold"
          :class="{ 'active-chip': sortBy === 'amount' }"
          style="
            height: 32px;
            padding: 0 14px;
            border-radius: 16px;
            font-size: 13px;
            min-width: 120px;
          "
          @click="
            () => {
              if (sortBy === 'amount')
                sortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
              else {
                sortBy = 'amount';
                sortOrder = 'desc';
              }
            }
          "
        >
          {{
            sortBy === 'amount'
              ? sortOrder === 'desc'
                ? '금액높은순 ↓'
                : '금액낮은순 ↑'
              : '금액순'
          }}
        </button>
      </div>
    </div>

    <!-- 거래 목록 -->
    <TransitionGroup
      name="flip-list"
      tag="div"
      class="main-list-container d-flex flex-column gap-2"
    >
      <TransactionItem
        v-for="t in pagedTransactions"
        :key="t.id"
        :transaction="t"
        @click="selectedId = t.id"
      />
    </TransitionGroup>
    <!-- item클릭을 받음 -->

    <p
      v-if="filteredTransactions.length === 0"
      class="text-center text-muted mt-5"
    >
      해당 기간의 거래내역이 없습니다.
    </p>

    <!-- 페이지네이션 -->
    <!-- 💡 페이지 최대 개수만 보여주도록 -->
    <nav v-if="totalPages > 1" class="mt-4 d-flex justify-content-center">
      <ul class="pagination pagination-sm mb-0 custom-pagination">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button
            class="page-link border-0 rounded-circle mx-1"
            @click="currentPage--"
          >
            <i class="bi bi-chevron-left"></i>
          </button>
        </li>

        <li
          v-for="p in visiblePages"
          :key="p"
          class="page-item"
          :class="{ active: currentPage === p }"
        >
          <button
            class="page-link border-0 rounded-circle mx-1"
            @click="currentPage = p"
          >
            {{ p }}
          </button>
        </li>

        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button
            class="page-link border-0 rounded-circle mx-1"
            @click="currentPage++"
          >
            <i class="bi bi-chevron-right"></i>
          </button>
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
const sortBy = ref('date');

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
      const isDesc = sortOrder.value === 'desc';

      if (sortBy.value === 'amount') {
        // 1차: 금액 정렬
        if (a.amount !== b.amount) {
          return isDesc ? b.amount - a.amount : a.amount - b.amount;
        }
        // 2차: 금액이 같으면 무조건 최신순 (이게 진정한 동시성 고려)
        return a.date < b.date ? 1 : -1;
      }

      // 날짜 정렬 (기본)
      if (isDesc) return a.date < b.date ? 1 : -1;
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
const MAX_VISIBLE_PAGES = 8;

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
  sortBy.value = 'date';
}

onMounted(() => {
  store.fetchTransactions();
});
</script>

<style scoped>
/* 카드 터치 쫀득한 효과 */
.hover-card {
  position: relative;
  overflow: hidden;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.03) !important;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-card:active {
  background-color: #f8f9fa !important;
  transform: scale(0.97) translateY(2px);
}

/* Vue 리스트 정렬/추가/삭제 트랜지션 애니메이션 */
.main-list-container {
  position: relative;
  width: 100%;
}

.flip-list-move {
  z-index: 1;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.flip-list-enter-active {
  transition: all 0.3s ease-out;
}

.flip-list-leave-active {
  position: absolute;
  width: 100%;
  z-index: 0;
  transition: all 0.3s ease-in;
  opacity: 0;
}

.flip-list-enter-from,
.flip-list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* 페이지네이션 커스텀 스타일 */
.custom-pagination .page-link {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  color: #adb5bd; /* 비활성 색상 */
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}

.custom-pagination .page-item.active .page-link {
  background-color: #3182f6 !important; /* 토스 블루 스타일 */
  color: white !important;
  box-shadow: 0 4px 10px rgba(49, 130, 246, 0.2);
}

.custom-pagination .page-item.disabled .page-link {
  opacity: 0.3;
}

.custom-pagination .page-link:hover:not(.disabled) {
  background-color: #f1f3f5;
}
</style>
