@AGENTS.md

# Playground — 비트 메이커 (Beat Maker)

드래그&드롭 스타일의 비트 메이커. 스텝 시퀀서 → 패드 → 피아노롤 → DAW 순으로 확장.

## Tech Stack

- Next.js 15 (App Router, Turbopack)
- TypeScript
- Tone.js (Web Audio API)
- Tailwind CSS v4
- Zustand (상태 관리)
- Supabase (Phase 2 — 패턴 저장/공유)

## Workflow

- 기능 추가/변경 시 `docs` 문서 먼저 업데이트 → 승인 → 구현
- 5-file pattern: `docs/spec.md`, `docs/plan.md`, `docs/tasks.md`, `docs/findings.md`, `docs/progress.md`
- Phase 상태: ⏸️ 대기 → 🔄 진행 중 → ✅ 완료
- 오류 발생 시 `docs/findings.md`에 즉시 기록
- 세션 시작 시 `docs/progress.md`의 5-Question Reboot Check로 컨텍스트 복구

---

# STRICT SENIOR ENGINEERING SYSTEM (MANDATORY)

## 0. Core Principle

- 임의로 결정하지 않는다
- 요구사항이 불명확하면 추측하지 않는다
- 기존 패턴을 우선한다
- 창의성보다 일관성을 우선한다

## 1. Mandatory Workflow (CRITICAL)

### 1.1 Plan 모드 → Edit 모드 (CRITICAL)

모든 작업은 반드시 **Plan 모드**에서 시작한다:

1. Plan 모드: 요구사항 분석 → 설계 → 검증 → 사용자 승인
2. Edit 모드: 승인 후에만 전환하여 코드 작성

**승인 없이 코드 작성 = 규칙 위반**

### 1.2 코드부터 작성 금지

반드시 아래 순서를 따른다:

1. 요구사항 분석
2. 기존 코드 패턴 분석
3. 구현 방식 제안
4. 설계 검증 + 사용자 승인
5. 이후 코드 작성

### 1.3 설계 선행 (REQUIRED)

코드 작성 전에 반드시 아래를 먼저 출력한다:

1) **요구사항 분석**: 무엇을 만드는지, 입력/출력, 엣지 케이스
2) **아키텍처 설계**: 필요한 컴포넌트/모듈, 로직 위치 (UI / Hook / Service)
3) **재사용 검토**: 재사용 가능한 기존 코드 목록, 없다면 그 이유 명시

### 1.4 자기 검증 (필수)

코드 작성 전에 반드시 확인:

- 기존 구조와 일관적인가?
- 불필요한 추상화는 없는가?
- 로직 위치가 적절한가?

통과 후에만 코드 작성 가능

## 2. Frontend (Next.js)

### 2.1 컴포넌트 구조

- 단일 책임 원칙 준수
- UI와 비즈니스 로직 분리 필수
- **Presentational**: UI만 담당, 로직/API 금지
- **Container**: 상태/로직/데이터 처리

### 2.2 컴포넌트 분리 기준 (강제)

다음 중 하나라도 해당 시 분리:

- JSX 50줄 초과
- UI 블록 3개 이상
- 조건부 렌더링 2개 이상
- map/리스트 렌더링 존재
- 반복 UI 존재

### 2.3 과분리 방지

- 단순 UI는 분리 금지
- props drilling 발생 시 구조 재검토

### 2.4 Hooks

- 모든 비즈니스 로직은 custom hook으로 분리

### 2.5 API 규칙

- 컴포넌트 내부 API 호출 금지

### 2.6 상태 관리

- local state 우선
- 필요할 때만 global state 사용

### 2.7 금지

- 하나의 파일에 여러 컴포넌트
- UI + 로직 혼합
- JSX 내부 복잡 로직

## 3. Backend

### 3.1 구조 (강제)

Controller → Service → Repository

- Controller: 요청/응답만
- Service: 비즈니스 로직
- Repository: DB 처리

### 3.2 금지

- Controller에 로직 작성 금지
- DB 접근 금지
- 레이어 혼합 금지

### 3.3 검증

- 모든 입력값 validation 필수
- 모든 async 에러 처리 필수

## 4. Senior-Level Behavior (핵심)

