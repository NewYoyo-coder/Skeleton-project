import { TRANSACTION_TYPE } from './transactionType';

export const CATEGORIES = {
  [TRANSACTION_TYPE.EXPENSE]: [
    'food',
    'cafe',
    'transportation',
    'shopping',
    'housing',
    'taxes',
    'insurance',
    'etc',
  ],
  [TRANSACTION_TYPE.INCOME]: [
    'salary',
    'additional_income',
    'allowance',
    'bonus',
    'interest',
    'etc',
  ],
};

export const CATEGORY_LABEL = {
  // 지출
  food: '식비', // '음식' -> '식비'로 수정
  cafe: '카페',
  transportation: '교통',
  shopping: '쇼핑',
  comm: '통신', // 추가
  health: '의료/건강', // 추가
  culture: '문화생활', // 추가
  edu: '교육', // 추가
  household: '생활용품', // 추가
  housing: '집',
  taxes: '세금',
  insurance: '보험',
  etc: '기타',
  // 수입
  salary: '월급',
  bonus: '보너스', // '상여' -> '보너스'로 수정
  additional_income: '부수입',
  allowance: '용돈',
  interest: '금융수익', // '금융소득' -> '금융수익'으로 수정
  etc_income: '기타수입', // 추가
};
