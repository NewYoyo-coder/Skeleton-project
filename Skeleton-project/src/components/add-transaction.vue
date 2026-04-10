<template>
  <div class="transaction-wrapper bg-light min-vh-100 py-4">
    <div class="container-600 mx-auto px-3">
      <div
        class="t-wrapper w-100 mb-4 shadow-sm"
        style="height: 44px; --t-width: 50%"
      >
        <div
          class="t-active-bg"
          :style="{
            transform: `translateX(${currentType === 'income' ? '0' : '100'}%)`,
          }"
        ></div>

        <button
          class="t-btn t-push"
          :class="{ 'active-income': currentType === 'income' }"
          @click="currentType = 'income'"
        >
          수입
        </button>
        <button
          class="t-btn t-push"
          :class="{ 'active-expense': currentType === 'expense' }"
          @click="currentType = 'expense'"
        >
          지출
        </button>
      </div>
      <h5 class="fw-bold text-center mb-4">
        {{ currentType === 'expense' ? '지출' : '수입' }} 추가
      </h5>

      <div class="d-flex flex-column gap-3 mb-4">
        <div class="row g-2">
          <div class="col-5">
            <div class="form-card p-3 shadow-sm rounded-4 bg-white h-100">
              <label class="small fw-bold text-secondary mb-2 d-block"
                >날짜</label
              >
              <input
                type="date"
                v-model="selectedDate"
                class="border-0 w-100 outline-none small-date"
                required
              />
            </div>
          </div>
          <div class="col-7">
            <div class="form-card p-3 shadow-sm rounded-4 bg-white h-100">
              <label class="small fw-bold text-secondary mb-2 d-block"
                >수단</label
              >
              <div
                class="t-wrapper w-100 mt-1"
                style="height: 36px; --t-width: 33.33%"
              >
                <div
                  class="t-active-bg"
                  :style="{
                    transform: `translateX(${paymentMethod === 'cash' ? '0' : paymentMethod === 'account' ? '100' : '200'}%)`,
                  }"
                ></div>

                <button
                  class="t-btn t-push"
                  style="font-size: 13px"
                  :class="{ active: paymentMethod === 'cash' }"
                  @click="paymentMethod = 'cash'"
                >
                  현금
                </button>
                <button
                  class="t-btn t-push"
                  style="font-size: 13px"
                  :class="{ active: paymentMethod === 'account' }"
                  @click="paymentMethod = 'account'"
                >
                  계좌
                </button>
                <button
                  class="t-btn t-push"
                  style="font-size: 13px"
                  :class="{ active: paymentMethod === 'card' }"
                  @click="paymentMethod = 'card'"
                >
                  카드
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="form-card p-3 shadow-sm rounded-4 bg-white">
          <label class="small fw-bold text-secondary mb-2 d-block">금액</label>
          <div
            class="d-flex align-items-center justify-content-end position-relative"
          >
            <input
              v-model="displayAmount"
              type="text"
              placeholder="0"
              class="border-0 text-end fw-bold w-100 amount-display px-4"
              :class="currentType === 'income' ? 'text-primary' : 'text-danger'"
              @input="handleAmountInput"
            />
            <span class="position-absolute end-0 fw-bold">원</span>
          </div>
        </div>

        <div class="form-card p-3 shadow-sm rounded-4 bg-white">
          <label class="small fw-bold text-secondary mb-2 d-block"
            >카테고리</label
          >
          <select
            v-model="category"
            class="form-select border-0 bg-transparent px-0"
          >
            <option disabled value="">카테고리를 선택하세요</option>
            <option v-for="cat in categories" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
        </div>

        <transition name="fade">
          <div
            v-if="currentType === 'expense'"
            class="form-card p-3 shadow-sm rounded-4 bg-white border-dashed"
          >
            <div class="row g-3">
              <div class="col-6 border-end">
                <label class="small fw-bold text-secondary d-block"
                  >가게 이름</label
                >
                <input
                  v-model="shopName"
                  type="text"
                  placeholder="가게명"
                  class="border-0 w-100 small py-1"
                />
              </div>
              <div class="col-6">
                <label class="small fw-bold text-secondary d-block"
                  >상품명</label
                >
                <input
                  v-model="itemName"
                  type="text"
                  placeholder="상품명"
                  class="border-0 w-100 small py-1"
                />
              </div>
            </div>
          </div>
        </transition>

        <div class="form-card p-3 shadow-sm rounded-4 bg-white">
          <label class="small fw-bold text-secondary mb-2 d-block">메모</label>
          <input
            v-model="memo"
            type="text"
            placeholder="메모를 입력하세요"
            class="border-0 w-100 small"
          />
        </div>
      </div>

      <div class="row g-2 mt-2">
        <div class="col-8">
          <button
            @click="handleSave"
            class="t-btn t-push w-100 py-3 rounded-4 fw-bold"
            :style="{
              background:
                currentType === 'income' ? 'var(--t-blue)' : '#f04452',
              color: '#fff',
            }"
          >
            추가하기
          </button>
        </div>
        <div class="col-4">
          <button
            @click="handleCancel"
            class="t-btn t-single t-push w-100 py-3 rounded-4 fw-bold"
            style="color: var(--t-sub)"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useTransactionStore } from '@/stores/transaction'; // 1. 스토어 임포트

