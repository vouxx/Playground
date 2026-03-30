# Implementation Plan: Playground — 비트 메이커

## Summary

Tone.js 기반 16스텝 드럼 시퀀서를 구현한다. 신스 드럼(MembraneSynth, NoiseSynth, MetalSynth)으로 8종 드럼 킷을 구성하고, Zustand로 패턴/BPM/믹서 상태를 관리한다.

## Requirements

1. 8종 드럼 트랙 × 16스텝 그리드
2. 재생/정지 + BPM 조절 (60~200)
3. 플레이헤드 하이라이트
4. 트랙별 볼륨/뮤트/솔로
5. 다크/라이트 테마
6. 패턴 클리어

## Critical Files

### New Files

- `src/types/index.ts` — 공통 타입
- `src/lib/audio.ts` — Tone.js 드럼 신스 초기화
- `src/store/useSequencerStore.ts` — 패턴, BPM, 트랙 상태
- `src/hooks/useSequencer.ts` — 시퀀서 재생 로직
- `src/hooks/useTheme.ts` — 테마 전환
- `src/components/layout/Header.tsx` — BPM, 재생/정지, 테마, 클리어
- `src/components/sequencer/StepGrid.tsx` — 16스텝 그리드 컨테이너
- `src/components/sequencer/TrackRow.tsx` — 개별 트랙 행 (트랙명 + 스텝 + 컨트롤)
- `src/components/sequencer/StepButton.tsx` — 개별 스텝 셀
- `src/components/mixer/TrackControl.tsx` — 볼륨 슬라이더 + 뮤트/솔로
- `src/app/page.tsx` — 메인 페이지

### Modified Files

- `src/app/layout.tsx` — 메타데이터 변경

## Architecture

### Data Flow

```text
1. 사용자가 그리드 스텝 클릭
       ↓
2. useSequencerStore.toggleStep(trackId, stepIndex)
       ↓
3. 재생 버튼 클릭 → Tone.start() → Tone.Transport.start()
       ↓
4. useSequencer hook이 Tone.Sequence로 16스텝 순회
       ↓
5. 각 스텝마다: 활성화된 트랙의 신스 트리거 + currentStep 업데이트
       ↓
6. UI: currentStep으로 플레이헤드 하이라이트
```

### 드럼 킷 (신스 기반)

```text
Kick     → MembraneSynth (C1)
Snare    → NoiseSynth (짧은 noise burst)
Hi-hat   → MetalSynth (높은 frequency, 짧은 decay)
Open Hat → MetalSynth (긴 decay)
Clap     → NoiseSynth (envelope 조절)
Rim      → MembraneSynth (높은 pitch, 짧은 decay)
Tom      → MembraneSynth (중간 pitch)
Cymbal   → MetalSynth (긴 sustain)
```

### State (Zustand)

```text
useSequencerStore
├── tracks: Track[]           # 8개 트랙 (name, steps[16], volume, mute, solo)
├── bpm: number               # 60~200
├── isPlaying: boolean
├── currentStep: number       # 0~15, 플레이헤드
├── toggleStep(trackId, step)
├── setBpm(bpm)
├── setPlaying(bool)
├── setCurrentStep(step)
├── setVolume(trackId, vol)
├── toggleMute(trackId)
├── toggleSolo(trackId)
└── clearPattern()
```

## Implementation Steps

### Step 1: 타입 정의

`src/types/index.ts`
- Track, DrumType 타입

### Step 2: 오디오 엔진

`src/lib/audio.ts`
- 8종 드럼 신스 생성 (MembraneSynth, NoiseSynth, MetalSynth)
- 각 신스에 개별 Volume 노드 연결
- triggerDrum(drumType) 함수

### Step 3: Zustand Store

`src/store/useSequencerStore.ts`
- 8트랙 × 16스텝 초기 상태
- 토글, BPM, 볼륨, 뮤트, 솔로, 클리어 액션

### Step 4: 시퀀서 Hook

`src/hooks/useSequencer.ts`
- Tone.Transport + Tone.Sequence로 루프 구현
- currentStep 업데이트
- 뮤트/솔로 로직 반영
- BPM 동기화

### Step 5: 테마 Hook

`src/hooks/useTheme.ts`
- localStorage 기반 다크/라이트 전환

### Step 6: UI 컴포넌트

**StepButton.tsx** — 개별 스텝 셀
- 활성/비활성 스타일
- 플레이헤드 하이라이트
- 4스텝 단위 시각적 구분

**TrackRow.tsx** — 트랙 행
- 트랙명 + 16개 StepButton + TrackControl

