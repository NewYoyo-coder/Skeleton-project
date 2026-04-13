<template>
  <div class="container d-flex flex-column shadow-sm dashboard-wrapper px-3">
    <div
      class="header-section p-4 bg-white z-2 border-bottom"
      :class="{ 'header-hidden': !showHeader }"
    >
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

      <div
        class="t-wrapper w-100 mb-3 shadow-sm"
        style="height: 40px; --t-width: 33.33%"
      >
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
          class="t-btn t-push fw-bold"
          :class="{ active: selectedType === TRANSACTION_TYPE.ALL }"
          @click="toggleType(TRANSACTION_TYPE.ALL)"
        >
          전체
        </button>
        <button
          class="t-btn t-push fw-bold"
          :class="{
            'active text-primary': selectedType === TRANSACTION_TYPE.INCOME,
          }"
          @click="toggleType(TRANSACTION_TYPE.INCOME)"
        >
          수입
        </button>
        <button
          class="t-btn t-push fw-bold"
          :class="{
            'active text-danger': selectedType === TRANSACTION_TYPE.EXPENSE,
          }"
          @click="toggleType(TRANSACTION_TYPE.EXPENSE)"
        >
          지출
        </button>
      </div>

      <div
        v-if="categoryOptions.length > 0"
        class="d-flex flex-nowrap overflow-auto gap-2 mb-3 pb-1"
        style="
          white-space: nowrap;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        "
      >
        <button
          v-for="cat in categoryOptions"
          :key="cat"
          class="t-btn t-single t-push flex-shrink-0 fw-bold shadow-sm"
          :class="{ 'active-chip': selectedCategory === cat }"
          style="
            height: 34px;
            padding: 0 16px;
            border-radius: 17px;
            font-size: 13px;
            min-width: fit-content;
          "
          @click="toggleCategory(cat)"
        >
          {{ cat }}
        </button>
      </div>

      <div class="d-flex align-items-center gap-2">
        <button
          class="t-btn t-push me-auto d-flex align-items-center gap-1 shadow-sm"
          :class="
            isInfinite
              ? 'active-chip text-primary border-primary'
              : 'bg-light text-muted border'
          "
          style="
            height: 36px;
            padding: 0 12px;
            border-radius: 18px;
            font-size: 12px;
            font-weight: 800;
          "
          @click="toggleInfiniteMode"
        >
          <i
            class="bi fs-5"
            :class="isInfinite ? 'bi-infinity' : 'bi-book'"
          ></i>
          {{ isInfinite ? "무한" : "페이징" }}
        </button>

        <button
          class="t-btn t-single t-push fw-bold"
          :class="{ 'active-chip': sortBy === 'amount' }"
          style="
            height: 32px;
            padding: 0 12px;
            border-radius: 16px;
            font-size: 12px;
          "
          @click="toggleSort('amount')"
        >
          {{
            sortBy === "amount"
              ? sortOrder === "desc"
                ? "금액↓"
                : "금액↑"
              : "금액순"
          }}
        </button>

        <button
          class="t-btn t-single t-push fw-bold"
          :class="{ 'active-chip': sortBy === 'date' }"
          style="
            height: 32px;
            padding: 0 12px;
            border-radius: 16px;
            font-size: 12px;
          "
          @click="toggleSort('date')"
        >
          {{
            sortBy === "date"
              ? sortOrder === "desc"
                ? "최신↓"
                : "과거↑"
              : "날짜순"
          }}
        </button>
      </div>
    </div>
    <Transition name="fade">
      <div
        v-if="isInfinite && showFloatingBadge"
        class="floating-month-badge shadow-sm"
        :class="isScrollingDown ? 'badge-top' : 'badge-bottom'"
        :style="{
          top: isScrollingDown ? (showHeader ? '190px' : '75px') : 'auto',
          '--progress': scrollProgress + '%',
        }"
      >
        <div class="progress-fill"></div>

        <span
          class="fw-bold text-primary position-relative z-1"
          style="font-size: 13px"
        >
          {{ currentViewingMonth }}
        </span>

        <button
          class="btn btn-sm p-0 border-0 position-relative z-1"
          style="color: #3182f6"
          @click="isScrollingDown ? scrollToBottom() : scrollToTop()"
        >
          <i
            class="bi fs-5"
            :class="
              isScrollingDown
                ? 'bi-arrow-down-circle-fill'
                : 'bi-arrow-up-circle-fill'
            "
          ></i>
        </button>
      </div>
    </Transition>

    <div
      v-if="isLoading"
      class="position-absolute start-50 top-50 translate-middle z-3 bg-white rounded-circle p-3 shadow"
    >
      <div class="ios-spinner"></div>
    </div>
    <div
      ref="scrollAreaRef"
      class="scroll-area flex-grow-1 px-2"
      :class="isInfinite ? 'overflow-auto' : 'overflow-hidden'"
      @scroll="handleScroll"
    >
      <Transition name="page-slide">
        <div :key="isInfinite ? 'inf' : currentPage" class="pb-5">
          <template v-for="group in groupedTransactions" :key="group.id">
            <div class="month-group mb-2" :data-month="group.label">
              <div
                v-if="group.label"
                class="month-divider-static py-1 mb-1 border-bottom"
              >
                <span class="fw-bold text-dark px-2" style="font-size: 12px">{{
                  group.label
                }}</span>
              </div>

              <div class="d-flex flex-column gap-2">
                <TransactionItem
                  v-for="item in group.items"
                  :key="item.id"
                  :transaction="item"
                  @click="selectedId = item.id"
                />
              </div>
            </div>
          </template>

          <div
            v-if="isInfinite && infiniteLimit < filteredTransactions.length"
            class="d-flex justify-content-center align-items-center py-4 opacity-50"
          >
            <div
              class="spinner-border spinner-border-sm text-primary"
              role="status"
            ></div>
            <span class="ms-2 small fw-bold">내역을 더 가져오고 있어요...</span>
            <div ref="loadMoreRef" style="height: 10px; width: 10px"></div>
          </div>

          <div
            v-if="
              (isInfinite &&
                filteredTransactions.length > 0 &&
                infiniteLimit >= filteredTransactions.length) ||
              (!isInfinite &&
                currentPage === totalPages &&
                filteredTransactions.length > 0)
            "
            class="text-center text-muted my-2 py-2"
          >
            <i class="bi bi-check-circle d-block mb-2 fs-4"></i>
            <span class="fw-bold opacity-50">
              {{
                isInfinite
                  ? "기간 내 모든 내역을 다 불러왔어요!"
                  : "해당 기간의 마지막 내역이에요!"
              }}
            </span>
          </div>

          <div
            v-if="filteredTransactions.length === 0"
            class="text-center text-muted mt-2 py-2"
          >
            <i class="bi fs-2 d-block mb-2"></i>
            해당 기간의 거래내역이 없네요...
          </div>
        </div>
      </Transition>
    </div>

    <nav
      v-if="!isInfinite && totalPages > 1"
      class="bg-white border-top py-3 d-flex justify-content-center shadow-lg z-3"
    >
      <TransitionGroup
        tag="ul"
        name="num-slide"
        class="pagination pagination-sm mb-0 custom-pagination"
      >
        <li
          class="page-item"
          :class="{ disabled: currentPage === 1 }"
          key="prev"
        >
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

        <li
          class="page-item"
          :class="{ disabled: currentPage === totalPages }"
          key="next"
        >
          <button
            class="page-link border-0 rounded-circle mx-1"
            @click="currentPage++"
          >
            <i class="bi bi-chevron-right"></i>
          </button>
        </li>
      </TransitionGroup>
    </nav>
    <TransactionDetailModal
      v-if="selected"
      v-model:show="selectedId"
      :transaction="selected"
      @close="selectedId = null"
      @update="store.fetchTransactions"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { storeToRefs } from "pinia";
