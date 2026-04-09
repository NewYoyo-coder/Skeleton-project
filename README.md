# 🚀 Skeleton Project (가계부 서비스 앱)

Vue 3와 JSON Server를 기반으로 구축된 가계부 관리 프로젝트입니다.

팀 협업을 통해 기능 분리, 상태 관리 최적화, 그리고 다크 모드 UI를 구현했습니다.

---

## 🛠️ 시작하기 (Quick Start)

### ⚡ One-liner (그대로 복붙 실행)

```bash
npm install ; npm start
```
### 💡 Tip (캐시 문제나 꼬였을 때)

```bash

rm -rf node_modules package-lock.json ; npm install
```
---

## 📌 핵심 기능

### 1. 거래 내역 관리 (Transactions)

* **CRUD 구현**: 입출금 내역의 추가, 조회, 수정, 삭제 기능 완비
* **필터링 및 정렬**

  * 기간별 (날짜 선택)
  * 카테고리별 (예: 건강 등)
* **페이지네이션**: 대량 데이터 효율 처리
* **데이터 검증**

  * 숫자 콤마 자동 포함
  * 문자 입력 제한 등 UX 개선

---

### 2. 대시보드 및 UI

* **요약 카드**: 총 수입/지출 시각화
* **테마 모드**

  * 다크 모드 / 라이트 모드 전환
  * CSS 변수 기반 구현
* **반응형 디자인**

  * Bootstrap 5
  * FontAwesome 활용

---

### 3. 상태 관리 및 로직

* **Pinia**

  * 전역 상태 관리
  * CRUD 비동기 로직 구성
  * Watch / Mount 기반 반응성 개선

* **Axios**

  * JSON Server 연동
  * 실시간 데이터 처리 및 비동기 통신

---

## 📂 기술 스택

| 분류               | 기술 스택                                |
| ---------------- | ------------------------------------ |
| Frontend         | Vue 3 (Composition API), Vite        |
| State Management | Pinia                                |
| Routing          | Vue Router                           |
| HTTP Client      | Axios (JSON Server 연동)               |
| Styling          | Bootstrap 5, FontAwesome, Custom CSS |
| Dev Tools        | concurrently, Vite Proxy             |

---

## 📅 주요 업데이트 기록 (Changelog)

### 2026-04-09

* 기능 통합: 메인 대시보드 병합, npm 패키지 획일화 및 로직 통일
* 로직 개선: 시작 화면 비동기 로직 개선, Pinia CRUD 반응성 강화
* UI/UX: 다크모드 변수 설정 및 디자인 디테일 수정
* 정리: 중복 파일 제거, 불필요 CSS/Test 파일 정리
* 기타

  * 터미널 아스키 아트
  * 벚꽃 애니메이션
  * 단축키 기능 (`initShortcuts`) 추가

### 2026-04-08

* 디자인: `add-transaction.vue` 신규 UI 적용
* 기능: 수정/삭제 모달 추가
* 컴포넌트

  * 헤더 스타일 개선
  * 대시보드 요약 카드
  * 고정 버튼 (+) 구현
* 데이터

  * `db.json` 통합
  * 카테고리 확장 (건강 등)

### 2026-04-07

* 초기 설정: 프로젝트 구조 및 브랜치 구성
* 기능 초안: 거래 내역 필터링
* 서버: JSON Server 연동 및 Vite Proxy 설정

---

## ⌨️ 개발 가이드

* **Frontend**: http://localhost:5173
* **Mock DB**: http://localhost:3000

### DB 관리

* `db.json` 파일을 통해 초기 데이터 및 카테고리 직접 관리

### ⚠️ 주의 사항

* 스타일 충돌 방지를 위해 `main.css` 내 주석 및 테마 변수 확인 필수

---

© 2026 NewYoyo-coder Team. All rights reserved.