### 4.1 선택 근거 제시 (MANDATORY)

- 구현 방식 선택 이유 설명
- 가능한 대안 간단 비교

### 4.2 Trade-off 명시

- 성능 / 가독성 / 확장성 중 무엇을 선택했는지 명확히

### 4.3 방어적 코딩

- null / undefined / 빈값 처리 필수

### 4.4 중복 제거

- 동일 로직 반복 금지

### 4.5 예측 가능한 코드

- 숨겨진 동작 금지
- 사이드 이펙트 최소화

## 5. 코드 길이 제한 (강제)

- 파일: 300줄 초과 금지
- 컴포넌트: 150줄 초과 금지
- 함수: 50줄 초과 금지
- 초과 시 책임 기준으로 반드시 분리

## 6. Performance Rules (MANDATORY)

### Frontend

- 불필요한 re-render 방지, useMemo/useCallback 필요 시 사용
- props 변경 최소화, derived state 최소화
- 중복 요청 방지, 캐싱 전략 고려

### Backend

- N+1 문제 방지, 필요한 데이터만 조회
- 불필요한 반복 금지, pagination 필수
- 병렬 처리 우선, 불필요한 await 금지

### 기준

- 가독성 우선, 병목 예상 시 최적화 필수

## 7. Testing Rules (MANDATORY)

- 핵심 로직 반드시 테스트 작성
- 대상: 비즈니스 로직, 데이터 처리, 에러 처리
- 케이스: 정상 / 엣지 / 실패 포함
- 독립 실행 가능, 외부 의존성 mock 처리
- 프론트: 주요 UI 흐름 + 사용자 인터랙션 테스트
- 백엔드: Service 단위 테스트 + API 테스트
- 의미 없는 테스트 작성 금지

## 8. Hard Constraints

- 추측 금지: 불명확하면 반드시 질문
- 패턴 강제: 기존 코드 패턴 그대로 사용
- 영향 최소화: 관련 없는 코드 수정 금지

## 9. 출력 규칙 (CRITICAL)

항상 아래 순서로 출력:

1. 요구사항 분석
2. 설계 / 구현 계획
3. 선택 근거 및 Trade-off
4. 코드

코드 먼저 출력 = 규칙 위반

## 10. Definition of Done

아래 조건을 모두 만족해야 완료:

- 요구사항 충족
- 구조 규칙 준수
- 성능 문제 없음
- 테스트 코드 포함
- 가독성 확보

하나라도 미충족 시 완료 아님

## 11. UI / Publishing Rules (MANDATORY)

- 디자인 시스템 우선 사용, 임의 스타일 금지
- Tailwind만 사용, 중복 class 금지, 하드코딩 값 최소화
- semantic tag 사용, div 남용 금지, DOM depth 최소화
- 일관된 typography/spacing scale, 임의 값 금지
- hover / active / disabled 필수, loading / empty / error UI 필수
- mobile-first, breakpoint 일관성 유지
- aria-label 필요 시 사용, 키보드 접근 가능
- div 버튼 금지, label 없는 input 금지

## 12. 한국어 보고 규칙 (MANDATORY)

- 모든 설명, 분석, 설계, 보고는 반드시 한국어로 작성한다
- 영어 사용 금지 (코드, 변수명, 라이브러리 제외)
- 출력 규칙 (요구사항 분석, 설계 등)도 모두 한국어로 작성

## 13. Goal

- 시니어 엔지니어 수준의 판단과 코드 품질 유지
- 유지보수 가능하고 예측 가능한 구조
- 일관성과 확장성 확보

## Active Technologies
- TypeScript 5.x (strict mode) + Next.js 15 (App Router, Turbopack), Tone.js 15.x (Transport/오디오), Zustand 5.x (상태 관리), Tailwind CSS v4 (UI 스타일링) (001-core-daw-timeline)
- 브라우저 메모리 (Phase 1 — 세션 내 상태만), Supabase는 Phase 7에서 추가 (001-core-daw-timeline)

## Recent Changes
- 001-core-daw-timeline: Added TypeScript 5.x (strict mode) + Next.js 15 (App Router, Turbopack), Tone.js 15.x (Transport/오디오), Zustand 5.x (상태 관리), Tailwind CSS v4 (UI 스타일링)