import TransactionDetailModal from "./transaction-detail-modal.vue";
import TransactionItem from "./transaction-item.vue";
import { TRANSACTION_TYPE } from "../constants/transactionType";
import { CATEGORY_LABEL, CATEGORIES } from "../constants/categories";
import { useTransactionStore } from "../stores/transaction";
import { useRouter, useRoute } from "vue-router"; // 💡 추가: 라우터 임포트

const store = useTransactionStore();
const { transactions } = storeToRefs(store);

const router = useRouter(); // 💡 라우터 객체
const route = useRoute(); // 💡 현재 주소 정보

//상세 보기 & 페이지네이션 관련
const selectedId = ref(null);
const selected = computed(
  () => transactions.value.find((t) => t.id === selectedId.value) ?? null,
);
// 페이지네이션 설정
const currentPage = ref(1);
const PAGE_SIZE = 5;
const MAX_VISIBLE_PAGES = 8; // 💡 요청하신 8칸 유지

//날짜 계산 로직 추가
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");

const firstDayOfMonth = `${year}-${month}-01`;
const today = `${year}-${month}-${day}`;

// 💡 수정: 초기값을 route.query에서 먼저 찾고, 없으면 기본값 세팅
const filterFrom = ref(route.query.from || firstDayOfMonth);
const filterTo = ref(route.query.to || today);
const selectedType = ref(route.query.type || TRANSACTION_TYPE.ALL);
const selectedCategory = ref(route.query.category || "전체");
const sortBy = ref(route.query.sortBy || "date");
const sortOrder = ref(route.query.sortOrder || "desc");

