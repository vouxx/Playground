# Implementation Plan: Core DAW Timeline

**Branch**: `001-core-daw-timeline` | **Date**: 2026-03-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-core-daw-timeline/spec.md`

## Summary

브라우저 기반 DAW의 핵심 골격을 구축한다. Canvas 2D 기반 멀티트랙 타임라인, 재생/정지 트랜스포트, 리전 생성/편집, 줌/스크롤, 기본 믹서(볼륨/팬/뮤트/솔로)를 구현하여 이후 Phase(가상 악기, 오디오 녹음, 이펙트, AI 작곡)의 기반을 마련한다.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 15 (App Router, Turbopack), Tone.js 15.x (Transport/오디오), Zustand 5.x (상태 관리), Tailwind CSS v4 (UI 스타일링)
**Storage**: 브라우저 메모리 (Phase 1 — 세션 내 상태만), Supabase는 Phase 7에서 추가
**Testing**: Vitest (단위 테스트), React Testing Library (컴포넌트 테스트)
**Target Platform**: 데스크톱 브라우저 (Chrome/Edge 최신 2버전)
**Project Type**: web-app (SPA with Next.js App Router)
**Performance Goals**: 타임라인 60fps 렌더링, 1,000개 리전에서 30fps 이상, 오디오 재생 지연 < 50ms
**Constraints**: WebGL 사용 금지 (iframe 호환성), 파일 300줄/컴포넌트 150줄/함수 50줄 제한
**Scale/Scope**: 100+ 트랙, 트랙당 50+ 리전, 10분+ 길이 프로젝트 지원

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 원칙 | 준수 여부 | 비고 |
|------|-----------|------|
| I. Audio Engine Integrity | PASS | Tone.js Transport 단일 인스턴스, 오디오 엔진은 순수 TS 모듈 |
| II. Canvas 렌더링 성능 | PASS | rAF 기반, 3-레이어(배경/콘텐츠/오버레이), 가시영역 가상화 |
| III. 모듈화 및 계층 분리 | PASS | 오디오엔진/상태/UI 3계층, 인터페이스로만 소통 |
| IV. 데이터 모델 일관성 | PASS | 직렬화 가능 객체, ID 참조, Zustand 액션으로만 변경 |
| V. 접근성 및 이중 대상 | PASS | 키보드 단축키, 직관적 드래그&드롭, 한국어 UI |
| VI. AI 통합 원칙 | N/A | Phase 1에서는 AI 미사용 |
| VII. 테스트 및 품질 기준 | PASS | Vitest로 상태/엔진 로직 테스트 |

## Project Structure

### Documentation (this feature)

```text
specs/001-core-daw-timeline/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── state-contracts.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx              # 루트 레이아웃
│   ├── globals.css             # 전역 스타일
│   └── page.tsx                # DAW 메인 페이지
├── components/
│   ├── timeline/
│   │   ├── TimelineCanvas.tsx  # Canvas 래퍼 컴포넌트
│   │   ├── TimelineToolbar.tsx # 재생/정지, BPM, 박자표 컨트롤
│   │   └── TrackHeader.tsx     # 트랙 헤더 (이름, 볼륨, 팬, 뮤트/솔로)
│   ├── mixer/
│   │   └── MixerStrip.tsx      # 믹서 채널 스트립 (Phase 1에서는 트랙 헤더에 통합)
│   └── common/
│       ├── ContextMenu.tsx     # 우클릭 컨텍스트 메뉴
│       └── Slider.tsx          # 재사용 슬라이더 컴포넌트
├── engine/
│   ├── transport.ts            # Tone.js Transport 래퍼 (재생/정지/위치)
│   ├── mixer.ts                # 볼륨/팬/뮤트/솔로 오디오 노드 관리
│   └── metronome.ts            # 메트로놈 클릭 생성
├── canvas/
│   ├── TimelineRenderer.ts     # Canvas 2D 타임라인 렌더링 엔진
│   ├── GridRenderer.ts         # 마디/박자 그리드 렌더링
│   ├── RegionRenderer.ts       # 리전 블록 렌더링
│   ├── PlayheadRenderer.ts     # 재생 헤드 렌더링
│   ├── InteractionHandler.ts   # 드래그/줌/스크롤 이벤트 처리
│   └── ViewportManager.ts      # 뷰포트 상태 (스크롤 위치, 줌 레벨)
├── store/
│   ├── useProjectStore.ts      # 프로젝트 전역 상태 (BPM, 박자표)
│   ├── useTrackStore.ts        # 트랙 CRUD, 순서, 믹서 상태
│   ├── useRegionStore.ts       # 리전 CRUD, 위치, 크기
│   ├── useTransportStore.ts    # 재생 상태, 현재 위치
│   └── useViewportStore.ts     # 줌 레벨, 스크롤 위치
├── types/
│   └── daw.ts                  # 공유 타입 정의 (Track, Region, Transport 등)
├── hooks/
│   ├── useTimeline.ts          # 타임라인 Canvas 초기화/이벤트 연결
│   ├── useTransport.ts         # 트랜스포트 제어 (재생/정지) 훅
│   └── useKeyboardShortcuts.ts # 키보드 단축키 관리
└── lib/
    ├── units.ts                # 시간 단위 변환 (틱↔마디:박자, 픽셀↔틱)
    └── snap.ts                 # 스냅 로직 (마디/박자/자유)
```

**Structure Decision**: Next.js App Router 기반 단일 프로젝트 구조. `engine/`은 오디오 엔진 계층(React 무의존), `canvas/`는 Canvas 2D 렌더링 계층, `store/`는 Zustand 상태 계층, `components/`는 React UI 계층으로 분리. Constitution 원칙 III(모듈화 및 계층 분리)을 따른다.

## Complexity Tracking

> Constitution 위반 없음 — 해당 없음
