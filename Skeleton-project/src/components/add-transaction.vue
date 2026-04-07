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

    <h2>{{ currentType === 'expense' ? '지출' : '수입' }} 추가</h2>

    <div class="form-group">
      <label>날짜 선택:</label>
      <input type="date" v-model="selectedDate" required />
    </div>

    <div class="form-group">
      <label>수단</label>
      <div class="radio-group">
        <label
          ><input type="radio" v-model="paymentMethod" value="cash" />
          현금</label
        >
        <label
          ><input type="radio" v-model="paymentMethod" value="account" />
          계좌</label
        >
        <label
          ><input type="radio" v-model="paymentMethod" value="card" />
          카드</label
        >
      </div>
    </div>

    <div class="form-group">
      <label>금액</label>
      <input v-model.number="amount" type="number" placeholder="0" />
    </div>

    <div class="form-group">
      <label>카테고리</label>
      <select v-model="category">
        <option disabled value="">카테고리를 선택하세요</option>
        <option v-for="cat in categories" :key="cat" :value="cat">
          {{ cat }}
        </option>
      </select>
    </div>

    <div v-if="currentType === 'expense'" class="optional-section">
      <div class="form-group">
        <label>가계 이름 (선택)</label>
        <input v-model="shopName" type="text" />
      </div>

      <div class="form-group">
        <label>상품명 (선택)</label>
        <input v-model="itemName" type="text" />
      </div>
    </div>

    <div class="memo">
      <label>메모</label>
      <input v-model="memo" type="text" />
    </div>

    <div class="button-group">
      <button @click="handleSave" class="btn-submit">추가</button>
      <button @click="handleCancel" class="btn-cancel">취소</button>
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
    ? ['음식', '카페', '교통', '쇼핑', '집', '세금', '보험', '기타']
    : ['월급', '부수입', '용돈', '상여', '금융소득', '기타'];
});

watch(currentType, () => {
  category.value = '';
});

const handleSave = async () => {
  if (!amount.value || !category.value || !selectedDate.value)
    return alert('모든 항목을 입력해 주세요');

  const timestampId = Date.now().toString();

  const finalAmount =
    currentType.value === 'expense'
      ? -Math.abs(amount.value)
      : Math.abs(amount.value);

  const newReceipt = {
    id: timestampId,
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
    await axios.post('http://localhost:3000/receipts', newReceipt);
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
.type-selector {
  display: flex;
  justify-content: center;
  gap: 0;
  margin-bottom: 20px;
}
.type-selector button {
  padding: 10px 40px;
  border: 1px solid #ddd;
  cursor: pointer;
  background-color: white;
}
.type-selector button.active {
  background-color: #2c3e50;
  color: white;
  border-color: #2c3e50;
}
.button-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
.btn-submit {
  background-color: #42b983;
  color: white;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
}
.btn-cancel {
  background-color: #ff5252;
  color: white;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
}
.form-group {
  margin-bottom: 15px;
}
</style>