// 무한스크롤 & 헤더 관련 상태
const isInfinite = ref(false);
const infiniteLimit = ref(10); // 무한스크롤 초기 개수
const showHeader = ref(true);
let lastScrollY = 0;

// 스크립트 상단 상태 변수 모음에 추가
const scrollAreaRef = ref(null);
const scrollProgress = ref(0);

const isLoading = ref(false);

// 🔄 [핵심] 무한 <-> 페이징 전환 함수
function toggleInfiniteMode() {
  isLoading.value = true;

  // 💡 전환 전, 현재 보고 있던 대략적인 위치(비율) 저장
  const scrollRatio = scrollAreaRef.value
    ? scrollAreaRef.value.scrollTop / scrollAreaRef.value.scrollHeight
    : 0;

  setTimeout(() => {
    if (isInfinite.value) {
      // 무한 -> 페이징
      const syncPage = Math.ceil(infiniteLimit.value / PAGE_SIZE);
      currentPage.value = Math.min(syncPage, totalPages.value || 1);
      isInfinite.value = false;
    } else {
      // 페이징 -> 무한
      // 💡 핵심: 현재 페이지까지의 데이터를 '포함'해서 리밋을 설정
      infiniteLimit.value = Math.max(
        infiniteLimit.value,
        currentPage.value * PAGE_SIZE,
      );
      isInfinite.value = true;
    }

    // 💡 렌더링 후 이전 위치로 스크롤 복구 (자석 효과)
    nextTick(() => {
      if (scrollAreaRef.value) {
        scrollAreaRef.value.scrollTop =
          scrollAreaRef.value.scrollHeight * scrollRatio;
      }
      isLoading.value = false;
    });
  }, 200);
}

// 스크립트 상단 상태 변수 모음에 추가
const showFloatingBadge = ref(false);
const isScrollingDown = ref(true);
const currentViewingMonth = ref("");