const router = useRouter();
const transactionStore = useTransactionStore(); // 2. 스토어 인스턴스 생성
const currentType = ref('expense');

const selectedDate = ref(new Date().toISOString().split('T')[0]);
const amount = ref(null);
const displayAmount = ref('');
const handleAmountInput = (e) => {
  let value = e.target.value.replace(/[^0-9]/g, '');
  amount.value = value ? parseInt(value) : null;
  displayAmount.value = value ? Number(value).toLocaleString() : '';
};

const category = ref('');
const paymentMethod = ref('card');

const shopName = ref('');
const itemName = ref('');
const memo = ref('');

const categories = computed(() => {
  return currentType.value === 'expense'
    ? [
        '음식',
        '카페',
        '교통',
        '쇼핑',
        '건강',
        '집',
        '세금',
        '보험',
        '기타 지출',
      ]
    : ['월급', '부수입', '용돈', '상여', '금융소득', '기타 수입'];
});

watch(currentType, () => {
  category.value = '';
});

const handleSave = async () => {
  if (!amount.value || !category.value || !selectedDate.value)
    return alert('모든 항목을 입력해 주세요');

  const finalAmount = Math.abs(amount.value);

  const newReceipt = {
    date: selectedDate.value,
    amount: finalAmount,
    category: category.value,
    payment_method: paymentMethod.value,
    shop_name: currentType.value === 'expense' ? shopName.value : '',
    item_name: currentType.value === 'expense' ? itemName.value : '',
    memo: memo.value,
    transaction_type: currentType.value,
  };

  try {
    // 3. 서버에 저장
    const response = await axios.post(
      'http://localhost:3000/transactions',
      newReceipt,
    );

    // 4. [중요] Pinia 스토어 동기화
    // 서버에서 다시 전체를 불러오거나(fetch), 생성된 데이터를 스토어 배열에 직접 푸시(push)
    if (response.status === 201) {
      // 가장 확실한 방법: 스토어의 fetch 함수를 재호출하여 최신화
      await transactionStore.fetchTransactions();

      // 만약 fetch 함수가 없다면 스토어의 state에 직접 접근 (추천하진 않음)
      // transactionStore.transactions.unshift(response.data);
    }

    router.push('/mainDashboard');
  } catch (error) {
    console.error('Failed to save:', error);
  }
};

const handleCancel = () => {
  router.push('/mainDashboard');
};
</script>

<style scoped>
.container-600 {
  max-width: 600px;
}

.transition-all {
  transition: all 0.2s ease;
}

.form-card {
  transition: transform 0.1s ease;
}

.amount-display {
  font-size: 1.5rem;
  outline: none;
}

.small-date {
  font-size: 0.95rem;
}

.border-dashed {
  border: 1px dashed #e0e0e0;
}

/* Chrome/Safari removal of arrows */
input::-webkit-inner-spin-button,
input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* For Firefox */
input[type='number'] {
  -moz-appearance: textfield;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.cursor-pointer {
  cursor: pointer;
}

/* 변경할 부분: <style scoped> 맨 아래 추가 */
.t-btn.active-income {
  color: var(--t-blue) !important;
}
.t-btn.active-expense {
  color: #f04452 !important; /* 토스 레드 */
}
</style>
