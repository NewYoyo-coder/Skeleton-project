<template>
  <div class="transaction-container">
    <div class="type-selector">
      <button
        :class="{ active: currentType === 'income' }"
        @click="currentType = 'income'"
      >
        수입
      </button>
      <button
        :class="{ active: currentType === 'expense' }"
        @click="currentType = 'expense'"
      >
        지출
      </button>
    </div>
    <div class="middle-body">
      <h2>{{ currentType === 'expense' ? '지출' : '수입' }} 추가</h2>
      <div class="form-group">
        <label class="mb-2 fw-bold text-secondary">날짜 </label>
        <input type="date" v-model="selectedDate" required />
      </div>

      <div class="form-group">
        <label class="mb-2 fw-bold text-secondary">수단</label>
        <div class="radio-group">
          <label class="me-2"
            ><input type="radio" v-model="paymentMethod" value="cash" />
            현금</label
          >
          <label class="me-2"
            ><input type="radio" v-model="paymentMethod" value="account" />
            계좌</label
          >
          <label class="me-2"
            ><input type="radio" v-model="paymentMethod" value="card" />
            카드</label
          >
        </div>
      </div>

      <div class="form-group">
        <label class="mb-2 fw-bold text-secondary">금액</label>
        <div class="input-wrapper">
          <input v-model.number="amount" type="number" placeholder="0" />
          <span class="unit">원</span>
        </div>
      </div>

      <div class="form-group">
        <label class="mb-2 fw-bold text-secondary">카테고리</label>
        <select v-model="category">
          <option disabled value="">카테고리를 선택하세요</option>
          <option v-for="cat in categories" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
      </div>

      <div v-if="currentType === 'expense'" class="optional-section">
        <div class="form-group">
          <label class="fw-bold text-secondary">가계 이름 (선택)</label>
          <input v-model="shopName" type="text" />
        </div>

        <div class="form-group">
          <label class="fw-bold text-secondary">상품명 (선택)</label>
          <input v-model="itemName" type="text" />
        </div>
      </div>

      <div class="memo form-group">
        <label>메모</label><br />
        <input v-model="memo" type="text" />
      </div>

      <div class="button-group">
        <button @click="handleSave" class="btn-submit btn btn-success">
          추가
        </button>
        <button @click="handleCancel" class="btn-cancel btn btn-danger">
          취소
        </button>
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
const category = ref('');
const paymentMethod = ref('card');

const shopName = ref('');
const itemName = ref('');
const memo = ref('');

const categories = computed(() => {
  return currentType.value === 'expense'
    ? ['음식', '카페', '교통', '쇼핑', '집', '세금', '보험', '기타 지출']
    : ['월급', '부수입', '용돈', '상여', '금융소득', '기타 수입'];
});

watch(currentType, () => {
  category.value = '';
});

const handleSave = async () => {
  if (!amount.value || !category.value || !selectedDate.value)
    return alert('모든 항목을 입력해 주세요');

  const finalAmount =
    currentType.value === 'expense'
      ? -Math.abs(amount.value)
      : Math.abs(amount.value);

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
    router.push('/');
  } catch (error) {
    console.error('Failed to save:', error);
  }
};

const handleCancel = () => {
  router.push('/');
};
</script>

<style scoped>
.transaction-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f1f1f1;
  font-family: Arial, sans-serif;
}

.middle-body {
  width: 100%;
  max-width: 425px;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

h2 {
  text-align: center;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.form-group {
  padding: 18px;
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
}

input,
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 8px;
  box-sizing: border-box;
  margin-top: 8px;
}

.type-selector {
  display: flex;
  justify-content: center;
  gap: 0;
  width: 100%;
  max-width: 425px;
  margin-bottom: 10px;
}

.type-selector button {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  cursor: pointer;
  background-color: white;
  font-weight: bold;
  color: #777;
}

.type-selector button.active {
  background-color: #2c3e50;
  color: white;
  border-color: #2c3e50;
}
.button-group {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.btn {
  padding: 12px 20px;
  border: none;
  cursor: pointer;
  border-radius: 10px;
  font-weight: bold;
}

.btn-submit {
  background-color: #4caf50;
  color: white;
}
.btn-cancel {
  background-color: #f44336;
  color: white;
}

.optional-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.radio-group {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}

.radio-group label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.95rem;
  color: #333;
}
.radio-group input {
  width: auto;
  margin: 0 8px 0 0;
  cursor: pointer;
  accent-color: #2c3e50;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.amount-input {
  width: 100%;
  padding: 10px 40px 10px 10px;
  border: 1px solid #eee;
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 1rem;
}

.unit {
  position: absolute;
  right: 15px;
  font-weight: bold;
  color: #333;
  pointer-events: none;
  top: 50%;
  transform: translateY(-25%);
  font-size: 1rem;
  line-height: 1;
}

/* For Chrome, Safari, Edge, and Opera */
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
/* For Firefox */
input[type='number'] {
  -moz-appearance: textfield;
}
</style>
