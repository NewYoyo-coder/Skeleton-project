<template>
  <div
    class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
    style="background: rgba(0,0,0,0.4); z-index: 1050"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-3 p-4 position-relative" style="width: 340px">
      <button
        class="btn-close position-absolute top-0 end-0 m-3"
        @click="$emit('close')"
      />

      <span
        class="badge mb-2"
        :class="transaction.transaction_type === 'income' ? 'text-bg-primary' : 'text-bg-danger'"
      >
        {{ transaction.transaction_type === 'income' ? '수입' : '지출' }}
      </span>

      <div
        class="fs-3 fw-bold mb-4"
        :class="transaction.transaction_type === 'income' ? 'text-primary' : 'text-danger'"
      >
        {{ transaction.transaction_type === 'income' ? '+' : '-'
        }}{{ Number(transaction.amount).toLocaleString() }}원
      </div>

      <ul class="list-unstyled d-flex flex-column gap-2">
        <li class="d-flex justify-content-between border-bottom pb-2">
          <span class="text-muted">날짜</span>
          <span>{{ transaction.date }}</span>
        </li>
        <li class="d-flex justify-content-between border-bottom pb-2">
          <span class="text-muted">카테고리</span>
          <span>{{ transaction.category }}</span>
        </li>
        <li class="d-flex justify-content-between border-bottom pb-2">
          <span class="text-muted">결제수단</span>
          <span>{{ paymentLabel[transaction.payment_method] }}</span>
        </li>
        <template v-if="transaction.transaction_type === 'expense'">
          <li v-if="transaction.shop_name" class="d-flex justify-content-between border-bottom pb-2">
            <span class="text-muted">상호명</span>
            <span>{{ transaction.shop_name }}</span>
          </li>
          <li class="d-flex flex-column border-bottom pb-2 gap-1">
            <span class="text-muted" style="font-size: 0.85rem">품목</span>
            <span>{{ transaction.item_name }}</span>
          </li>
        </template>
        <li class="d-flex flex-column border-bottom pb-2 gap-1">
          <span class="text-muted" style="font-size: 0.85rem">메모</span>
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
    required: true,
  },
});

defineEmits(['close']);

const paymentLabel = {
  card: '카드',
  cash: '현금',
  account: '계좌이체',
};
</script>
