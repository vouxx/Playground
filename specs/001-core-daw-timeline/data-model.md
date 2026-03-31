# Data Model: Core DAW Timeline

## Entity Diagram

```
Project (1) ──── (N) Track (1) ──── (N) Region
    │                   │
    └── Transport        └── MixerState
```

## Entities

### Project

프로젝트 전체를 나타내는 최상위 엔티티.

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| id | string (UUID) | 프로젝트 고유 식별자 | auto-generated |
| name | string | 프로젝트 이름 | "Untitled Project" |
| bpm | number | 분당 비트 수 (20~999) | 120 |
| timeSignature | [number, number] | 박자표 [분자, 분모] | [4, 4] |
| trackOrder | string[] | 트랙 ID 배열 (순서 결정) | [] |

### Track

개별 채널을 나타내는 엔티티. 오디오 또는 MIDI 데이터의 컨테이너.

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| id | string (UUID) | 트랙 고유 식별자 | auto-generated |
| name | string | 트랙 이름 | "Track {N}" |
| type | "midi" | 트랙 타입 (Phase 1은 MIDI만) | "midi" |
| color | string | 트랙/리전 색상 (hex) | palette에서 순차 할당 |
| mixer | MixerState | 볼륨/팬/뮤트/솔로 상태 | (see MixerState) |

### MixerState

트랙의 믹싱 파라미터를 담는 값 객체 (별도 엔티티 아님, Track에 내장).

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| volume | number | 볼륨 (dB, -Infinity ~ +6) | 0 |
| pan | number | 팬 (-1.0 L ~ +1.0 R) | 0 |
| mute | boolean | 뮤트 여부 | false |
| solo | boolean | 솔로 여부 | false |

### Region

트랙 위에 배치되는 시간 범위 블록. Phase 1에서는 빈 컨테이너.

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| id | string (UUID) | 리전 고유 식별자 | auto-generated |
| trackId | string | 소속 트랙 ID (참조) | (required) |
| startTick | number | 시작 위치 (틱, 0 이상) | (required) |
| durationTicks | number | 길이 (틱, 0 초과) | 768 × 4 (4마디) |
| name | string | 리전 이름 | "Region {N}" |

### Transport (전역 상태, 엔티티 아님)

재생 제어를 위한 전역 상태. 저장 대상이 아닌 런타임 상태.

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| isPlaying | boolean | 재생 중 여부 | false |
| currentTick | number | 현재 재생 위치 (틱) | 0 |
| isMetronomeOn | boolean | 메트로놈 활성화 | true |

### Viewport (전역 상태, 엔티티 아님)

타임라인 뷰 상태. 저장 대상이 아닌 런타임 상태.

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| scrollX | number | 가로 스크롤 위치 (틱) | 0 |
| scrollY | number | 세로 스크롤 위치 (px) | 0 |
| pixelsPerTick | number | 줌 레벨 (px/tick) | 0.15 |
| selection | RegionSelection | null | 선택된 리전 ID 목록 | null |

## Validation Rules

- `bpm`: 20 이상 999 이하 정수
- `timeSignature[0]`: 1 이상 32 이하, `timeSignature[1]`: 1, 2, 4, 8, 16 중 하나
- `volume`: -Infinity 또는 -60 이상 +6 이하
- `pan`: -1.0 이상 +1.0 이하
- `startTick`: 0 이상 정수
- `durationTicks`: 1 이상 정수
- `trackId`: 존재하는 Track의 ID여야 함

## State Transitions

### Transport 상태

```
Stopped (tick=0) → [Play] → Playing → [Stop] → Paused (tick=current)
Paused → [Play] → Playing
Paused → [Stop] → Stopped (tick=0)
```

### Region 생명주기

```
(없음) → [더블클릭] → Created → [드래그] → Moved → [리사이즈] → Resized
Created/Moved/Resized → [Delete] → Deleted
```
