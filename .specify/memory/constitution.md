<!--
  Sync Impact Report
  - Version change: 0.0.0 → 1.0.0 (initial ratification)
  - Added principles: I–VII (all new)
  - Added sections: Technical Constraints, Development Workflow
  - Templates requiring updates:
    - .specify/templates/plan-template.md ✅ no changes needed (generic)
    - .specify/templates/spec-template.md ✅ no changes needed (generic)
    - .specify/templates/tasks-template.md ✅ no changes needed (generic)
    - .specify/templates/commands/*.md ✅ no changes needed (agent-generic)
  - Follow-up TODOs: none
-->

# Playground Constitution

## Core Principles

### I. Audio Engine Integrity (NON-NEGOTIABLE)

Web Audio API는 실시간 오디오 처리의 근간이다. 오디오 그래프의 안정성이 모든 기능보다 우선한다.

- 오디오 컨텍스트(AudioContext)는 앱 전체에서 단일 인스턴스로 관리 MUST
- 오디오 노드 연결/해제 시 클릭/팝 노이즈 방지를 위한 페이드 처리 MUST
- 재생 중 UI 조작이 오디오 스트림을 끊거나 지연시키면 안 됨 (오디오 스레드 우선)
- Tone.js를 1차 추상화 레이어로 사용하되, 성능 병목 시 AudioWorklet으로 대체 가능해야 함
- 샘플 로딩/디코딩은 비동기로 처리하고 UI를 블로킹하지 않아야 함

### II. Canvas 렌더링 성능 (NON-NEGOTIABLE)

타임라인, 파형, 피아노롤 등 시각적 핵심 요소는 Canvas 2D로 렌더링한다.

- Canvas 렌더링은 requestAnimationFrame 기반 MUST, setInterval/setTimeout 금지
- 가시 영역(viewport)만 렌더링하는 가상화(virtualization) MUST 적용
- 렌더링 레이어 분리: 정적 배경(그리드) / 동적 콘텐츠(리전, 파형) / 오버레이(커서, 선택) MUST
- 60fps 유지가 기본 목표이며, 복잡한 씬에서도 30fps 이하로 떨어지면 안 됨
- DOM과 Canvas 간 이벤트 좌표 변환은 중앙화된 유틸리티로 처리 MUST

### III. 모듈화 및 계층 분리 (MANDATORY)

DAW는 복잡한 시스템이므로 명확한 계층 구조가 생존 조건이다.

- **오디오 엔진 계층**: Tone.js/Web Audio 래퍼, 스케줄링, 트랜스포트 제어
- **상태 계층**: Zustand 스토어, 프로젝트 데이터 모델, undo/redo
- **UI 계층**: React 컴포넌트, Canvas 렌더러, 사용자 인터랙션
- 각 계층은 인터페이스(TypeScript 타입)로만 소통하며 직접 참조 금지
- 오디오 엔진은 UI 프레임워크(React)에 의존하면 안 됨 — 순수 TypeScript 모듈로 작성
- 하나의 파일이 두 계층 이상의 책임을 가지면 안 됨

### IV. 데이터 모델 일관성 (MANDATORY)

프로젝트 데이터(트랙, 리전, MIDI 노트 등)는 단일 진실 원천(Single Source of Truth)을 따른다.

- 모든 프로젝트 데이터는 직렬화 가능한(serializable) 순수 객체로 표현 MUST
- ID 기반 참조 사용 MUST (객체 참조 금지 — 순환 참조 방지)
- 상태 변경은 반드시 Zustand 액션을 통해서만 수행 (직접 mutation 금지)
- Undo/Redo를 위한 불변 상태 패턴 MUST 적용
- MIDI 데이터는 틱(tick) 기반 절대 시간으로 저장, UI에서만 마디/박자로 변환

### V. 접근성 및 이중 대상 (MANDATORY)

초보자와 전문가 모두를 위한 도구이므로, 복잡성을 점진적으로 노출한다.

- 기본 뷰는 단순하게, 고급 기능은 명시적 조작(패널 열기, 단축키)으로 접근
- 모든 주요 동작은 키보드 단축키 지원 MUST
- 드래그&드롭, 더블클릭 등 직관적 인터랙션 우선
- 한국어 UI 기본, 영문 전환 고려한 i18n 구조
- 오디오 작업 중 시각적 피드백(미터, 파형, 재생 헤드) MUST 실시간 표시

### VI. AI 통합 원칙

AI 작곡 기능은 사용자의 창작을 보조하는 도구이지, 대체하는 것이 아니다.

- AI 생성 결과는 반드시 MIDI/오디오 데이터로 변환되어 사용자가 편집 가능해야 함
- AI 요청/응답은 비동기로 처리하며, 생성 중에도 DAW 조작이 가능해야 함
- AI 모델/API는 어댑터 패턴으로 추상화하여 교체 가능해야 함
- 생성 결과에 대한 undo/redo MUST 지원
- 네트워크 실패 시 graceful degradation — AI 없이도 DAW 기본 기능은 동작 MUST

### VII. 테스트 및 품질 기준

핵심 로직의 신뢰성은 자동화된 테스트로 보장한다.

- 오디오 엔진 로직(스케줄링, 트랜스포트, 믹싱 계산) 단위 테스트 MUST
- 상태 관리(Zustand 액션, undo/redo) 단위 테스트 MUST
- Canvas 렌더링은 스냅샷 테스트 또는 수동 검증 (자동화 비용 대비 효과 고려)
- 의미 없는 테스트 작성 금지 — 비즈니스 로직과 데이터 변환에 집중
- 오디오 재생 관련 통합 테스트는 Web Audio API mock 사용

## Technical Constraints

- **프레임워크**: Next.js 15 (App Router, Turbopack), TypeScript strict mode
- **오디오**: Tone.js + Web Audio API (AudioWorklet 확장 가능)
- **렌더링**: Canvas 2D (WebGL 사용 금지 — iframe 호환성)
- **상태 관리**: Zustand (슬라이스 패턴, immer 미들웨어 허용)
- **스타일링**: Tailwind CSS v4 (UI 컴포넌트), Canvas는 직접 드로잉
- **저장소**: Supabase (프로젝트 저장/공유/인증)
- **악보 렌더링**: OpenSheetMusicDisplay 또는 VexFlow (Phase 5에서 결정)
- **AI**: 어댑터 패턴으로 추상화, 구체적 모델은 Phase 6에서 결정
- **파일 크기 제한**: 컴포넌트 150줄, 함수 50줄, 파일 300줄 초과 금지
- **브라우저 지원**: Chrome/Edge 최신 2버전 (Web Audio API 완전 지원 기준)

## Development Workflow

- **Spec-Driven Development**: 기능 추가/변경 시 spec → plan → tasks → implement 순서 준수
- **Phase 단위 개발**: 각 Phase는 독립적으로 배포 가능한 상태를 유지
- **코드 작성 전 설계 선행**: 요구사항 분석 → 아키텍처 설계 → 재사용 검토 → 승인 → 구현
- **한국어 보고**: 모든 설명, 분석, 설계, 보고는 한국어로 작성 (코드/변수명 제외)
- **커밋 단위**: 태스크 단위 또는 논리적 그룹 단위로 커밋
- **브랜치 전략**: spec-kit의 자동 브랜치 생성을 따름

## Governance

- 본 Constitution은 모든 개발 관행에 우선한다
- 원칙 수정 시 반드시 문서화 + 버전 업데이트 + 영향 범위 분석 필수
- Constitution 위반이 필요한 경우, Complexity Tracking에 사유와 대안 거부 이유를 명시해야 함
- 모든 PR/코드 리뷰는 Constitution 준수 여부를 검증해야 함
- CLAUDE.md의 기존 규칙과 충돌 시, 더 엄격한 쪽을 따른다

**Version**: 1.0.0 | **Ratified**: 2026-03-31 | **Last Amended**: 2026-03-31
