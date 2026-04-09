import { TRANSACTION_TYPE } from './transactionType'

export const CATEGORIES = {
  [TRANSACTION_TYPE.EXPENSE]: ['food', 'cafe', 'transportation', 'shopping', 'housing', 'taxes', 'insurance', 'etc'],
  [TRANSACTION_TYPE.INCOME]: ['salary', 'additional_income', 'allowance', 'bonus', 'interest', 'etc'],
}

export const CATEGORY_LABEL = {
  food: '음식',
  cafe: '카페',
  transportation: '교통',
  shopping: '쇼핑',
  housing: '집',
  taxes: '세금',
  insurance: '보험',
  salary: '월급',
  additional_income: '부수입',
  allowance: '용돈',
  bonus: '상여',
  interest: '금융소득',
  etc: '기타',
}
