<template>
  <div
    class="card border-0 shadow-sm"
    style="cursor: pointer"
    @click="$emit('click')"
  >
    <div class="card-body py-3 px-3 d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center gap-3">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <span
              class="badge rounded-pill"
              :class="transaction.transaction_type === 'income' ? 'text-bg-primary' : 'text-bg-danger'"
              style="font-size: 0.7rem; font-weight: 500"
            >
              {{ transaction.category }}
            </span>
          </div>
          <div v-if="transaction.shop_name || transaction.item_name" class="fw-medium text-truncate" style="font-size: 0.9rem; max-width: 220px">
            <span>{{ transaction.shop_name }}</span>
            <span v-if="transaction.item_name" class="text-muted"> · {{ transaction.item_name }}</span>
          </div>
          <div class="text-muted d-flex gap-2" style="font-size: 0.78rem">
            <span>{{ transaction.date }}</span>
            <span>{{ paymentLabel[transaction.payment_method] }}</span>
          </div>
          <div v-if="transaction.memo" class="text-muted text-truncate" style="font-size: 0.78rem; max-width: 220px">{{ transaction.memo }}</div>
        </div>
      </div>

      <span
        class="fw-bold text-nowrap ms-2"
        :class="transaction.transaction_type === 'income' ? 'text-primary' : 'text-danger'"
        style="font-size: 0.95rem"
      >
        {{ transaction.transaction_type === 'income' ? '+' : '-' }}{{ transaction.amount.toLocaleString() }}원
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  transaction: {
    type: Object,
    required: true,
  },
});

defineEmits(['click']);

const paymentLabel = {
  card: '카드',
  cash: '현금',
  account: '계좌이체',
};
</script>