// 예측형 진행률 추가!!!!!!
function handleScroll(e) {
  if (!isInfinite.value) {
    if (!showHeader.value) showHeader.value = true;
    showFloatingBadge.value = false;
    return;
  }

  const currentScrollY = e.target.scrollTop;
  const scrollHeight = e.target.scrollHeight;
  const clientHeight = e.target.clientHeight;

  // 바운스 스크롤 무시
  if (currentScrollY <= 0 || currentScrollY + clientHeight >= scrollHeight - 5)
    return;

  // 1. 방향 감지
  if (Math.abs(currentScrollY - lastScrollY) > 5) {
    isScrollingDown.value = currentScrollY > lastScrollY;
  }

  // 2. 헤더 오토 하이드
  if (Math.abs(currentScrollY - lastScrollY) > 15) {
    if (currentScrollY > lastScrollY && currentScrollY > 50) {
      showHeader.value = false;
    } else if (currentScrollY < lastScrollY) {
      showHeader.value = true;
    }
    lastScrollY = currentScrollY;
  }

  // 3. 무한 스크롤 로드
  const bottom = scrollHeight - currentScrollY - clientHeight < 100;
  if (bottom && infiniteLimit.value < filteredTransactions.value.length) {
    infiniteLimit.value += 5;
  }

  // 4. 가상 배지 로직 (현재 위치 스캔)
  const monthGroups = e.target.querySelectorAll(".month-group");
  let visibleMonth = "";
  let isDividerInView = false;

  monthGroups.forEach((group) => {
    const rect = group.getBoundingClientRect();
    if (rect.top < window.innerHeight / 2 && rect.bottom > 100) {
      visibleMonth = group.getAttribute("data-month");
    }
    // 뱃지 위치(상단 200px 이내)에 실제 구분선이 있으면 뱃지 숨김
    if (rect.top > 0 && rect.top < 200) {
      isDividerInView = true;
    }
  });

  if (visibleMonth) currentViewingMonth.value = visibleMonth;
  showFloatingBadge.value = !isDividerInView && currentScrollY > 100;

  // 💡 5. [보정] 진짜 예측형 프로그레스 계산
  if (scrollHeight > clientHeight) {
    const totalCount = filteredTransactions.value.length; // 전체 데이터 (예: 100)
    if (totalCount === 0) return;

    // 현재 화면 상단에 걸린 아이템이 전체 중 대략 몇 번째인지 추정
    // 1. 현재 로드된 리스트 내에서의 스크롤 비율 (0 ~ 1)
    const scrollPercent = currentScrollY / (scrollHeight - clientHeight);

    // 2. 현재 로드된 개수(infiniteLimit) 중 어디쯤 있는지 계산
    const currentItemIndex = infiniteLimit.value * scrollPercent;

    // 3. 전체 개수 대비 최종 위치 % (이게 진짜 정직한 진행률)
    // + (clientHeight / scrollHeight)를 살짝 보정해주면 바닥 닿을 때 더 정확함
    let progress = (currentItemIndex / totalCount) * 100;

    // 4. 마지막 데이터라면 강제로 100% 찍어주기
    if (infiniteLimit.value >= totalCount && scrollPercent > 0.98) {
      progress = 100;
    }

    scrollProgress.value = Math.min(progress, 100);
  }
}

