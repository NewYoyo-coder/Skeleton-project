<template>
  <div
    class="hover-card p-3 rounded-4 border-0 shadow-sm bg-white d-flex align-items-center justify-content-between"
    @click="$emit('click')"
  >
    <div class="d-flex align-items-center gap-3 overflow-hidden">
      <div
        class="text-center border-end pe-2 text-secondary"
        style="min-width: 40px"
      >
        <div style="font-size: 10px; text-transform: uppercase">
          {{ getDayName(transaction.date) }}
        </div>
        <div class="fw-bold text-dark fs-5 line-height-1">
          {{ transaction.date ? transaction.date.split("-")[2] : "" }}
        </div>
      </div>

      <div class="overflow-hidden">
        <div class="d-flex align-items-center gap-2 mb-2">
          <span
            class="badge rounded-pill"
            :class="
              transaction.transaction_type === TRANSACTION_TYPE.INCOME
                ? 'text-bg-primary'
                : 'text-bg-danger'
            "
            style="font-size: 13px; font-weight: 400; padding: 5px 10px"
          >
            {{ transaction.category }}
          </span>
          <span class="text-muted" style="font-size: 11px">
            {{
              PAYMENT_LABEL[transaction.payment_method] ||
              transaction.payment_method
            }}
          </span>
        </div>

        <div
          class="fw-bold text-dark text-truncate fs-6"
          style="letter-spacing: -0.5px"
        >
          {{ transaction.shop_name }}
          <span
            v-if="transaction.item_name"
            class="fw-normal text-secondary opacity-75"
            style="font-size: 13px"
          >
            · {{ transaction.item_name }}
          </span>
        </div>
      </div>
    </div>

    <div class="text-end ms-2">
      <div
        class="fw-bold fs-5 text-nowrap"
        :class="
          transaction.transaction_type === TRANSACTION_TYPE.INCOME
            ? 'text-primary'
            : 'text-danger'
        "
      >
        {{ transaction.transaction_type === TRANSACTION_TYPE.INCOME ? "+" : "-"
        }}{{ transaction.amount.toLocaleString() }}
        <small style="font-size: 0.7em">원</small>
      </div>
      <div
        v-if="transaction.memo"
        class="text-muted text-truncate fst-italic small"
        style="max-width: 100px"
      >
        {{ transaction.memo }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { TRANSACTION_TYPE } from "../constants/transactionType";
import { PAYMENT_LABEL } from "@/constants/payment";

defineProps({
  transaction: {
    type: Object,
    required: true,
  },
});

defineEmits(["click"]);

// 요일 구하는 함수 추가
function getDayName(dateString) {
  if (!dateString) return "";
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const date = new Date(dateString);
  return days[date.getDay()];
}
</script>
