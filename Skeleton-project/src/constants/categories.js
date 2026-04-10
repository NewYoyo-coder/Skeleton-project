import { TRANSACTION_TYPE } from './transactionType';

export const CATEGORIES = {
  [TRANSACTION_TYPE.EXPENSE]: [
    'food', // 음식
    'cafe', // 카페
    'transportation', // 교통
    'shopping', // 쇼핑
    'housing', // 집
    'taxes', // 세금
    'insurance', // 보험
    'etc', // 기타
  ],
  [TRANSACTION_TYPE.INCOME]: [
    'salary', // 월급
    'additional_income', // 부수입
    'allowance', // 용돈
    'bonus', // 상여
    'interest', // 금융소득
    'etc', // 기타
  ],
};

export const CATEGORY_LABEL = {
  // 지출
  food: '음식',
  cafe: '카페',
  transportation: '교통',
  shopping: '쇼핑',
  housing: '집',
  taxes: '세금',
  insurance: '보험',

  // 수입
  salary: '월급',
  additional_income: '부수입',
  allowance: '용돈',
  bonus: '상여',
  interest: '금융소득',

  // 공통 (수입/지출 모두 사용)
  etc: '기타',
};