// 💡 스크립트 어딘가에 점프 함수 추가
function scrollToTop() {
  if (scrollAreaRef.value) {
    scrollAreaRef.value.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function scrollToBottom() {
  if (scrollAreaRef.value) {
    // 💡 1. 즉시 로딩 시작
    isLoading.value = true;

    if (isInfinite.value) {
      infiniteLimit.value = filteredTransactions.value.length;
    }

    // 💡 2. 데이터 렌더링 시간을 벌어줌 (0.2초)
    setTimeout(() => {
      scrollAreaRef.value.scrollTo({
        top: scrollAreaRef.value.scrollHeight,
        behavior: "smooth",
      });

      // 💡 3. 이동 시작 후 로딩 종료
      isLoading.value = false;
    }, 200);
  }
}

// 💡 교체: 필터가 바뀔 때마다 URL을 replace로 조용히 갈아끼움
watch(
  // 💡 여기에 currentPage를 추가해야 페이지 번호 클릭 시 로직이 작동합니다.
  [
    filterFrom,
    filterTo,
    selectedType,
    selectedCategory,
    sortBy,
    sortOrder,
    currentPage,
  ],
  (
    [newFrom, newTo, newType, newCat, newSortBy, newSortOrder, newPage],
    [oldFrom, oldTo, oldType, oldCat, oldSortBy, oldSortOrder, oldPage],
  ) => {
    // 1. 필터(날짜, 카테고리 등)가 바뀌었을 때만 페이지를 1로 리셋
    // 💡 페이지 번호만 바꾼 건데 1로 돌아가면 안 되니까 '이전 값'과 비교 로직 추가
    const isFilterChanged =
      newFrom !== oldFrom ||
      newTo !== oldTo ||
      newType !== oldType ||
      newCat !== oldCat ||
      newSortBy !== oldSortBy ||
      newSortOrder !== oldSortOrder;

    if (isFilterChanged) {
      currentPage.value = 1;
      infiniteLimit.value = 10;
      showHeader.value = true;
      lastScrollY = 0;
    }

    // 2. URL 파라미터 업데이트 (currentPage 포함)
    router.replace({
      query: {
        from: newFrom,
        to: newTo,
        type: newType,
        category: newCat,
        sortBy: newSortBy,
        sortOrder: newSortOrder,
        page: newPage, // 💡 주소창에도 현재 페이지 반영
      },
    });

    // 3. 🚨 [핵심] 페이지 번호든 필터든 바뀌면 즉시 스크롤 상단 고정
    // 💡 0.1초만 늦어도 슬라이드 애니메이션 꼬이니까 즉시 실행
    if (scrollAreaRef.value) {
      scrollAreaRef.value.scrollTop = 0;
    }
  },
);
const typeOptions = [
  { value: TRANSACTION_TYPE.ALL, label: "전체" },
  { value: TRANSACTION_TYPE.INCOME, label: "수입" },
  { value: TRANSACTION_TYPE.EXPENSE, label: "지출" },
];

// 💡수정
// 상수사용
function typeButtonClass(value) {
  if (selectedType.value !== value) return "btn-outline-secondary";
  if (value === TRANSACTION_TYPE.INCOME) return "btn-primary";
  if (value === TRANSACTION_TYPE.EXPENSE) return "btn-danger";
  return "btn-dark";
}

// 💡 💡 💡 categories.js 사용
const categoryOptions = computed(() => {
  // 1. 전체 타입일 때는 카테고리 칩을 숨기거나 비움
  if (selectedType.value === TRANSACTION_TYPE.ALL) return [];

  // 2. 현재 필터링된 데이터(날짜/타입 기준)에서 실제로 존재하는 카테고리들만 수집
  const availableCategoriesInData = new Set(
    transactions.value
      .filter(
        (t) =>
          t.transaction_type === selectedType.value &&
          (!filterFrom.value || t.date >= filterFrom.value) &&
          (!filterTo.value || t.date <= filterTo.value),
      )
      .map((t) => t.category), // DB에 저장된 '음식', '월급' 등 한글값
  );

  // 3. 상수에 정의된 순서대로, 데이터가 존재하는 카테고리만 한글 라벨로 추출
  const filteredLabels = CATEGORIES[selectedType.value]
    .map((key) => CATEGORY_LABEL[key])
    .filter((label) => {
      // 💡 핵심: DB 카테고리('기타 지출') 중에 현재 라벨('기타')을 포함하는 것이 하나라도 있는지 검사
      return Array.from(availableCategoriesInData).some((dbCategory) =>
        dbCategory.includes(label),
      );
    });

  return ["전체", ...filteredLabels];
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

      // 🚀 카테고리 필터링 (기타 예외 처리 완벽 적용)
      if (selectedCategory.value !== "전체") {
        if (selectedCategory.value === "기타") {
          // '기타' 칩을 누르면 DB의 '기타 수입', '기타 지출' 모두 허용
          if (!t.category.includes("기타")) return false;
        } else {
          // 나머지는 글자가 100% 똑같아야 허용
          if (t.category !== selectedCategory.value) return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      const isDesc = sortOrder.value === "desc";

      if (sortBy.value === "amount") {
        // 1차: 금액 정렬
        if (a.amount !== b.amount) {
          return isDesc ? b.amount - a.amount : a.amount - b.amount;
        }
        // 2차: 금액이 같으면 무조건 최신순
        return a.date < b.date ? 1 : -1;
      }

      // 날짜 정렬 (기본)
      if (isDesc) return a.date < b.date ? 1 : -1;
      return a.date > b.date ? 1 : -1;
    });
});

// 페이지네이션 부분
const totalPages = computed(() => {
  const count = filteredTransactions.value.length;
  if (count === 0) return 1;

  const basePages = Math.ceil(count / PAGE_SIZE);
  // 데이터 개수가 딱 페이지 사이즈의 배수라면, 안내 문구를 보여줄 빈 페이지 하나를 추가
  return count % PAGE_SIZE === 0 ? basePages + 1 : basePages;
});

const pagedTransactions = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return filteredTransactions.value.slice(start, start + PAGE_SIZE);
});

