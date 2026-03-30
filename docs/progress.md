# Progress Log

> **각 단계를 완료하거나 문제가 발생하면 업데이트하세요.**

## Session 2026-03-30

### Phase 1: 프로젝트 전환 ✅

**작업 내역**:

1. 기존 코드 플레이그라운드 코드 전체 삭제
2. 의존성 정리 (Monaco/Claude SDK/react-markdown 제거, Tone.js 추가)
3. CLAUDE.md 비트 메이커로 업데이트
4. docs/ 5개 파일 비트 메이커 기준 새로 작성
5. spec.md 작성 → 승인

### MVP 스텝 시퀀서 ✅

**작업 내역**:

1. 타입 정의 (DrumType, Track, DRUM_KIT)
2. Tone.js 오디오 엔진 (MembraneSynth, NoiseSynth, MetalSynth)
3. Zustand Store (패턴, BPM, 볼륨/뮤트/솔로)
4. 시퀀서 Hook (Transport + scheduleRepeat)
5. 16스텝 그리드 UI (StepButton, TrackRow, StepGrid)
6. 믹서 (TrackControl — 볼륨/뮤트/솔로)
7. 헤더 (재생/정지, BPM, 테마)
8. 빌드 성공 + 첫 커밋 + GitHub 푸시

**생성 파일**: `src/types/`, `src/lib/audio.ts`, `src/store/useSequencerStore.ts`, `src/hooks/useSequencer.ts`, `src/hooks/useTheme.ts`, `src/components/sequencer/`, `src/components/mixer/`, `src/components/layout/`

### Phase 2: 패드 모드 ✅

**작업 내역**:

1. Store 확장 (isRecording, setStep)
2. usePad hook (패드 트리거 + 키보드 단축키)
3. DrumPad 컴포넌트 (컬러 패드 + 눌림 애니메이션)
4. PadGrid 컴포넌트 (2×4 그리드)
5. ModeTab 컴포넌트 (Sequencer/Pad 탭)
6. Header에 REC 버튼 추가
7. 빌드 성공

**생성 파일**: `src/hooks/usePad.ts`, `src/components/pad/`, `src/components/layout/ModeTab.tsx`

### Phase 3: 피아노롤 + 멜로디 ✅

**작업 내역**:

1. 피아노 타입 (PianoNote, SynthPreset, ChordPreset)
2. synth.ts (PolySynth 래퍼)
3. usePianoStore (2옥타브 그리드 상태)
4. PianoRollGrid 컴포넌트 (24노트 × 16스텝)
5. PianoControls (신스 프리셋 + 코드 프리셋 + 볼륨/뮤트)
6. 시퀀서 Hook에 피아노 재생 통합
7. 3탭 전환
8. 빌드 성공

**생성 파일**: `src/lib/synth.ts`, `src/store/usePianoStore.ts`, `src/components/piano/`

### Phase 4: DAW 타임라인 ✅

**작업 내역**:

1. useTimelineStore (bars, barCount, masterVolume)
2. TimelineGrid (마디별 드럼/멜로디 토글)
3. TimelineControls (마디 수, 마스터 볼륨, Export)
4. exporter.ts (WebM 내보내기)
5. 시퀀서 Hook에 타임라인 모드 통합 (globalStep, barIndex)
6. 4탭 전환
7. 빌드 성공 + 커밋 + 푸시

**생성 파일**: `src/store/useTimelineStore.ts`, `src/lib/exporter.ts`, `src/components/timeline/`

### Phase 5-6: UX + 사운드 + 시각 + 저장 ✅

**작업 내역**:

1. 6개 비트 프리셋 (presets.ts)
2. Undo/Redo (Store history/future)
3. 스윙 컨트롤 (Transport.swing)
4. 탭 템포 (useTapTempo)
5. 키보드 단축키 (useKeyboard — Space, Cmd+Z, Cmd+Backspace)
6. 이펙트 체인 (effects.ts — Reverb/Delay/Distortion/Filter)
7. 이펙트 패널 UI (EffectsPanel)
8. 파형 비주얼라이저 (Waveform — Tone.Analyser + Canvas)
9. 로컬 저장/불러오기 (storage.ts — localStorage)
10. URL 공유 (btoa 인코딩)
11. ProjectActions 컴포넌트 (Save/Load/Share)
12. 빌드 성공 + 커밋 + 푸시

**생성 파일**: `src/lib/presets.ts`, `src/lib/effects.ts`, `src/lib/storage.ts`, `src/store/useEffectsStore.ts`, `src/hooks/useKeyboard.ts`, `src/hooks/useTapTempo.ts`, `src/components/mixer/EffectsPanel.tsx`, `src/components/visualizer/Waveform.tsx`, `src/components/layout/ProjectActions.tsx`

## Error Log

| Timestamp | Error | Attempt | Resolution |
| --------- | ----- | ------- | ---------- |
| 2026-03-30 | MetalSynth frequency 타입 에러 | 1 | createMetalSynth() 헬퍼로 우회 |
| 2026-03-30 | scheduleRepeat 타입 에러 | 1 | useRef<number \| null> 로 단순화 |

## 5-Question Reboot Check

| Question | Answer |
| -------- | ------ |
| 1. 현재 어느 단계인가? | 전체 기능 구현 완료 (AI 연동 보류) |
| 2. 다음에 할 일은? | AI 연동 (API 키 설정 후) 또는 추가 기능 |
| 3. 목표는? | 비트 메이커 — Playground Beat me Up! |
| 4. 지금까지 배운 것? | findings.md 참고 |
| 5. 완료한 작업은? | 위 내용 참고 |
