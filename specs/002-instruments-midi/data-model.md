# Data Model: Instruments & MIDI

## New Entities

### MidiNote

리전 내부의 개별 MIDI 이벤트.

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| id | string (UUID) | 노트 고유 식별자 | auto-generated |
| regionId | string | 소속 리전 ID | (required) |
| pitch | number | MIDI 노트 번호 (0~127, 60=C4) | (required) |
| startTick | number | 리전 내부 상대 시작 위치 (틱) | (required) |
| durationTicks | number | 길이 (틱) | PPQ (1/4 노트) |
| velocity | number | 벨로시티 (1~127) | 100 |

### InstrumentPreset

트랙에 할당되는 가상 악기 프리셋.

| Field | Type | Description |
|-------|------|-------------|
| id | string | 프리셋 고유 ID |
| name | string | 표시 이름 (예: "Piano") |
| type | "synth" \| "drumkit" | 악기 타입 |
| category | string | 분류 (Keys, Pad, Bass, Lead, Strings, Drums) |

### DrumPadMapping

드럼킷의 패드-소리 매핑.

| Field | Type | Description |
|-------|------|-------------|
| padIndex | number | 패드 번호 (0~15) |
| name | string | 소리 이름 (Kick, Snare 등) |
| pitch | number | 매핑된 MIDI 노트 번호 |
| keyTrigger | string | 키보드 단축키 (Q, W, E 등) |

## Modified Entities

### Track (수정)

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| instrumentId | string \| null | 할당된 프리셋 ID | "default-piano" |

### Region (수정)

> MidiNote는 별도 스토어(useMidiStore)에서 regionId로 참조. Region 자체에는 변경 없음.

## State (Runtime)

### PianoRollView

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| openRegionId | string \| null | 현재 열린 리전 ID | null |
| scrollX | number | 피아노롤 가로 스크롤 (틱) | 0 |
| scrollY | number | 피아노롤 세로 스크롤 (피치) | 60 (C4 중심) |
| pixelsPerTick | number | 줌 레벨 | 0.5 |
| selectedNoteIds | string[] | 선택된 노트 ID 목록 | [] |