// 🗓️ [업그레이드] 월 구분선 포함 리스트 데이터
// 🗓️ [버그 수정] Sticky가 서로 밀어내도록 월별 그룹화 로직으로 변경
const groupedTransactions = computed(() => {
  const source = isInfinite.value
    ? filteredTransactions.value.slice(0, infiniteLimit.value)
    : pagedTransactions.value;

  // 정렬이 날짜순이 아니면 구분선 없이 통째로 묶음
  if (sortBy.value !== "date") {
    return [{ id: "all", label: "", items: source }];
  }

  const groups = [];
  let currentMonth = "";
  let currentGroup = null;

  source.forEach((t) => {
    const tMonth = t.date.substring(0, 7); // YYYY-MM
    if (tMonth !== currentMonth) {
      currentGroup = {
        id: tMonth,
        label: tMonth.replace("-", "년 ") + "월",
        items: [],
      };
      groups.push(currentGroup);
      currentMonth = tMonth;
    }
    currentGroup.items.push(t);
  });
  return groups;
});

// 🔢 [복구] 페이지 번호 8칸 계산 로직
const visiblePages = computed(() => {
  const total = totalPages.value;
  if (total <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  let start = Math.max(
    1,
    currentPage.value - Math.floor(MAX_VISIBLE_PAGES / 2),
  );
  let end = start + MAX_VISIBLE_PAGES - 1;

  if (end > total) {
    end = total;
    start = Math.max(1, end - MAX_VISIBLE_PAGES + 1);
  }

  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

watch([filterFrom, filterTo, selectedType, selectedCategory], () => {
  currentPage.value = 1;
});

function toggleType(type) {
  selectedType.value = type;
  selectedCategory.value = "전체";
}

function toggleCategory(cat) {
  selectedCategory.value = cat;
}

function toggleSort(target) {
  if (sortBy.value === target) {
    sortOrder.value = sortOrder.value === "desc" ? "asc" : "desc";
  } else {
    sortBy.value = target;
    sortOrder.value = "desc";
  }
}

function resetFilter() {
  // 초기화 버튼을 눌렀을 때 다시 '이번 달 1일'과 '오늘'로 설정
  filterFrom.value = firstDayOfMonth;
  filterTo.value = today;

  // 나머지 필터들도 초기값으로 변경
  selectedType.value = TRANSACTION_TYPE.ALL;
  selectedCategory.value = "전체";
  sortOrder.value = "desc";
  sortBy.value = "date";
}

const loadMoreRef = ref(null);
onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      // 💡 말뚝이 화면에 들어왔고, 로딩 중이 아닐 때만 실행
      if (entries[0].isIntersecting && !isLoading.value) {
        if (infiniteLimit.value < filteredTransactions.value.length) {
          isLoading.value = true;

          // 💡 쌀먹 포인트: 한 번에 20개씩 팍팍 붙여서 연산 횟수 줄이기
          infiniteLimit.value += 20;

          // 브라우저가 렌더링할 시간을 준 뒤 로딩 해제
          nextTick(() => {
            isLoading.value = false;
          });
        }
      }
    },
    { threshold: 0.1 },
  ); // 말뚝이 10%만 보여도 즉시 실행

  if (loadMoreRef.value) observer.observe(loadMoreRef.value);
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

/* 하단 번호표 클릭 시 파란 테두리(아웃라인) 강제 제거 */
.custom-pagination .page-link:focus {
  outline: none !important;
  box-shadow: none !important;
  background-color: transparent; /* 클릭 순간 배경색 튀는 거 방지 */
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

/* 💡 디바이드가 중간에 끼어들 때 툭툭 끊기지 않게 보정 */
.month-group {
  display: block;
  overflow: visible;
  position: relative;
}

.month-divider {
  /* 헤더가 margin-top으로 사라지는 속도와 이 top 이동 속도를 일치시킵니다 */
  transition: top 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 💡 헤더 섹션 투명 블러 적용 */
.header-section {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  margin: 3px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition:
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s ease;
  transform: translateY(0);
  opacity: 1;
}

/* 💡 헤더가 숨겨질 때 더 부드럽게 사라지도록 보정 */
.header-hidden {
  transform: translateY(-100%);
  margin-top: -180px; /* 필터 높이에 맞춰 조정 */
  opacity: 0;
  pointer-events: none;
}

/* 💡 중복 선언 제거 및 !important 삭제 (페이징 스크롤 잠금 정상화) */
.scroll-area {
  flex: 1;
  position: relative;
  z-index: 1;
  -webkit-overflow-scrolling: touch;
}
.scroll-area::-webkit-scrollbar {
  display: none;
}
.scroll-area::-webkit-scrollbar {
  display: none;
}

/* 카테고리 칩 등장 트랜지션 (툭툭 끊김 방지) */
.chip-list-enter-active,
.chip-list-leave-active {
  transition: all 0.3s ease;
}
.chip-list-enter-from,
.chip-list-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.9);
}

/* 통째로 바뀌는 페이지 페이드 트랜지션 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 글로벌 헤더(약 60px) + 하단 네비바(약 70px) = 130px 제외 */
.dashboard-wrapper {
  height: calc(100vh - 130px);
  overflow: hidden;
  position: relative;
}

/* 🚀 가상 플로팅 배지 (프로그래스 + 퀵버튼 탑재) */
.floating-month-badge {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);

  /* 유리 효과 유지 */
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(15px) saturate(180%);
  -webkit-backdrop-filter: blur(15px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow:
    0 8px 32px 0 rgba(31, 38, 135, 0.05),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1);

  z-index: 1240;
  transition:
    top 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    bottom 0.3s ease,
    opacity 0.2s;

  /* 💡 수정: 클릭 가능하게 풀고 내부 요소 양옆 정렬 */
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: calc(100% - 80px);
  max-width: 240px; /* 버튼이 들어갈 공간 확보 */
  padding: 6px 16px;
  overflow: hidden; /* 배경 파도가 둥근 테두리를 안 넘치게 */
}