**TrackControl.tsx** — 볼륨/뮤트/솔로
- range input (볼륨)
- 뮤트(M) / 솔로(S) 토글 버튼

**StepGrid.tsx** — 전체 그리드
- 8개 TrackRow 렌더링

**Header.tsx** — 상단 컨트롤
- 프로젝트명
- 재생/정지 버튼
- BPM input
- 클리어 버튼
- 테마 토글

### Step 7: 메인 페이지 조립

`src/app/page.tsx`
- Header + StepGrid 조립
- Tone.start() 처리 (첫 인터랙션)

## Verification

### Build

```bash
npm run build
```

### Manual Test

1. 그리드 스텝 클릭 → 셀 토글
2. 재생 → BPM에 맞춰 드럼 소리 + 플레이헤드
3. BPM 변경 → 속도 즉시 반영
4. 뮤트 → 해당 트랙 음소거
5. 솔로 → 해당 트랙만 재생
6. 볼륨 슬라이더 → 음량 변경
7. 클리어 → 전체 패턴 초기화
8. 테마 토글 → 다크/라이트

---

## Phase 2: 패드 모드

### New Files

- `src/components/pad/DrumPad.tsx` — 개별 패드 버튼
- `src/components/pad/PadGrid.tsx` — 8개 패드 2×4 그리드
- `src/components/layout/ModeTab.tsx` — 시퀀서↔패드 탭 전환
- `src/hooks/usePad.ts` — 패드 트리거 + 키보드 단축키
- `src/hooks/useRecorder.ts` — 녹음 모드 (패드 연주 → 패턴 기록)

### Modified Files

- `src/app/page.tsx` — ModeTab + 조건부 렌더링 추가
- `src/components/layout/Header.tsx` — 녹음 버튼 추가
- `src/store/useSequencerStore.ts` — isRecording 상태 추가

### Data Flow (녹음 모드)

```text
1. 녹음 버튼 활성화 + 재생 중
       ↓
2. 패드 클릭/키보드 → usePad → triggerDrum()
       ↓
3. useRecorder가 현재 currentStep을 읽어
       ↓
4. useSequencerStore.toggleStep(drumId, currentStep) 호출
       ↓
5. 시퀀서 그리드에 노트 기록
```

### Implementation Steps (Phase 2)

**Step 8: Store 확장**
- `isRecording` 상태 + `setRecording` 액션 추가

**Step 9: 패드 Hook**
`src/hooks/usePad.ts`
- triggerPad(drumType) → 소리 재생 + 녹음 시 패턴 기록
- 키보드 이벤트 리스너 (Q=Kick, W=Snare, E=Hi-hat, R=OpenHat, A=Clap, S=Rim, D=Tom, F=Cymbal)

**Step 10: 녹음 Hook**
`src/hooks/useRecorder.ts`
- 현재 스텝에 노트 기록
- 퀀타이즈: 가장 가까운 스텝으로 스냅

**Step 11: 패드 UI**
`src/components/pad/DrumPad.tsx`
- 드럼명 표시
- 클릭/터치 시 트리거
- 눌림 애니메이션 (scale + 색상)
- 키보드 단축키 표시

`src/components/pad/PadGrid.tsx`
- 2×4 그리드 레이아웃

**Step 12: 모드 탭**
`src/components/layout/ModeTab.tsx`
- Sequencer / Pad 탭 전환

**Step 13: 페이지 + 헤더 수정**
- page.tsx에 ModeTab + 조건부 렌더링
- Header에 녹음(REC) 버튼 추가

### Phase 2 Verification

1. 패드 클릭 → 드럼 소리 즉시 재생
2. Q,W,E,R,A,S,D,F → 대응하는 드럼 재생
3. 시퀀서↔패드 탭 전환
4. 녹음 모드 + 패드 연주 → 시퀀서 그리드에 노트 기록
5. 녹음 해제 → 패드 연주해도 그리드 변경 없음

---

## Considerations

### Tone.js SSR

Tone.js는 브라우저 전용이므로 dynamic import 또는 조건부 import 필요. audio.ts에서 typeof window 체크.

### Web Audio Autoplay 정책

브라우저는 사용자 인터랙션 없이 AudioContext를 시작할 수 없음. 재생 버튼 클릭 시 `await Tone.start()` 호출.

### 솔로 로직

솔로가 활성화된 트랙이 하나 이상 있으면, 솔로 트랙만 재생. 솔로가 없으면 뮤트되지 않은 트랙 모두 재생.
