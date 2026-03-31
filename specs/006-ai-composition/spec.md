# Feature Specification: AI Composition

**Feature Branch**: `006-ai-composition`
**Created**: 2026-03-31
**Status**: Draft

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 코드 진행 자동 생성 (Priority: P1)

사용자가 조(Key), 장르(Genre), 마디 수를 선택하고 "코드 생성" 버튼을 누르면, AI가 코드 진행을 생성하여 새 리전에 MIDI 노트로 삽입한다. 생성된 코드를 사용자가 자유롭게 수정할 수 있다.

**Why this priority**: 코드 진행은 음악의 뼈대이다. 초보자도 코드를 몰라도 음악을 시작할 수 있게 한다.

**Independent Test**: 조 C major / 장르 Pop / 8마디 선택 → 생성 → 리전에 코드 노트 삽입 확인 → 재생하여 소리 확인

**Acceptance Scenarios**:

1. **Given** MIDI 트랙이 존재, **When** AI 패널에서 "코드 생성" 클릭 + 옵션 선택, **Then** 코드 진행이 생성되어 새 리전에 MIDI 노트로 삽입
2. **Given** 생성된 코드 리전, **When** 재생, **Then** 코드 보이싱이 신스로 출력
3. **Given** 생성된 코드 리전, **When** 피아노롤에서 노트 수정, **Then** 수정된 코드로 재생 가능

---

### User Story 2 - 멜로디 자동 생성 (Priority: P2)

사용자가 기존 코드 진행을 기반으로, 또는 독립적으로 멜로디를 생성할 수 있다. 조, 스케일, 음역, 리듬 복잡도 등의 옵션을 설정하고, AI가 멜로디를 생성하여 새 트랙/리전에 삽입한다.

**Why this priority**: 코드 위에 멜로디가 올라가야 곡이 완성된다.

**Independent Test**: 코드 트랙이 있는 상태에서 "멜로디 생성" → 새 트랙에 멜로디 노트 삽입 → 코드와 함께 재생

**Acceptance Scenarios**:

1. **Given** 코드 트랙이 존재, **When** "멜로디 생성" + 옵션 선택, **Then** 새 MIDI 트랙에 멜로디 노트가 삽입
2. **Given** 멜로디 생성 시, **When** 복잡도 "단순" 선택, **Then** 4분음표/8분음표 위주의 단순한 멜로디 생성
3. **Given** 멜로디 생성 시, **When** 복잡도 "복잡" 선택, **Then** 16분음표/싱코페이션 등 다양한 리듬 포함

---

### User Story 3 - 장르 기반 트랙 생성 (Priority: P3)

사용자가 장르(Pop, Rock, Jazz, EDM, Lo-Fi 등)를 선택하면, 해당 장르에 맞는 드럼 패턴 + 베이스라인 + 코드 + 멜로디를 한 번에 생성하여 여러 트랙에 삽입한다.

**Why this priority**: 원클릭으로 전체 곡 뼈대를 만들 수 있어 초보자에게 가장 접근성이 높다.

**Independent Test**: 장르 "Lo-Fi" / 8마디 / 키 Am 선택 → 생성 → 드럼+베이스+코드+멜로디 4트랙 생성 확인

**Acceptance Scenarios**:

1. **Given** 빈 프로젝트, **When** "장르 트랙 생성" + Lo-Fi + 8마디, **Then** 드럼/베이스/코드/멜로디 4트랙이 자동 생성
2. **Given** 장르 트랙 생성 완료, **When** 재생, **Then** 장르에 맞는 사운드로 4트랙이 함께 재생
3. **Given** 생성된 트랙들, **When** 개별 트랙을 피아노롤에서 수정, **Then** 수정 사항 반영

---

### Edge Cases

- AI 생성 중 취소하면? → 생성 중단, 이미 삽입된 노트 제거
- 네트워크 없이 AI 사용 시? → 로컬 알고리즘 기반 생성으로 폴백
- 생성된 노트가 마음에 안 들면? → Undo로 전체 되돌리기, 또는 재생성
- 빈 트랙에서 멜로디 생성 시? → 코드 없이 스케일 기반으로 생성

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: AI 어댑터 패턴으로 생성 엔진을 추상화하여 교체 가능해야 한다
- **FR-002**: 로컬 알고리즘 기반 코드 진행 생성이 가능해야 한다 (네트워크 불필요)
- **FR-003**: 로컬 알고리즘 기반 멜로디 생성이 가능해야 한다
- **FR-004**: 장르 프리셋(Pop, Rock, Jazz, EDM, Lo-Fi)별 드럼/베이스/코드/멜로디 템플릿 제공
- **FR-005**: 생성 결과는 편집 가능한 MIDI 노트로 삽입되어야 한다
- **FR-006**: 생성 중 비동기 처리하며 DAW 조작이 가능해야 한다
- **FR-007**: 생성 결과에 대한 undo가 가능해야 한다
- **FR-008**: AI 패널에서 조, 장르, 마디 수, 복잡도 등 옵션을 설정할 수 있어야 한다

### Key Entities

- **AIAdapter**: 생성 엔진 인터페이스 (generate 메서드)
- **GenerationRequest**: 생성 요청 (조, 장르, 마디 수, 타입, 옵션)
- **GenerationResult**: 생성 결과 (MidiNote 배열, 프리셋 추천)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 코드 진행 생성이 2초 이내에 완료된다 (로컬)
- **SC-002**: 장르 기반 4트랙 생성이 5초 이내에 완료된다
- **SC-003**: 생성된 코드가 음악적으로 유효하다 (조성에 맞는 다이어토닉 코드)
- **SC-004**: 네트워크 없이도 모든 생성 기능이 동작한다

## Assumptions

- Phase 1에서 AI 어댑터 패턴 사용 (Constitution VI)
- 초기 버전은 로컬 알고리즘(마르코프 체인/규칙 기반) 사용, 추후 외부 AI API 연동 가능
- 생성된 노트는 기존 useMidiStore에 저장
- 장르 프리셋은 하드코딩된 패턴 + 랜덤 변주
