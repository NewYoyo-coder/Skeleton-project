<template>
  <div
    v-if="transaction"
    class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-start justify-content-center"
    style="
      background: rgba(0, 0, 0, 0.4);
      z-index: 1050;
      backdrop-filter: blur(10px);
      padding-top: 80px;
    "
    @click.self="$emit('close')"
  >
    <div
      class="bg-white rounded-5 p-4 position-relative shadow-custom animate-pop"
      style="width: 360px; border: none; min-height: 520px"
    >
      <button
        class="btn-close position-absolute top-0 end-0 m-4 opacity-25"
        style="width: 10px; height: 10px; background-size: 10px"
        @click="$emit('close')"
      />

      <div class="mb-3 mt-1">
        <template v-if="isEditing">
          <div
            class="d-inline-flex bg-light p-1 rounded-4"
            style="width: 140px"
          >
            <button
              class="flex-fill border-0 rounded-3 py-1 text-center fw-bold fs-7 transition-ease"
              :class="
                form.transaction_type === TRANSACTION_TYPE.INCOME
                  ? 'bg-white text-primary shadow-sm'
                  : 'bg-transparent text-muted'
              "
              @click="form.transaction_type = TRANSACTION_TYPE.INCOME"
            >
              수입
            </button>
            <button
              class="flex-fill border-0 rounded-3 py-1 text-center fw-bold fs-7 transition-ease"
              :class="
                form.transaction_type === TRANSACTION_TYPE.EXPENSE
                  ? 'bg-white text-danger shadow-sm'
                  : 'bg-transparent text-muted'
              "
              @click="form.transaction_type = TRANSACTION_TYPE.EXPENSE"
            >
              지출
            </button>
          </div>
        </template>
        <span
          v-else
          :class="
            transaction.transaction_type === TRANSACTION_TYPE.INCOME
              ? 'text-primary'
              : 'text-danger'
          "
          class="fw-bold fs-7 px-1"
        >
          {{
            transaction.transaction_type === TRANSACTION_TYPE.INCOME
              ? "수입"
              : "지출"
          }}
        </span>
      </div>

      <div
        class="fs-1 fw-bold mb-4 d-flex align-items-baseline"
        :class="
          form.transaction_type === TRANSACTION_TYPE.INCOME
            ? 'text-primary'
            : 'text-danger'
        "
      >
        <template v-if="isEditing">
          <span class="me-1 opacity-75">{{
            form.transaction_type === TRANSACTION_TYPE.INCOME ? "+" : "-"
          }}</span>
          <input
            :value="formattedAmount"
            @input="handleAmountInput"
            type="text"
            inputmode="numeric"
            class="form-control border-0 p-0 fs-1 fw-bold flex-fill bg-transparent amount-input"
            @focus="$event.target.select()"
            @mouseup.prevent
            autofocus
          />
          <span class="fs-4 ms-1 opacity-75">원</span>
        </template>
        <span v-else class="editable-value" @click="startEdit">
          {{
            transaction.transaction_type === TRANSACTION_TYPE.INCOME
              ? "+"
              : "-"
          }}{{ Number(transaction.amount).toLocaleString() }}원
        </span>
      </div>

      <ul class="list-unstyled d-flex flex-column gap-3 mb-4">
        <li
          class="d-flex justify-content-between align-items-center border-bottom border-light pb-2"
        >
          <span class="text-secondary small fw-medium" style="min-width: 60px"
            >날짜</span
          >
          <div class="flex-grow-1 text-end ps-3">
            <input
              v-if="isEditing"
              v-model="form.date"
              type="date"
              class="form-control form-control-sm bg-light rounded-3 text-end fw-bold custom-text-input"
              style="font-size: 13px"
            />
            <span
              v-else
              class="fw-bold text-dark editable-value"
              style="font-size: 14px"
              @click="startEdit"
              >{{ transaction.date }}</span
            >
          </div>
        </li>

        <li class="d-flex flex-column border-bottom border-light pb-3 pt-1">
          <span class="text-secondary small fw-medium mb-2">카테고리</span>
          <div v-if="isEditing" class="d-flex flex-wrap gap-2">
            <button
              v-for="optKey in categoryOptions"
              :key="optKey"
              class="chip-btn border-0 rounded-4 px-3 py-1 fw-bold fs-7 transition-ease"
              :class="
                form.category === (CATEGORY_LABEL[optKey] || optKey)
                  ? 'bg-dark text-white shadow-sm'
                  : 'bg-light text-secondary'
              "
              @click="form.category = CATEGORY_LABEL[optKey] || optKey"
            >
              {{ CATEGORY_LABEL[optKey] || optKey }}
            </button>
          </div>
          <span
            v-else
            class="fw-bold text-dark text-end editable-value"
            style="font-size: 14px"
            @click="startEdit"
            >{{ transaction.category }}</span
          >
        </li>

        <li class="d-flex flex-column border-bottom border-light pb-3 pt-1">
          <span class="text-secondary small fw-medium mb-2">결제수단</span>
          <div v-if="isEditing" class="d-flex flex-wrap gap-2">
            <button
              v-for="optKey in PAYMENT_METHODS"
              :key="optKey"
              class="chip-btn border-0 rounded-4 px-3 py-1 fw-bold fs-7 transition-ease"
              :class="
                form.payment_method === (PAYMENT_LABEL[optKey] || optKey)
                  ? 'bg-dark text-white shadow-sm'
                  : 'bg-light text-secondary'
              "
              @click="form.payment_method = PAYMENT_LABEL[optKey] || optKey"
            >
              {{ PAYMENT_LABEL[optKey] || optKey }}
            </button>
          </div>
          <span
            v-else
            class="fw-bold text-dark text-end editable-value"
            style="font-size: 14px"
            @click="startEdit"
          >
            {{
              PAYMENT_LABEL[transaction.payment_method] ||
              transaction.payment_method
            }}
          </span>
        </li>

        <template
          v-if="
            form.transaction_type === TRANSACTION_TYPE.EXPENSE ||
            form.transaction_type === '지출'
          "
        >
          <li
            class="d-flex justify-content-between align-items-center border-bottom border-light pb-2 pt-1"
          >
            <span class="text-secondary small fw-medium">가게명</span>
            <div class="flex-grow-1 text-end ps-3">
              <input
                v-if="isEditing"
                v-model="form.shop_name"
                type="text"
                class="form-control form-control-sm bg-light rounded-3 text-end fw-bold custom-text-input"
                @focus="$event.target.select()"
                @mouseup.prevent
                style="font-size: 13px"
                placeholder="어디서 쓰셨나요?"
              />
              <span
                v-else
                class="fw-bold text-dark editable-value"
                style="font-size: 14px"
                @click="startEdit"
                >{{ transaction.shop_name || "-" }}</span
              >
            </div>
          </li>
          <li
            class="d-flex justify-content-between align-items-center border-bottom border-light pb-2 pt-1"
          >
            <span class="text-secondary small fw-medium">상품명</span>
            <div class="flex-grow-1 text-end ps-3">
              <input
                v-if="isEditing"
                v-model="form.item_name"
                type="text"
                class="form-control form-control-sm bg-light rounded-3 text-end fw-bold custom-text-input"
                @focus="$event.target.select()"
                @mouseup.prevent
                style="font-size: 13px"
                placeholder="무엇을 사셨나요?"
              />
              <span
                v-else
                class="fw-bold text-dark editable-value"
                style="font-size: 14px"
                @click="startEdit"
                >{{ transaction.item_name || "-" }}</span
              >
            </div>
          </li>
        </template>

        <li class="d-flex flex-column gap-2 mt-1">
          <span class="text-secondary small fw-medium">메모</span>
          <textarea
            v-if="isEditing"
            v-model="form.memo"
            class="form-control bg-light rounded-4 p-3 custom-text-input"
            rows="2"
            placeholder="남길 메모가 있나요?"
            style="font-size: 13px; resize: none; line-height: 1.5"
            @focus="$event.target.select()"
            @mouseup.prevent
          ></textarea>
          <div
            v-else
            class="bg-light p-3 rounded-4 editable-value"
            @click="startEdit"
            style="min-height: 50px"
          >
            <span class="text-dark small lh-base fw-medium">{{
              transaction.memo || "작성된 메모가 없습니다."
            }}</span>
          </div>
        </li>
      </ul>

      <div class="d-flex gap-2 mt-4">
        <template v-if="isEditing">
          <button
            class="t-btn t-push flex-fill py-3 rounded-4 fw-bold"
            :style="{
              background:
                form.transaction_type === TRANSACTION_TYPE.INCOME
                  ? '#3182f6'
                  : '#f04452',
              color: '#fff',
            }"
            @click="save"
          >
            저장하기
          </button>
          <button
            class="t-btn t-push flex-fill py-3 rounded-4 fw-bold"
            style="background: #f2f4f6; color: #6b7684"
            @click="cancelEdit"
          >
            취소
          </button>
        </template>
        <template v-else>
          <button
            class="t-btn t-push flex-fill py-3 rounded-4 fw-bold text-white"
            style="background: #3182f6"
            @click="startEdit"
          >
            수정하기
          </button>
          <button
            class="t-btn t-push flex-fill py-3 rounded-4 text-danger fw-bold"
            style="background: #fcecef"
            @click="remove"
          >
            삭제하기
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";
import { useTransactionStore } from "../stores/transaction";
import { TRANSACTION_TYPE } from "../constants/transactionType";
import { CATEGORIES, CATEGORY_LABEL } from "../constants/categories";
import { PAYMENT_METHODS, PAYMENT_LABEL } from "../constants/payment";