/* 🌊 프로그래스 파도 (CSS 변수로 width 조절) */
.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: var(--progress);
  background: rgba(49, 130, 246, 0.15); /* 토스 블루 아주 연하게 */
  transition: width 0.1s ease-out;
  z-index: 0;
  border-radius: 20px;
}

/* 아래로 스크롤할 때 (헤더 근처에 붙음) */
.badge-top {
  /* top 값은 인라인 스타일로 동적 주입됨 */
  bottom: auto;
}

/* 위로 스크롤할 때 (하단 네비바 근처에 붙음) */
.badge-bottom {
  top: auto !important; /* 인라인 top 무시 */
  bottom: 40px; /* 하단에서 살짝 띄움 */
}

/* 🚀 페이지 전환 슬라이드 애니메이션 */
.page-slide-enter-active {
  /* 💡 들어오는 놈은 absolute 주지 마세요! 그래야 제자리를 잡습니다 */
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-slide-leave-active {
  /* 💡 나가는 놈만 absolute로 빼서 공간을 비워줘야 합니다 */
  position: absolute;
  width: 100%;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-slide-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.page-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* 🚀 페이지 번호 숫자 전용 트랜지션 */
.num-slide-move {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.num-slide-enter-active,
.num-slide-leave-active {
  transition: all 0.3s ease;
}

.num-slide-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.num-slide-leave-to {
  opacity: 0;
  transform: translateX(-50px);
  position: absolute; /* 💡 나가는 숫자가 자리를 비워줘야 번호가 안 꼬임 */
}
/* 🍏 iOS 스타일 미니멀 스피너 */
.ios-spinner {
  width: 48px;
  height: 48px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: #3182f6; /* 토스 블루 */
  border-radius: 50%;
  animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 로딩 중일 때 리스트가 튀어 오르지 않게 고정 */
.fade-enter-active {
  transition: opacity 0.3s ease-out;
}

/* 거래내역 아이템 내부의 텍스트 한 줄 처리 */
.text-muted {
  white-space: nowrap; /* 💡 줄바꿈 절대 금지 */
  text-overflow: ellipsis; /* 💡 넘치면 '...' 표시 */
  max-width: 100%; /* 💡 부모 너비를 넘지 않도록 제한 */
}
</style>
