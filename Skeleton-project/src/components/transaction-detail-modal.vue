<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <button class="close-btn" @click="$emit('close')">✕</button>

      <div class="type-badge" :class="transaction.transaction_type">
        {{ transaction.transaction_type === 'income' ? '수입' : '지출' }}
      </div>

      <div class="amount" :class="transaction.transaction_type">
        {{ transaction.transaction_type === 'income' ? '+' : '-' }}{{ transaction.amount.toLocaleString() }}원
      </div>

      <ul class="detail-list">
        <li>
          <span class="label">날짜</span>
          <span>{{ transaction.date }}</span>
        </li>
        <li>
          <span class="label">카테고리</span>
          <span>{{ transaction.category }}</span>
        </li>
        <li>
          <span class="label">결제수단</span>
          <span>{{ paymentLabel[transaction.payment_method] }}</span>
        </li>
        <template v-if="transaction.transaction_type === 'expense'">
          <li v-if="transaction.shop_name">
            <span class="label">상호명</span>
            <span>{{ transaction.shop_name }}</span>
          </li>
          <li v-if="transaction.item_name">
            <span class="label">품목</span>
            <span>{{ transaction.item_name }}</span>
          </li>
        </template>
        <li v-if="transaction.memo">
          <span class="label">메모</span>
          <span>{{ transaction.memo }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
defineProps({
  transaction: {
    type: Object,
    required: true
  }
})

defineEmits(['close'])

const paymentLabel = {
  card: '카드',
  cash: '현금',
  account: '계좌이체'
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  width: 340px;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: #888;
}

.type-badge {
  display: inline-block;
  border-radius: 4px;
  padding: 2px 10px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.type-badge.income {
  background: #e3f2fd;
  color: #2196f3;
}

.type-badge.expense {
  background: #fdecea;
  color: #f44336;
}

.amount {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.amount.income {
  color: #2196f3;
}

.amount.expense {
  color: #f44336;
}

.detail-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-list li {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 0.5rem;
}

.label {
  color: #888;
}
</style>
