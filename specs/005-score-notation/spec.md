# Feature Specification: Score Notation

**Feature Branch**: `005-score-notation`
**Created**: 2026-03-31
**Status**: Draft

## User Scenarios & Testing *(mandatory)*

### User Story 1 - MIDI 노트를 악보로 표시 (Priority: P1)

사용자가 트랙을 선택하고 악보 뷰를 열면, 해당 트랙의 MIDI 노트가 오선보 위에 음표로 자동 렌더링된다. 음표의 피치, 길이, 위치가 정확히 반영되고, 조표와 박자표가 표시된다.

**Why this priority**: 악보 렌더링이 이 Phase의 핵심 기능이다. MIDI → 악보 변환이 먼저 동작해야 한다.

**Independent Test**: MIDI 트랙에 노트를 입력한 뒤 악보 뷰를 열어 음표가 올바른 위치에 표시되는지 확인

**Acceptance Scenarios**:

1. **Given** MIDI 노트가 있는 트랙, **When** 악보 뷰 버튼 클릭, **Then** 하단에 오선보가 표시되고 노트가 음표로 렌더링
2. **Given** C4 4분음표를 입력, **When** 악보 뷰 확인, **Then** 가온다(C4)가 보표 아래 덧줄에 4분음표로 표시
3. **Given** 박자표 3/4 설정, **When** 악보 뷰 확인, **Then** 마디당 3박으로 나뉘어 표시
4. **Given** 재생 중, **When** 악보 뷰 확인, **Then** 현재 재생 위치가 하이라이트로 표시

---

### User Story 2 - 조표 및 다이나믹 표기 (Priority: P2)

사용자가 프로젝트 또는 트랙 단위로 조표(Key Signature)를 설정할 수 있다. 벨로시티에 따른 다이나믹 기호(pp, p, mp, mf, f, ff)가 자동으로 표기된다.

**Why this priority**: 조표와 다이나믹은 악보의 음악적 정보를 완성하는 요소이다.

**Independent Test**: 조표를 D장조로 설정 → 악보에 #2개 표시 확인, 벨로시티 높은 노트에 f 표기 확인

**Acceptance Scenarios**:

1. **Given** 악보 뷰가 열린 상태, **When** 조표를 "D Major"로 변경, **Then** 조표 기호(F#, C#)가 오선보 시작에 표시
2. **Given** 벨로시티 120인 노트, **When** 악보 뷰 확인, **Then** 해당 음표 아래에 "f" 다이나믹 기호 표시
3. **Given** 벨로시티 40인 노트, **When** 악보 뷰 확인, **Then** "p" 다이나믹 기호 표시

---

### Edge Cases

- 트랙에 노트가 없으면? → 빈 오선보에 온쉼표 표시
- 화음(동시 발음)이면? → 수직으로 겹쳐 표시
- 비정형 리듬(16분음표 + 점)이면? → 가장 가까운 음표 길이로 퀀타이즈
- 매우 높거나 낮은 음이면? → 덧줄(ledger lines) 표시
- 드럼 트랙이면? → 타악기 보표(1선) 또는 일반 악보 뷰 비활성화

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: MIDI 노트를 오선보 위에 음표로 렌더링해야 한다
- **FR-002**: 음표 길이(온/2분/4분/8분/16분/점음표)를 정확히 표현해야 한다
- **FR-003**: 박자표에 맞는 마디 구분선을 표시해야 한다
- **FR-004**: 조표를 설정하고 보표 시작에 표시할 수 있어야 한다
- **FR-005**: 벨로시티 기반 다이나믹 기호(pp~ff)를 자동 표기해야 한다
- **FR-006**: 높은음자리표(트레블)와 낮은음자리표(베이스) 자동 선택해야 한다
- **FR-007**: 재생 중 현재 위치 하이라이트를 표시해야 한다
- **FR-008**: 악보 가로 스크롤이 가능해야 한다

### Key Entities

- **ScoreView**: 악보 뷰 상태 (표시 트랙, 조표, 줌 레벨)
- **KeySignature**: 조표 정보 (장/단조, 변화표 수)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100개 노트가 있는 트랙의 악보가 1초 이내에 렌더링된다
- **SC-002**: 4분음표/8분음표/16분음표가 정확한 기보법으로 표시된다
- **SC-003**: 악보를 보고 원래 MIDI 노트를 재현할 수 있는 수준의 정확도

## Assumptions

- 악보 렌더링에 VexFlow 라이브러리를 사용
- Phase 2의 MIDI 노트 데이터를 입력으로 사용
- 퀀타이즈 정밀도는 16분음표 단위
- 보이싱/성부 분리는 범위 밖 (단일 성부로 표시)
- 악보 편집(노트 입력)은 범위 밖 — 읽기 전용 뷰