const today = new Date().toISOString().split("T")[0];
const props = defineProps({ transaction: { type: Object, required: true } });
const emit = defineEmits(["close"]);
const store = useTransactionStore();

const isEditing = ref(false);
const form = reactive({ ...props.transaction });

const categoryOptions = computed(() => CATEGORIES[form.transaction_type] ?? []);

// 금액 포맷팅 (화면 표시용)
const formattedAmount = computed(() => {
  if (!form.amount) return "";
  return Number(form.amount).toLocaleString();
});

// 금액 입력 핸들러 (순수 숫자만 추출)
const handleAmountInput = (e) => {
  const rawValue = e.target.value.replace(/[^0-9]/g, "");
  form.amount = rawValue ? Number(rawValue) : 0;
  // 강제로 화면 값을 업데이트 (포맷팅 유지)
  e.target.value = form.amount ? form.amount.toLocaleString() : "";
};

watch(
  () => form.transaction_type,
  (newType) => {
    const newCats = CATEGORIES[newType] || [];
    if (newCats.length > 0) {
      const currentCatValid = newCats.some(
        (key) => CATEGORY_LABEL[key] === form.category || key === form.category,
      );
      if (!currentCatValid)
        form.category = CATEGORY_LABEL[newCats[0]] || newCats[0];
    }
  },
);

