<template>
  <div class="transaction-wrapper bg-light min-vh-100 py-4">
    <div class="container-600 mx-auto px-3">
      <div class="btn-group w-100 mb-4 shadow-sm bg-white p-1 rounded-3">
        <button
          class="btn btn-sm rounded-2 transition-all"
          :class="
            currentType === 'income'
              ? 'btn-primary text-white'
              : 'btn-light text-secondary'
          "
          @click="currentType = 'income'"
        >
          수입
        </button>
        <button
          class="btn btn-sm rounded-2 transition-all"
          :class="
            currentType === 'expense'
              ? 'btn-danger text-white'
              : 'btn-light text-secondary'
          "
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
              <div class="d-flex justify-content-between">
                <label class="small cursor-pointer"
                  ><input
                    type="radio"
                    v-model="paymentMethod"
                    value="cash"
                    class="me-1"
                  />
                  현금</label
                >
                <label class="small cursor-pointer"
                  ><input
                    type="radio"
                    v-model="paymentMethod"
                    value="account"
                    class="me-1"
                  />
                  계좌</label
                >
                <label class="small cursor-pointer"
                  ><input
                    type="radio"
                    v-model="paymentMethod"
                    value="card"
                    class="me-1"
                  />
                  카드</label
                >
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
                  >가계 이름</label
                >
                <input
                  v-model="shopName"
                  type="text"
                  placeholder="가계명"
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

      <div class="row g-2">
        <div class="col-8">
          <button
            @click="handleSave"
            class="btn btn-sm btn-dark w-100 py-3 rounded-4 fw-bold shadow-sm"
          >
            추가하기
          </button>
        </div>
        <div class="col-4">
          <button
            @click="handleCancel"
            class="btn btn-sm btn-outline-secondary w-100 py-3 rounded-4 fw-bold"
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

const router = useRouter();
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
    paymentMethod: paymentMethod.value,
    shopName: currentType.value === 'expense' ? shopName.value : '',
    itemName: currentType.value === 'expense' ? itemName.value : '',
    memo: memo.value,
    transactionType: currentType.value,
  };

  try {
    await axios.post('http://localhost:3000/transactions', newReceipt);
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
</style>
