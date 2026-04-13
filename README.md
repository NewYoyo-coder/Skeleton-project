# 💰 Skeleton-Project: Smart Ledger Architecture
> **"단순한 기록을 넘어, 당신의 금융 UX를 통제하다."**
> KB IT's Your Life 7기 29회차 2조 (전공반) - 지능형 가계부 솔루션 프로젝트
  
<img width="2979" height="1967" alt="Fram323242423vg3423232e 2" src="https://github.com/user-attachments/assets/01fe8996-cb15-4c9f-98a4-aecec03f1c30" />
    
🔗 **Live Demo (배포 버전):** [https://kbskeleton.vercel.app](https://kbskeleton.vercel.app)
🗓 **개발 기간:** 2026.04.07 ~ 2026.04.13

## 💡 The Vision (프로젝트 비전)
본 프로젝트는 부트캠프 과정을 수료하며 진행된 스켈레톤 아키텍처입니다. **"모바일 네이티브 앱 수준의 쫀득한 조작감"**, **"데이터 기반의 즉각적인 시각화"**, 그리고 **"예외 상황을 완벽히 차단하는 철통 방어 로직"**을 목표로, 사용자 경험(UX)과 개발 경험(DX) 모두를 만족시키는 가계부 서비스를 완성했습니다.

---

## ⚡ Unbeatable Core Features (5대 핵심 기능)

### 1. 사용자 맞춤 설정 및 홈 대시보드 (Personalization & Dashboard)
* **Recent Transactions:** 메인 홈 화면에 최근 거래 내역 5~7건을 동적으로 요약 배치하여 현재 자금 흐름을 즉각적으로 파악.
* **Global Theme Engine:** 사용 환경(OS)에 완벽히 스며드는 CSS Variables 기반 다크모드/라이트모드 실시간 전환 로직.

### 2. 무결점 거래 내역 관리 (Transaction Management & Validation)
* **Smart Input Form:** 수입/지출 입력 시 숫자 콤마(,) 자동 파싱 및 문자 입력 원천 차단.
* **Safe Interaction:** 필수 입력값 검증 로직 및 작성 중 이탈 방지(Confirm 가드)를 통한 데이터 유실률 0% 달성.

### 3. 지능형 통계 및 AI 리포트 (Visual Intelligence)
* **Zero-Latency Charts:** ApexCharts를 도입하여 수입/지출 비중(Double Donut) 및 직접 비교(Bar Chart) 시각화.
* **Smart AI Summary:** Pinia 전역 상태 데이터를 스캐닝하여 소비 패턴 맞춤형 금융 조언 메시지 제공.
* **Custom Calendar:** 일/주/월 단위 거래 내역 집계 및 일별 지출 여부를 점으로 표시하는 직관적 달력 뷰.

### 4. 하이브리드 탐색 및 정밀 필터링 (Hybrid Navigation)
* **Rendering Engine:** 데이터 볼륨에 따라 무한 스크롤과 페이지네이션을 전환할 수 있는 고도화된 탐색 아키텍처.
* **Multi-Dimensional Filter:** 카테고리(건강, 세금 등), 수입/지출, 날짜, 금액순을 O(N) 효율로 즉시 교차 필터링하는 엔진.

### 5. 맥락 인지형 UI/UX (Context-Aware UI)
* **Reactive Layout:** 스크롤 방향을 감지해 상단 필터가 숨는 Auto-Hide 및 실시간 월별 플로팅 배지 마이크로 인터랙션.
* **Modular Components:** `Teleport`를 활용한 레이어 독립형 날짜 선택기 모달 및 Toss 스타일의 유려한 공용 UI 시스템.

---

## 🏗️ System Workflow & Tech Stack

**[ Client ]** Vue 3 (Composition API) + Vue Router + Pinia
⬇ HTTP Request (Axios)
**[ Server ]** JSON Server (Mock DB / `db.json`)

| 분야 | 기술 스택 | 도입 명분 (Engineering Decision) |
| :--- | :--- | :--- |
| **Core Framework** | `Vue.js (Vue 3)` | 컴포넌트 기반 설계를 통한 재사용성 극대화 및 반응형 데이터 렌더링 |
| **State Logic** | `Pinia` | 상태 중앙 관리 및 일/주/월 화면 간 실시간 데이터 동기화 |
| **Data Network** | `Axios`, `JSON Server` | 프론트-백엔드 병렬 개발 파이프라인 구축 (현재 프로토타입 DB 운영) |
| **CI/CD Pipeline** | `Vercel`, `Github` | Github 연동을 통한 자동 빌드 및 호스팅 100% 무중단 배포 구현 |
| **Build & DX** | `Vite`, `VSCode` | 확장 프로그램을 통한 생산성 향상 및 초고속 HMR 로컬 개발 환경 |

---

## 👥 The Architects (핵심 기여 및 역할)

### 👑 김민준 - `팀장 / System Architecture & CI/CD`
* **CI/CD 및 인프라 개척:** Vercel 연동 호스팅 배포 및 브랜치 전략 등 전체 프로젝트 총괄 관리.
* **지능형 라우팅 시스템:** 페이지 컨텍스트에 반응하는 동적 헤더 및 미래 시간 간섭을 차단하는 라우터 가드 설계.
* **DX 혁신:** `unplugin-auto-import` 생태계 구축 및 터미널 아스키 아트/애니메이션 등 커스텀 환경 고도화.

### 📊 이석윤 - `Data Visualizer & Design System`
* **인사이트 대시보드:** ApexCharts 생명주기를 Vue 3에 동기화시킨 차트 리포트 및 메인 화면 플로우 개발.
* **UI 컴포넌트 표준화:** 헤더바 구성 요소 배치 및 직관적인 공용 버튼/타이포그래피 가이드라인 확립.
* **실시간 데이터 바인딩:** 유저 날짜 선택 이벤트를 Pinia에 즉시 커밋하여 화면 전체 상태를 동기화하는 로직 완성.

### 🎨 이유경 - `UX/UI Detailer & Transaction Logic`
* **트랜잭션 라이프사이클 설계:** 거래 데이터 추가 기능 및 폼 입력 전 과정을 관통하는 무결점 유효성 검사 적용.
* **인프라 셋업 기여:** 협업을 위한 깃 환경 구축 및 Axios, Vue Proxy Server 기본 세팅 리드.
* **데이터 스키마 정립:** 건강, 세금, 월급 등 필수 카테고리 명칭을 표준화하여 DB 공통 스키마 구조 개선.

### 🔍 최지혜 - `Data Engineer & Navigation`
* **하이브리드 탐색 엔진:** 대규모 거래 내역을 지연 없이 렌더링하는 무한 스크롤 및 정밀 페이지네이션 전환 시스템 구축.
* **다차원 검색 알고리즘:** 날짜, 금액, 카테고리를 O(N) 효율로 즉시 교차 필터링하는 고성능 하이브리드 필터링 엔진 탑재.
* **모듈 아키텍처:** 거래 내역 상세 조회 및 수정/삭제 모달 창을 완벽히 분리하여 컴포넌트 재사용성 확보.

### 🛡️ 허강상 - `System Security & Responsiveness`
* **크로스 플랫폼 테마 엔진:** 사용자 디바이스 OS 설정에 완벽히 스며드는 다크/라이트 모드 시스템(CSS Variables) 렌더링.
* **반응형 제어 및 플로팅 UI:** 스크롤 방향 감지 상단 필터 Auto-Hide 및 상하단 퀵 점프, 실시간 월별 배지 구현.
* **상태 라이프사이클 보안:** 프로필 설정 관리, Pinia 스토어 CRUD 반응성 개선 및 로그아웃 시 데이터 초기화 셧다운 프로세스 확립.

---

## 🚀 Quick Start (로컬 실행 가이드)

> 💡 **Notice:** 현재 서비스는 `Vercel`을 통해 [라이브 배포](https://kbskeleton.vercel.app) 중입니다. 로컬 환경 테스트 시 아래 명령어를 사용하세요.

```bash
# 1. 의존성 설치
npm install

# 2. 클라이언트 및 JSON Server 동시 실행
npm start
```

---
© 2026 **KB IT's Your Life 7기 29회차 2조**. Engineered for Excellence.