function startEdit() {
  Object.assign(form, props.transaction);
  isEditing.value = true;
}
function cancelEdit() {
  Object.assign(form, props.transaction);
  isEditing.value = false;
}

async function save() {
  if (form.amount <= 0) return notify.error("금액은 0보다 커야 합니다.");
  await store.updateTransaction(props.transaction.id, { ...form });
  isEditing.value = false;
  emit("close");
}

async function remove() {
  if (confirm("정말 삭제하시겠습니까?")) {
    await store.deleteTransaction(props.transaction.id);
    emit("close");
  }
}
</script>

<style scoped>
.shadow-custom {
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 1px rgba(0, 0, 0, 0.05);
}

@keyframes pop {
  from {
    opacity: 0;
    transform: scale(0.98) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
.animate-pop {
  animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform, opacity;
}

.bg-white.rounded-5 {
  min-height: 520px;
}

.transition-ease {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 🚀 핵심: 진짜 텍스트박스처럼 보이게 하는 스타일 */
.custom-text-input {
  border: 1px solid transparent !important;
  transition: all 0.2s ease;
  cursor: text;
}

.custom-text-input:focus {
  background-color: #ffffff !important; /* 포커스 시 흰색으로 반전 */
  border: 1px solid #3182f6 !important; /* 토스 블루 테두리 */
  box-shadow: 0 0 0 3px rgba(49, 130, 246, 0.1) !important; /* 은은한 포커스 링 */
  outline: none !important;
}

.amount-input:focus {
  background-color: transparent !important;
  box-shadow: none !important;
  outline: none !important;
}

.editable-value,
.fw-bold,
.text-dark,
.lh-base {
  user-select: text !important;
  -webkit-user-select: text !important;
  cursor: text;
}

.chip-btn {
  cursor: pointer;
  transition: all 0.2s;
}
.chip-btn.active {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.t-push:active {
  transform: scale(0.95);
  transition: transform 0.1s ease;
}
</style>
