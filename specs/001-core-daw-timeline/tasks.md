# Tasks: Core DAW Timeline

**Input**: Design documents from `/specs/001-core-daw-timeline/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/state-contracts.md, quickstart.md

**Tests**: 핵심 로직(store 액션, 단위 변환, 스냅)에 대한 단위 테스트 포함 (Constitution VII 준수)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root (Next.js App Router)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 프로젝트 구조 초기화, 기존 비트메이커 코드 정리, 핵심 의존성 설치

- [x] T001 기존 비트메이커 소스 코드 제거 및 빈 프로젝트 구조 생성 (`src/app/`, `src/components/`, `src/engine/`, `src/canvas/`, `src/store/`, `src/types/`, `src/hooks/`, `src/lib/`)
- [x] T002 Tone.js, Vitest, React Testing Library 등 의존성 설치 (`package.json`)
- [x] T003 [P] 공유 타입 정의 작성 (`src/types/daw.ts` — Project, Track, MixerState, Region, TrackType)
- [x] T004 [P] 시간 단위 변환 유틸리티 작성 (`src/lib/units.ts` — tickToBar, barToTick, tickToPixel, pixelToTick, tickToTimeString)
- [x] T005 [P] 스냅 로직 유틸리티 작성 (`src/lib/snap.ts` — snapToGrid, getSnapResolution by zoom level)
- [x] T006 [P] units.ts 단위 테스트 작성 (`src/lib/__tests__/units.test.ts`)
- [x] T007 [P] snap.ts 단위 테스트 작성 (`src/lib/__tests__/snap.test.ts`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 User Story가 의존하는 Zustand 스토어와 오디오 엔진 기반 구축

- [x] T008 useProjectStore 구현 (`src/store/useProjectStore.ts` — id, name, bpm, timeSignature, trackOrder, setBpm, setTimeSignature, reorderTracks)
- [x] T009 [P] useTrackStore 구현 (`src/store/useTrackStore.ts` — tracks CRUD, setVolume, setPan, toggleMute, toggleSolo)
- [x] T010 [P] useRegionStore 구현 (`src/store/useRegionStore.ts` — regions CRUD, moveRegion, resizeRegion, getRegionsByTrack)
- [x] T011 [P] useTransportStore 구현 (`src/store/useTransportStore.ts` — isPlaying, currentTick, play, stop, setPosition, toggleMetronome)
- [x] T012 [P] useViewportStore 구현 (`src/store/useViewportStore.ts` — scrollX, scrollY, pixelsPerTick, zoomIn, zoomOut, selectRegion, deselectAll)
- [x] T013 Transport 오디오 엔진 래퍼 구현 (`src/engine/transport.ts` — Tone.Transport 초기화, play/stop/위치 동기화, BPM 동기화)
- [x] T014 [P] 메트로놈 엔진 구현 (`src/engine/metronome.ts` — Tone.js로 클릭 생성, Transport 스케줄링, on/off 토글)
- [x] T015 [P] 믹서 엔진 구현 (`src/engine/mixer.ts` — 트랙별 Gain/Panner 노드 생성/연결/해제, 뮤트/솔로 로직)
- [x] T016 [P] useProjectStore 단위 테스트 (`src/store/__tests__/useProjectStore.test.ts`)
- [x] T017 [P] useTrackStore 단위 테스트 (`src/store/__tests__/useTrackStore.test.ts`)
- [x] T018 [P] useRegionStore 단위 테스트 (`src/store/__tests__/useRegionStore.test.ts`)
- [x] T019 [P] useTransportStore 단위 테스트 (`src/store/__tests__/useTransportStore.test.ts`)

**Checkpoint**: 스토어와 오디오 엔진 기반 완성 — User Story 구현 가능

---

## Phase 3: User Story 1 - 타임라인에서 트랙 생성 및 재생 (Priority: P1)

**Goal**: 빈 타임라인에서 트랙 추가 → 재생/정지 → 재생 헤드 이동까지 동작

**Independent Test**: 앱을 열고 트랙 추가 후 재생/정지로 재생 헤드가 움직이고 멈추는 것 확인

### Implementation for User Story 1

- [x] T020 [US1] DAW 메인 페이지 레이아웃 작성 (`src/app/page.tsx` — 툴바 + 트랙 헤더 영역 + 타임라인 Canvas 영역 배치)
- [x] T021 [US1] 루트 레이아웃 교체 (`src/app/layout.tsx` — DAW용 전체 화면 레이아웃, 다크 테마 기본)
- [x] T022 [US1] ViewportManager 구현 (`src/canvas/ViewportManager.ts` — 뷰포트 상태 관리, 틱↔픽셀 변환 위임)
- [x] T023 [US1] GridRenderer 구현 (`src/canvas/GridRenderer.ts` — 마디/박자 그리드선, 줌 레벨별 눈금 밀도, 마디 번호 표시)
- [x] T024 [US1] PlayheadRenderer 구현 (`src/canvas/PlayheadRenderer.ts` — 재생 헤드 수직선 렌더링, rAF 기반 위치 업데이트)
- [x] T025 [US1] TimelineRenderer 통합 (`src/canvas/TimelineRenderer.ts` — 3-레이어 Canvas 관리, GridRenderer + PlayheadRenderer 조합, 렌더 루프)
- [x] T026 [US1] TimelineCanvas 컴포넌트 작성 (`src/components/timeline/TimelineCanvas.tsx` — Canvas 요소 마운트, TimelineRenderer 초기화, 크기 반응형)
- [x] T027 [US1] TrackHeader 컴포넌트 작성 (`src/components/timeline/TrackHeader.tsx` — 트랙 이름, 볼륨 슬라이더, 팬 노브, 뮤트/솔로 버튼)
- [x] T028 [US1] TimelineToolbar 컴포넌트 작성 (`src/components/timeline/TimelineToolbar.tsx` — 재생/정지 버튼, BPM 입력, 박자표 선택, 위치 표시기, 메트로놈 토글)
- [x] T029 [US1] useTransport 훅 작성 (`src/hooks/useTransport.ts` — engine/transport.ts + useTransportStore 연결, play/stop 액션)
- [x] T030 [US1] useTimeline 훅 작성 (`src/hooks/useTimeline.ts` — Canvas ref 받아 TimelineRenderer 초기화, 스토어 구독하여 렌더링 트리거)
- [x] T031 [US1] 재생 헤드 rAF 루프 연결 (`src/canvas/PlayheadRenderer.ts` + `src/hooks/useTransport.ts` — Tone.Transport.seconds 읽어 currentTick 동기화)

**Checkpoint**: 트랙 추가 → 재생 → 재생 헤드 이동 → 정지 동작 확인

---

## Phase 4: User Story 2 - 리전 생성 및 배치 (Priority: P2)

**Goal**: 더블클릭으로 리전 생성, 드래그로 이동, 리사이즈, Delete로 삭제

**Independent Test**: 타임라인에서 더블클릭 → 리전 생성 → 드래그 이동 → 리사이즈 → Delete 삭제

### Implementation for User Story 2

- [x] T032 [US2] RegionRenderer 구현 (`src/canvas/RegionRenderer.ts` — 리전 블록 렌더링, 트랙 색상 적용, 선택 상태 하이라이트, 리사이즈 핸들)
- [x] T033 [US2] InteractionHandler 구현 (`src/canvas/InteractionHandler.ts` — mousedown/mousemove/mouseup 이벤트 처리, 히트 테스트, 모드 결정(이동/리사이즈/선택))
- [x] T034 [US2] 더블클릭 리전 생성 연결 (`src/canvas/InteractionHandler.ts` — dblclick → useRegionStore.addRegion, 빈 영역 히트 테스트)
- [x] T035 [US2] 리전 드래그 이동 구현 (`src/canvas/InteractionHandler.ts` — 드래그 시 snap 적용, useRegionStore.moveRegion 호출, 트랙 간 이동 포함)
- [x] T036 [US2] 리전 리사이즈 구현 (`src/canvas/InteractionHandler.ts` — 좌우 핸들 드래그, snap 적용, useRegionStore.resizeRegion 호출)
- [x] T037 [US2] 리전 선택 및 삭제 구현 (`src/canvas/InteractionHandler.ts` — 클릭 선택, useViewportStore.selectRegion, Delete 키 → useRegionStore.removeRegion)
- [x] T038 [US2] TimelineRenderer에 RegionRenderer 통합 (`src/canvas/TimelineRenderer.ts` — 콘텐츠 레이어에 리전 렌더링 추가)

**Checkpoint**: 리전 CRUD + 드래그/리사이즈가 스냅에 맞춰 동작

---

## Phase 5: User Story 3 - 줌 및 스크롤 (Priority: P3)

**Goal**: 마우스 휠 가로 스크롤, Cmd+휠 줌, 세로 스크롤, 재생 중 자동 스크롤

**Independent Test**: 마우스 휠로 스크롤 + Cmd+휠로 줌 인/아웃 → 그리드 눈금 변화 확인

### Implementation for User Story 3

- [x] T039 [US3] 가로 스크롤 구현 (`src/canvas/InteractionHandler.ts` — wheel 이벤트 → useViewportStore.setScrollX)
- [x] T040 [US3] 줌 인/아웃 구현 (`src/canvas/InteractionHandler.ts` — Cmd+wheel → useViewportStore.zoomIn/zoomOut, 마우스 위치 기준 줌)
- [x] T041 [US3] 세로 스크롤 구현 (`src/components/timeline/TrackHeader.tsx` 영역 + Canvas 영역 동기화 — useViewportStore.setScrollY)
- [x] T042 [US3] 줌 레벨별 그리드 눈금 적응 (`src/canvas/GridRenderer.ts` — pixelsPerTick에 따라 마디→박자→세분 전환)
- [x] T043 [US3] 재생 중 자동 스크롤 구현 (`src/hooks/useTimeline.ts` — 재생 헤드가 뷰포트 우측 80% 지점 도달 시 scrollX 자동 갱신)

**Checkpoint**: 줌/스크롤이 부드럽게 동작하고 재생 중 자동 추적

---

## Phase 6: User Story 4 - 기본 믹서 (Priority: P4)

**Goal**: 볼륨/팬/뮤트/솔로가 오디오 엔진에 반영되고 UI에 실시간 표시

**Independent Test**: 트랙 볼륨/팬 조절 후 재생하여 소리 변화 확인 (메트로놈 기반), 뮤트/솔로 토글

### Implementation for User Story 4

- [x] T044 [US4] Slider 공용 컴포넌트 작성 (`src/components/common/Slider.tsx` — 수직/수평, dB 표시, 드래그 조작)
- [x] T045 [US4] TrackHeader 볼륨/팬 연결 (`src/components/timeline/TrackHeader.tsx` — Slider + useTrackStore.setVolume/setPan)
- [x] T046 [US4] TrackHeader 뮤트/솔로 버튼 연결 (`src/components/timeline/TrackHeader.tsx` — useTrackStore.toggleMute/toggleSolo)
- [x] T047 [US4] 믹서 엔진 ↔ 스토어 동기화 훅 작성 (`src/hooks/useMixer.ts` — useTrackStore 구독하여 engine/mixer.ts의 Gain/Panner 노드 값 실시간 반영)
- [x] T048 [US4] 솔로 로직 구현 (`src/engine/mixer.ts` — 솔로 활성 트랙이 있으면 나머지 뮤트, 솔로가 뮤트보다 우선)

**Checkpoint**: 볼륨/팬/뮤트/솔로가 오디오 출력에 실시간 반영

---

## Phase 7: User Story 5 - 트랙 관리 (Priority: P5)

**Goal**: 트랙 이름 변경, 복제, 삭제, 색상 변경, 순서 변경

**Independent Test**: 트랙 우클릭 메뉴로 이름/색상 변경, 드래그로 순서 변경

### Implementation for User Story 5

- [x] T049 [US5] ContextMenu 공용 컴포넌트 작성 (`src/components/common/ContextMenu.tsx` — 위치 계산, 외부 클릭 닫기, 메뉴 아이템 렌더링)
- [x] T050 [US5] 트랙 헤더 컨텍스트 메뉴 연결 (`src/components/timeline/TrackHeader.tsx` — 우클릭 → ContextMenu 표시, 이름 변경/복제/삭제/색상 변경 액션)
- [x] T051 [US5] 트랙 이름 변경 인라인 편집 구현 (`src/components/timeline/TrackHeader.tsx` — 더블클릭 또는 메뉴 → input으로 전환, Enter/Blur로 확정)
- [x] T052 [US5] 트랙 색상 선택기 구현 (`src/components/timeline/TrackHeader.tsx` — 프리셋 색상 팔레트에서 선택, useTrackStore.updateTrack)
- [x] T053 [US5] 트랙 순서 드래그 구현 (`src/components/timeline/TrackHeader.tsx` — 드래그 시 useProjectStore.reorderTracks 호출, 드롭 위치 시각적 표시)
- [x] T054 [US5] 트랙 삭제 확인 다이얼로그 (`src/components/timeline/TrackHeader.tsx` — 삭제 시 리전 포함 경고, useTrackStore.removeTrack + useRegionStore에서 관련 리전 제거)

**Checkpoint**: 트랙 관리 기능 전체 동작

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: 키보드 단축키, 성능 최적화, 전역 스타일

- [x] T055 [P] useKeyboardShortcuts 훅 작성 (`src/hooks/useKeyboardShortcuts.ts` — Space: 재생/정지, Delete: 리전 삭제, Cmd+Z: undo 준비, Home: 처음으로)
- [x] T056 [P] 글로벌 CSS 정리 (`src/app/globals.css` — DAW 다크 테마, Canvas 영역 스타일, 스크롤바 커스텀)
- [x] T057 Canvas 렌더링 성능 최적화 (`src/canvas/TimelineRenderer.ts` — dirty flag로 불필요한 재렌더 방지, 가시영역만 렌더링 검증)
- [x] T058 [P] quickstart.md 시나리오 수동 검증 수행 및 결과 기록

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on T001~T005 (types, utils) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 completion — core timeline
- **US2 (Phase 4)**: Depends on Phase 3 (needs timeline + track rendering) — regions
- **US3 (Phase 5)**: Depends on Phase 3 (needs timeline rendering) — can parallel with US2
- **US4 (Phase 6)**: Depends on Phase 2 (engine/mixer) — can parallel with US2/US3
- **US5 (Phase 7)**: Depends on Phase 3 (needs TrackHeader) — can parallel with US2/US3/US4
- **Polish (Phase 8)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Phase 2 완료 후 시작, 다른 스토리에 의존 없음
- **US2 (P2)**: US1 완료 후 시작 (타임라인 렌더링 필요)
- **US3 (P3)**: US1 완료 후 시작, US2와 병렬 가능
- **US4 (P4)**: Phase 2 완료 후 시작, US1과 병렬 가능 (엔진만 필요)
- **US5 (P5)**: US1 완료 후 시작, US2/US3/US4와 병렬 가능

### Within Each User Story

- Models/types before renderers
- Renderers before components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- Phase 1: T003, T004, T005, T006, T007 모두 병렬
- Phase 2: T008~T012 스토어 병렬, T013~T015 엔진 병렬, T016~T019 테스트 병렬
- Phase 3 이후: US3, US4, US5는 US1 완료 후 병렬 가능

---

## Parallel Example: Phase 2 (Foundational)

```bash
# 스토어 5개 병렬 작성:
Task: "useProjectStore in src/store/useProjectStore.ts"
Task: "useTrackStore in src/store/useTrackStore.ts"
Task: "useRegionStore in src/store/useRegionStore.ts"
Task: "useTransportStore in src/store/useTransportStore.ts"
Task: "useViewportStore in src/store/useViewportStore.ts"

# 엔진 3개 병렬 작성 (스토어 완료 후):
Task: "transport engine in src/engine/transport.ts"
Task: "metronome engine in src/engine/metronome.ts"
Task: "mixer engine in src/engine/mixer.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001~T007)
2. Complete Phase 2: Foundational (T008~T019)
3. Complete Phase 3: User Story 1 (T020~T031)
4. **STOP and VALIDATE**: quickstart.md 시나리오 1 수행
5. MVP: 트랙 추가 + 재생/정지 + 재생 헤드 이동

### Incremental Delivery

1. Setup + Foundational → 기반 완성
2. US1 → 타임라인 + 재생 (MVP)
3. US2 → 리전 편집 추가
4. US3 + US4 + US5 → 줌/스크롤, 믹서, 트랙 관리 (병렬 가능)
5. Polish → 단축키, 성능, 검증

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Constitution: 파일 300줄, 컴포넌트 150줄, 함수 50줄 초과 금지
