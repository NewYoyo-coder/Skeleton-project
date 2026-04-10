<template>
  <div
    class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
    style="
      background: rgba(0, 0, 0, 0.5);
      z-index: 1050;
      backdrop-filter: blur(5px);
    "
    @click.self="$emit('close')"
  >
    <div
      class="bg-white rounded-5 p-4 position-relative shadow-lg"
      style="width: 360px; border: 1px solid rgba(0, 0, 0, 0.05)"
    >
      <button
        class="btn-close position-absolute top-0 end-0 m-4 opacity-50"
        @click="$emit('close')"
      />

      <div class="mb-2 mt-2">
        <template v-if="isEditing">
          <select
            v-model="form.transaction_type"
            class="form-select border-0 bg-light rounded-3 fw-bold text-primary"
            style="width: auto; font-size: 14px"
          >
            <option :value="TRANSACTION_TYPE.INCOME">수입</option>
            <option :value="TRANSACTION_TYPE.EXPENSE">지출</option>
          </select>
        </template>
        <span
          v-else
          :class="
            transaction.transaction_type === TRANSACTION_TYPE.INCOME
              ? 'text-primary'
              : 'text-danger'
          "
          class="fw-bold small"
        >
          {{
            transaction.transaction_type === TRANSACTION_TYPE.INCOME
              ? '수입'
              : '지출'
          }}
        </span>
      </div>

      <div
        class="fs-1 fw-bold mb-4"
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
            class="form-control border-0 p-0 fs-1 fw-bold"
            style="
              background: transparent;
              color: inherit;
              outline: none;
              box-shadow: none;
            "
          />
        </template>
        <span class="editable-value" @click="startEdit">
          {{
            transaction.transaction_type === TRANSACTION_TYPE.INCOME
              ? '+'
              : '-'
          }}{{ Number(transaction.amount).toLocaleString() }}원
        </span>
      </div>

      <ul class="list-unstyled d-flex flex-column gap-3 mb-4">
        <li
          v-for="field in [
            { label: '날짜', key: 'date', type: 'date' },
            {
              label: '카테고리',
              key: 'category',
              type: 'select',
              options: categoryOptions,
            },
            {
              label: '결제수단',
              key: 'payment_method',
              type: 'select',
              options: PAYMENT_METHODS,
            },
          ]"
          :key="field.key"
          class="d-flex justify-content-between align-items-center"
        >
          <span class="text-secondary small" style="min-width: 60px">{{
            field.label
          }}</span>
          <div class="flex-grow-1 text-end ps-3">
            <template v-if="isEditing">
              <input
                v-if="field.type === 'date'"
                v-model="form[field.key]"
                type="date"
                class="form-control form-control-sm border-0 bg-light rounded-3 text-end"
              />
              <select
                v-else
                v-model="form[field.key]"
                class="form-select form-select-sm border-0 bg-light rounded-3 text-end"
              >
                <option
                  v-for="optKey in field.options"
                  :key="optKey"
                  :value="
                    field.key === 'category'
                      ? CATEGORY_LABEL[optKey] || optKey
                      : optKey
                  "
                >
                  {{
                    field.key === 'category'
                      ? CATEGORY_LABEL[optKey] || optKey
                      : PAYMENT_LABEL[optKey] || optKey
                  }}
                </option>
              </select>
            </template>
            <!-- 영어로 card account 뜨던 부분 해결 by front -->
            <span v-else class="fw-medium" @click="startEdit">
              {{
                field.key === 'payment_method'
                  ? PAYMENT_LABEL[transaction[field.key]] ||
                    transaction[field.key]
                  : transaction[field.key]
              }}
            </span>
          </div>
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
          <li class="d-flex justify-content-between align-items-center">
            <span class="text-secondary small">가게명</span>
            <div class="flex-grow-1 text-end ps-3">
              <input
                v-if="isEditing"
                v-model="form.shop_name"
                type="text"
                class="form-control form-control-sm border-0 bg-light rounded-3 text-end"
              />
              <span v-else class="fw-medium" @click="startEdit">{{
                transaction.shop_name
              }}</span>
            </div>
          </li>
          <li class="d-flex flex-column gap-1">
            <span class="text-secondary small">상품명</span>
            <input
              v-if="isEditing"
              v-model="form.item_name"
              type="text"
              class="form-control form-control-sm border-0 bg-light rounded-3"
            />
            <span v-else class="fw-medium" @click="startEdit">{{
              transaction.item_name || '입력된 상품 없음'
            }}</span>
          </li>
        </template>

        <li class="d-flex flex-column gap-1">
          <span class="text-secondary small">메모</span>
          <textarea
            v-if="isEditing"
            v-model="form.memo"
            class="form-control form-control-sm border-0 bg-light rounded-3"
            rows="2"
          ></textarea>
          <span
            v-else
            class="text-dark small bg-light p-2 rounded-3"
            @click="startEdit"
            >{{ transaction.memo || '메모가 없습니다.' }}</span
          >
        </li>
      </ul>

      <div class="d-flex gap-2">
        <template v-if="isEditing">
          <button
            class="t-btn t-push flex-fill py-3 rounded-4 fw-bold"
            style="background: var(--t-blue); color: #fff"
            @click="save"
          >
            저장하기
          </button>
          <button
            class="t-btn t-push t-single flex-fill py-3 rounded-4"
            @click="cancelEdit"
          >
            취소
          </button>
        </template>
        <template v-else>
          <button
            class="t-btn t-push t-single flex-fill py-3 rounded-4 fw-bold"
            @click="startEdit"
          >
            정보 수정
          </button>
          <button
            class="t-btn t-push flex-fill py-3 rounded-4 text-danger"
            style="background: #fff0f0"
            @click="remove"
          >
            삭제
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
const form = reactive({ ...props.transaction }); //...복사값

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
