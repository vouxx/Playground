# Tasks: Instruments & MIDI

**Input**: Design documents from `/specs/002-instruments-midi/`

## Phase 1: Setup

- [ ] T001 MidiNote, InstrumentPreset, DrumPadMapping 타입 추가 (`src/types/daw.ts`)
- [ ] T002 [P] MIDI 유틸리티 작성 (`src/lib/midi.ts` — pitchToName, nameToPitch, velocityToGain)
- [ ] T003 [P] midi.ts 단위 테스트 (`src/lib/__tests__/midi.test.ts`)

---

## Phase 2: Foundational

- [ ] T004 useMidiStore 구현 (`src/store/useMidiStore.ts` — MIDI 노트 CRUD, 리전별 조회)
- [ ] T005 [P] useInstrumentStore 구현 (`src/store/useInstrumentStore.ts` — 트랙별 악기 할당, 프리셋 목록)
- [ ] T006 [P] usePianoRollStore 구현 (`src/store/usePianoRollStore.ts` — openRegionId, 줌, 스크롤, 선택)
- [ ] T007 신스 프리셋 팩토리 구현 (`src/engine/instruments.ts` — 6종 프리셋 생성, 트랙별 PolySynth 관리, mixer 채널 연결)
- [ ] T008 [P] 드럼킷 엔진 구현 (`src/engine/drumkit.ts` — MembraneSynth/NoiseSynth/MetalSynth 기반 8종 드럼, 패드 매핑)
- [ ] T009 MIDI 스케줄러 구현 (`src/engine/scheduler.ts` — 리전의 MidiNote → Tone.Transport 스케줄링, 재생/정지 시 등록/해제)
- [ ] T010 [P] useMidiStore 단위 테스트 (`src/store/__tests__/useMidiStore.test.ts`)

**Checkpoint**: 스토어 + 엔진 기반 완성

---

## Phase 3: US1 - MIDI 노트 입력 및 재생 (P1)

- [ ] T011 [US1] PianoRollRenderer 구현 (`src/canvas/PianoRollRenderer.ts` — 그리드, 노트 블록, 재생 헤드 렌더링)
- [ ] T012 [US1] KeyboardRenderer 구현 (`src/canvas/KeyboardRenderer.ts` — 좌측 건반 시각화, 흑건/백건)
- [ ] T013 [US1] PianoRollInteraction 구현 (`src/canvas/PianoRollInteraction.ts` — 노트 생성/이동/리사이즈/삭제, 히트테스트)
- [ ] T014 [US1] usePianoRoll 훅 작성 (`src/hooks/usePianoRoll.ts` — Canvas 초기화, 스토어 구독, 렌더링 트리거)
- [ ] T015 [US1] PianoRollPanel 컴포넌트 작성 (`src/components/pianoroll/PianoRollPanel.tsx` — Canvas + 건반 + 툴바)
- [ ] T016 [US1] useScheduler 훅 작성 (`src/hooks/useScheduler.ts` — Transport play/stop 시 스케줄러 연동)
- [ ] T017 [US1] 타임라인 리전 더블클릭 → 피아노롤 열기 연결 (`src/canvas/InteractionHandler.ts` 수정)
- [ ] T018 [US1] DAW 페이지에 PianoRollPanel 배치 (`src/app/page.tsx` 수정 — 하단 리사이즈 가능 패널)

**Checkpoint**: 노트 입력 → 재생 → 소리 출력 동작

---

## Phase 4: US2 - 신스 프리셋 선택 (P2)

- [ ] T019 [US2] TrackHeader에 악기 선택 드롭다운 추가 (`src/components/timeline/TrackHeader.tsx` 수정)
- [ ] T020 [US2] 악기 변경 시 신스 인스턴스 교체 로직 (`src/hooks/useScheduler.ts` — instrumentId 변경 감지 → 신스 재생성)

**Checkpoint**: 트랙별 다른 프리셋으로 재생 가능

---

## Phase 5: US3 - 드럼 머신 패드 (P3)

- [ ] T021 [US3] DrumPadGrid 컴포넌트 작성 (`src/components/drumpad/DrumPadGrid.tsx` — 4x4 패드, 클릭/키보드 트리거)
- [ ] T022 [US3] useDrumPad 훅 작성 (`src/hooks/useDrumPad.ts` — 패드 트리거 → 소리 재생, 녹음 모드 시 노트 기록)
- [ ] T023 [US3] 드럼 트랙 피아노롤 드럼맵 표시 (`src/canvas/PianoRollRenderer.ts` 수정 — 드럼 트랙이면 피치 대신 악기 이름)
- [ ] T024 [US3] DAW 페이지에 드럼 패드 뷰 토글 추가 (`src/app/page.tsx` 수정)

**Checkpoint**: 드럼 패드로 비트 만들기 가능

---

## Phase 6: US4 - 외부 MIDI 컨트롤러 (P4)

- [ ] T025 [US4] Web MIDI API 래퍼 구현 (`src/engine/midiInput.ts` — requestMIDIAccess, 장치 감지, note-on/off 파싱)
- [ ] T026 [US4] useMidiInput 훅 작성 (`src/hooks/useMidiInput.ts` — MIDI 입력 → 신스 트리거 + 녹음 모드 시 노트 기록)
- [ ] T027 [US4] MIDI 컨트롤러 상태 표시 (`src/components/timeline/TimelineToolbar.tsx` 수정 — 연결 상태 아이콘)

**Checkpoint**: MIDI 키보드로 실시간 연주/녹음 가능

---

## Phase 7: Polish

- [ ] T028 [P] 피아노롤 줌/스크롤 구현 (Cmd+휠, 휠)
- [ ] T029 [P] 벨로시티 편집 바 차트 (`src/components/pianoroll/PianoRollPanel.tsx` 하단)
- [ ] T030 타임라인 리전에 MIDI 노트 미리보기 렌더링 (`src/canvas/RegionRenderer.ts` 수정)
