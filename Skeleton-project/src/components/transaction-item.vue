<template>
  <div
    class="card border-0 shadow-sm"
    style="cursor: pointer"
    @click="$emit('click')"
  >
    <div
      class="card-body py-3 px-3 d-flex justify-content-between align-items-center"
    >
      <div class="d-flex align-items-center gap-3">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <span
              class="badge rounded-pill"
              :class="
                transaction.transaction_type === TRANSACTION_TYPE.INCOME
                  ? 'text-bg-primary'
                  : 'text-bg-danger'
              "
              style="font-size: 13px; font-weight: 500"
            >
              {{ transaction.category }}
            </span>
          </div>
          <div
            v-if="transaction.shop_name || transaction.item_name"
            class="fw-medium text-truncate"
            style="max-width: 220px"
          >
            <span style="font-size: 17px">{{ transaction.shop_name }}</span>
            <span
              v-if="transaction.item_name"
              class="text-muted"
              style="font-size: 15px"
            >
              · {{ transaction.item_name }}</span
            >
          </div>
          <div class="text-muted d-flex gap-2" style="font-size: 13px">
            <span>{{ transaction.date }}</span>
            <span class="text-muted">{{
              PAYMENT_LABEL[transaction.payment_method] ||
              transaction.payment_method
            }}</span>
          </div>
          <div
            v-if="transaction.memo"
            class="text-muted text-truncate"
            style="font-size: 13px; max-width: 220px"
          >
            {{ transaction.memo }}
          </div>
        </div>
      </div>

      <span
        class="fw-bold text-nowrap ms-2"
        :class="
          transaction.transaction_type === TRANSACTION_TYPE.INCOME
            ? 'text-primary'
            : 'text-danger'
        "
        style="font-size: 17px"
      >
        {{ transaction.transaction_type === TRANSACTION_TYPE.INCOME ? '+' : '-'
        }}{{ transaction.amount.toLocaleString() }}원
      </span>
    </div>
  </div>
</template>

<script setup>
import { TRANSACTION_TYPE } from '../constants/transactionType';
import { PAYMENT_LABEL } from '@/constants/payment';

defineProps({
  transaction: {
    type: Object,
    required: true,
  },
});

defineEmits(['click']);
//부모인 history가 @click로 받음
</script>
