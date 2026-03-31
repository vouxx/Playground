# Feature Specification: Audio Recording & Editing

**Feature Branch**: `003-audio-recording`
**Created**: 2026-03-31
**Status**: Draft

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 마이크로 오디오 녹음 (Priority: P1)

사용자가 오디오 트랙을 추가하고 녹음 버튼을 누르면 마이크 입력이 캡처된다. 재생을 시작하면 재생 헤드 위치부터 실시간으로 녹음되고, 정지하면 녹음된 오디오가 리전으로 타임라인에 나타난다.

**Why this priority**: 오디오 녹음은 이 Phase의 핵심 기능이다. 보컬, 기타 등 실제 악기를 DAW에 넣을 수 있는 첫 단계.

**Independent Test**: 오디오 트랙 추가 → 녹음 활성화 → 재생 → 마이크에 소리 입력 → 정지 → 타임라인에 파형이 표시된 리전 확인

**Acceptance Scenarios**:

1. **Given** 앱이 로드된 상태, **When** "오디오 트랙 추가" 버튼 클릭, **Then** 오디오 타입 트랙이 생성된다
2. **Given** 오디오 트랙이 있는 상태, **When** 트랙의 녹음 대기(arm) 버튼 클릭 + 재생, **Then** 마이크 권한 요청 후 녹음 시작, 파형이 실시간으로 표시된다
3. **Given** 녹음 중인 상태, **When** 정지 버튼 클릭, **Then** 녹음이 종료되고 AudioBuffer가 리전에 저장, 타임라인에 파형이 표시된다

---

### User Story 2 - 오디오 파형 표시 및 재생 (Priority: P2)

오디오 리전은 타임라인에서 파형으로 표시된다. 재생 시 해당 위치의 오디오가 출력된다. 여러 오디오 트랙의 소리가 믹서를 통해 합쳐진다.

**Why this priority**: 녹음된 오디오를 보고 들을 수 있어야 편집이 가능하다.

**Independent Test**: 녹음 후 재생하여 소리가 나오고 파형이 타임라인에 표시되는 것 확인

**Acceptance Scenarios**:

1. **Given** 오디오 리전이 존재하는 상태, **When** 타임라인을 확인, **Then** 리전 내부에 파형이 표시된다
2. **Given** 오디오 리전이 존재하는 상태, **When** 재생, **Then** 해당 위치에서 오디오가 출력된다
3. **Given** 줌 인/아웃 시, **When** 타임라인을 확인, **Then** 파형 해상도가 줌 레벨에 맞게 조정된다

---

### User Story 3 - 오디오 편집 (컷/트림/페이드) (Priority: P3)

오디오 리전을 선택하고 잘라내기(Split), 양 끝 트림, 페이드 인/아웃을 적용할 수 있다. 비파괴 편집으로 원본 오디오는 유지되며, 재생 범위와 페이드 커브만 변경된다.

**Why this priority**: 기본적인 오디오 편집 없이는 녹음된 소리를 다듬을 수 없다.

**Independent Test**: 오디오 리전을 특정 위치에서 Split → 두 리전으로 분리 확인, 페이드 인 적용 후 재생하여 볼륨 변화 확인

**Acceptance Scenarios**:

1. **Given** 오디오 리전이 선택된 상태, **When** Split 명령(Cmd+T) 실행, **Then** 재생 헤드 위치에서 리전이 두 개로 분리된다
2. **Given** 오디오 리전이 선택된 상태, **When** 리전 좌측 상단 모서리를 드래그, **Then** 페이드 인 커브가 적용되고 시각적으로 표시된다
3. **Given** 오디오 리전이 선택된 상태, **When** 리전 양 끝을 트림, **Then** 오디오 재생 시작/끝 지점이 변경되지만 원본은 유지된다

---

### Edge Cases

- 마이크 권한이 거부되면? → 에러 메시지 표시, 녹음 기능 비활성화
- 녹음 중 브라우저 탭이 비활성화되면? → 녹음 계속 진행 (Web Audio는 백그라운드 동작)
- 매우 긴 녹음(30분 이상)은? → 메모리 경고 표시, AudioBuffer 크기 제한
- 오디오 리전을 MIDI 트랙으로 드래그하면? → 이동 불가, 시각적 피드백
- 빈 오디오 리전(무음)이면? → 평탄한 파형 표시

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 오디오 타입 트랙을 추가할 수 있어야 한다
- **FR-002**: 트랙별 녹음 대기(arm) 상태를 토글할 수 있어야 한다
- **FR-003**: 녹음 대기 + 재생 시 MediaStream → AudioBuffer로 실시간 캡처해야 한다
- **FR-004**: 녹음 완료 시 AudioBuffer를 오디오 리전에 저장해야 한다
- **FR-005**: 오디오 리전은 타임라인에서 파형으로 표시되어야 한다
- **FR-006**: 재생 시 오디오 리전의 AudioBuffer를 Tone.js Player로 재생해야 한다
- **FR-007**: 오디오 리전을 재생 헤드 위치에서 Split(분리)할 수 있어야 한다
- **FR-008**: 오디오 리전 양 끝을 트림하여 재생 범위를 조절할 수 있어야 한다
- **FR-009**: 오디오 리전에 페이드 인/아웃 커브를 적용할 수 있어야 한다
- **FR-010**: 모든 편집은 비파괴적이어야 한다 (원본 AudioBuffer 유지)

### Key Entities

- **AudioRegion**: 오디오 리전으로, AudioBuffer 참조, 오프셋(원본 내 시작점), 재생 길이, 페이드 인/아웃 길이를 가진다
- **RecordingState**: 녹음 상태(대기/녹음중/완료), MediaStream, 녹음 중인 트랙 ID

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 녹음 시작부터 소리 캡처까지 체감 지연이 없다
- **SC-002**: 녹음된 오디오가 원본과 동일한 품질(44.1kHz 이상)로 재생된다
- **SC-003**: 10개 오디오 리전 동시 재생 시 끊김 없이 출력된다
- **SC-004**: Split/트림/페이드 작업 후 undo가 가능하다

## Assumptions

- Phase 1~2 기반(타임라인, 트랙, 믹서, Transport) 완성 상태
- 오디오 파일 임포트(WAV/MP3 드래그&드롭)는 이 Phase에서 함께 구현
- 타임 스트레치는 기본 구현(Tone.js GrainPlayer)으로 제공, 고급 알고리즘은 추후
- 녹음은 단일 모노/스테레오 입력만 지원 (멀티채널은 범위 밖)
