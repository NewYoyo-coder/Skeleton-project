import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// ==========================================
// 1. 설정부
// ==========================================
const CONFIG = {
    inputFile: './transaction_db.json',  // 시드 데이터 파일명
    outputFile: './dummy_transactions.json',
    count: 3000,                         // 생성할 데이터 개수
    startDate: '2023-01-01',
    endDate: '2026-12-31'
};

// ==========================================
// 2. 카테고리 판별기 (한글 반환)
// ==========================================
function getKoreanCategory(item) {
    const type = item.transaction_type;
    const category = item.category || '';
    const shop = item.shop_name || item['행복약국'] || '';

    if (type === 'income') {
        if (category.includes('월급')) return '월급';
        if (category.includes('보너스')) return '상여';
        if (category.includes('용돈')) return '용돈';
        if (category.includes('수익') || category.includes('소득')) return '금융소득';
        return '기타 수입';
    } else {
        if (category === '식비' || category === '음식') {
            const cafeBrands = ['스타벅스', '파리바게뜨', '투썸', '이디야', '카페'];
            return cafeBrands.some(b => shop.includes(b)) ? '카페' : '음식';
        }
        if (category.includes('교통')) return '교통';
        if (category.includes('쇼핑')) return '쇼핑';
        if (category.includes('건강') || category.includes('의료')) return '건강';
        if (category.includes('집') || category.includes('생활')) return '집';
        if (category.includes('세금')) return '세금';
        if (category.includes('보험')) return '보험';
        return '기타 지출';
    }
}

// ==========================================
// 3. 리얼리티 유틸리티
// ==========================================
function getRandomDate(startStr, endStr) {
    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();
    const date = new Date(start + Math.random() * (end - start));

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function getRealisticAmount(baseAmount, type) {
    const absAmount = Math.abs(baseAmount || 0);
    let finalAmount = absAmount;

    if (absAmount >= 1000) {
        const variation = 0.9 + Math.random() * 0.2;
        finalAmount = Math.round((absAmount * variation) / 100) * 100;
    }

    return finalAmount;
}

// ==========================================
// 4. 메인 로직
// ==========================================
try {
    // ESM 환경에서 JSON을 편하게 가져오기 위해 createRequire 사용
    const data = require(CONFIG.inputFile);
    const SEED_DATA = data.transactions;

    if (!SEED_DATA || SEED_DATA.length === 0) {
        throw new Error("원본 데이터가 비어있습니다.");
    }

    console.log(`🚀 [ESM] 원본 ${SEED_DATA.length}개를 기반으로 ${CONFIG.count}개 생성 중...`);

    const generated = Array.from({ length: CONFIG.count }).map(() => {
        const seed = SEED_DATA[Math.floor(Math.random() * SEED_DATA.length)];
        const type = seed.transaction_type;

        return {
            date: getRandomDate(CONFIG.startDate, CONFIG.endDate),
            amount: getRealisticAmount(seed.amount, type),
            category: getKoreanCategory(seed),
            payment_method: seed.payment_method || 'card',
            shop_name: type === 'expense' ? (seed.shop_name || seed['행복약국'] || '기타 상점') : '',
            item_name: type === 'expense' ? (seed.item_name || '') : '',
            memo: seed.memo || '',
            transaction_type: type
        };
    });

    generated.sort((a, b) => (a.date > b.date ? 1 : -1));

    const finalData = generated.map((item, idx) => ({
        id: idx + 1,
        ...item
    }));

    fs.writeFileSync(
        CONFIG.outputFile,
        JSON.stringify({ transactions: finalData }, null, 2),
        'utf-8'
    );

    console.log(`✨ 완료! ${CONFIG.outputFile} 파일이 생성되었습니다.`);

} catch (err) {
    console.error('❌ 에러:', err.message);
}