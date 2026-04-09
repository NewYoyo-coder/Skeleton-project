<template>
  <div
    class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
    @click.self="$emit('close')"
  >
    <!-- style="background: rgba(0, 0, 0, 0.4); z-index: 1050" -->
    <div class="rounded-3 p-4 position-relative" style="width: 340px">
      <button
        class="btn-close position-absolute top-0 end-0 m-3"
        @click="$emit('close')"
      />

      <!-- 수입/지출 타입 -->
      <template v-if="isEditing">
        <select
          v-model="form.transaction_type"
          class="form-select form-select-sm w-auto mb-2"
        >
          <option :value="TRANSACTION_TYPE.INCOME">수입</option>
          <option :value="TRANSACTION_TYPE.EXPENSE">지출</option>
        </select>
      </template>
      <template v-else>
        <span
          class="badge mb-2"
          :class="
            transaction.transaction_type === TRANSACTION_TYPE.INCOME
              ? 'text-bg-primary'
              : 'text-bg-danger'
          "
        >
          {{
            transaction.transaction_type === TRANSACTION_TYPE.INCOME
              ? '수입'
              : '지출'
          }}
        </span>
      </template>

      <!-- 금액 -->
      <div
        class="fs-3 fw-bold mb-4"
        :class="
          form.transaction_type === TRANSACTION_TYPE.INCOME
            ? 'text-primary'
            : 'text-danger'
        "
      >
        <template v-if="isEditing">
          <input
            v-model.number="form.amount"
            type="number"
            class="form-control form-control-lg fw-bold"
            style="color: inherit"
          />
        </template>
        <template v-else>
          <span class="editable-value" @click="startEdit">
            {{
              transaction.transaction_type === TRANSACTION_TYPE.INCOME
                ? '+'
                : '-'
            }}{{ Number(transaction.amount).toLocaleString() }}원
          </span>
        </template>
      </div>

      <ul class="list-unstyled d-flex flex-column gap-2">
        <!-- 날짜 -->
        <li
          class="d-flex justify-content-between align-items-center border-bottom pb-2"
        >
          <span class="text-muted flex-shrink-0 me-2">날짜</span>
          <input
            v-if="isEditing"
            v-model="form.date"
            type="date"
            :max="today"
            class="form-control form-control-sm w-auto"
          />
          <span v-else class="editable-value" @click="startEdit">{{
            transaction.date
          }}</span>
        </li>

        <!-- 카테고리 -->
        <li
          class="d-flex justify-content-between align-items-center border-bottom pb-2"
        >
          <span class="text-muted flex-shrink-0 me-2">카테고리</span>
          <select
            v-if="isEditing"
            v-model="form.category"
            class="form-select form-select-sm w-auto"
          >
            <option
              v-for="cat in categoryOptions"
              :key="cat"
              :value="CATEGORY_LABEL[cat]"
            >
              {{ CATEGORY_LABEL[cat] }}
            </option>
          </select>
          <span v-else class="editable-value" @click="startEdit">{{
            transaction.category
          }}</span>
        </li>

        <!-- 결제수단 -->
        <li
          class="d-flex justify-content-between align-items-center border-bottom pb-2"
        >
          <span class="text-muted flex-shrink-0 me-2">결제수단</span>
          <select
            v-if="isEditing"
            v-model="form.payment_method"
            class="form-select form-select-sm w-auto"
          >
            <option
              v-for="method in PAYMENT_METHODS"
              :key="method"
              :value="PAYMENT_LABEL[method]"
            >
              {{ PAYMENT_LABEL[method] }}
            </option>
          </select>
          <span v-else class="editable-value" @click="startEdit">{{
            transaction.payment_method
          }}</span>
        </li>

        <!-- 지출 전용 필드 -->
        <template v-if="form.transaction_type === TRANSACTION_TYPE.EXPENSE">
          <li
            class="d-flex justify-content-between align-items-center border-bottom pb-2"
          >
            <span class="text-muted flex-shrink-0 me-2">상호명</span>
            <input
              v-if="isEditing"
              v-model="form.shop_name"
              type="text"
              class="form-control form-control-sm w-auto"
            />
            <span v-else class="editable-value" @click="startEdit">{{
              transaction.shop_name
            }}</span>
          </li>
          <li class="d-flex flex-column border-bottom pb-2 gap-1">
            <span class="text-muted" style="font-size: 0.85rem">품목</span>
            <input
              v-if="isEditing"
              v-model="form.item_name"
              type="text"
              class="form-control form-control-sm"
            />
            <span v-else class="editable-value" @click="startEdit">{{
              transaction.item_name
            }}</span>
          </li>
        </template>

        <!-- 메모 -->
        <li class="d-flex flex-column border-bottom pb-2 gap-1">
          <span class="text-muted" style="font-size: 0.85rem">메모</span>
          <textarea
            v-if="isEditing"
            v-model="form.memo"
            class="form-control form-control-sm"
            rows="2"
          />
          <span v-else class="editable-value" @click="startEdit">{{
            transaction.memo
          }}</span>
        </li>
      </ul>

      <!-- 버튼 영역 -->
      <div class="d-flex gap-2 mt-4">
        <template v-if="isEditing">
          <button
            class="btn btn-primary btn-sm flex-fill"
            :disabled="saving"
            @click="save"
          >
            {{ saving ? '저장 중...' : '저장' }}
          </button>
          <button
            class="btn btn-outline-secondary btn-sm flex-fill"
            @click="cancelEdit"
          >
            취소
          </button>
        </template>
        <template v-else>
          <button
            class="btn btn-outline-secondary btn-sm flex-fill"
            @click="startEdit"
          >
            수정
          </button>
          <button
            class="btn btn-outline-danger btn-sm flex-fill"
            :disabled="deleting"
            @click="remove"
          >
            {{ deleting ? '삭제 중...' : '삭제' }}
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';

const today = new Date().toISOString().split('T')[0];
import { useTransactionStore } from '../stores/transaction';
import { TRANSACTION_TYPE } from '../constants/transactionType';
import { CATEGORIES, CATEGORY_LABEL } from '../constants/categories';
import { PAYMENT_METHODS, PAYMENT_LABEL } from '../constants/payment';

const props = defineProps({
  transaction: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['close']); //부모인 history가 @close로 받음
// x 눌렀을때, 백그라운드 눌렀을때, 삭제 눌러서 확인 눌렀을때

//pinia
const store = useTransactionStore();

const categoryOptions = computed(() => CATEGORIES[form.transaction_type] ?? []);

const isEditing = ref(false);
const saving = ref(false);
const deleting = ref(false);

//복사값 들고있음
const form = reactive({ ...props.transaction });

function startEdit() {
  Object.assign(form, props.transaction);
  isEditing.value = true;
}

//다시 원본 덮어씌움
function cancelEdit() {
  Object.assign(form, props.transaction);
  isEditing.value = false;
}

async function save() {
  if (form.amount <= 0) {
    alert('금액은 0보다 커야 합니다.');
    return;
  }
  if (form.date > today) {
    alert('미래 날짜는 선택할 수 없습니다.');
    return;
  }
  saving.value = true;
  await store.updateTransaction(props.transaction.id, { ...form });
  saving.value = false;
  isEditing.value = false;
}

async function remove() {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  deleting.value = true;
  await store.deleteTransaction(props.transaction.id);
  deleting.value = false;
  emit('close');
}
</script>

<style scoped>
.editable-value {
  cursor: pointer;
  border-radius: 4px;
  padding: 1px 4px;
  transition: background 0.15s;
}
.editable-value:hover {
  background: #f0f0f0;
}
</style>
