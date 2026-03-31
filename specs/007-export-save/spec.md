# Feature Specification: Export & Save

**Feature Branch**: `007-export-save`
**Created**: 2026-03-31
**Status**: Draft

## User Scenarios & Testing *(mandatory)*

### User Story 1 - WAV/MP3 바운스 (Priority: P1)

사용자가 "내보내기" 버튼을 누르면 프로젝트 전체를 오프라인 렌더링하여 WAV 또는 MP3 파일로 다운로드한다. 실시간 재생 없이 빠르게 렌더링되고, 모든 트랙의 믹스가 반영된다.

**Why this priority**: 완성된 곡을 파일로 내보내는 것은 DAW의 최종 산출물이다.

**Independent Test**: 여러 트랙에 노트가 있는 프로젝트 → 내보내기 → WAV 다운로드 → 파일 재생하여 소리 확인

**Acceptance Scenarios**:

1. **Given** 프로젝트에 노트가 있는 상태, **When** "WAV 내보내기" 클릭, **Then** 오프라인 렌더링 후 .wav 파일이 다운로드
2. **Given** 내보내기 진행 중, **When** 진행률 확인, **Then** 프로그레스 바가 표시
3. **Given** 내보내기 완료, **When** 다운로드된 파일 재생, **Then** DAW에서 재생한 것과 동일한 소리

---

### User Story 2 - MIDI 익스포트 (Priority: P2)

사용자가 선택한 트랙 또는 전체 프로젝트를 표준 MIDI 파일(.mid)로 내보낼 수 있다. 다른 DAW에서 임포트 가능한 형식이다.

**Why this priority**: MIDI 파일은 다른 DAW와의 호환성을 보장하는 표준 포맷이다.

**Independent Test**: MIDI 트랙 내보내기 → .mid 파일 다운로드 → 다른 MIDI 뷰어에서 열기

**Acceptance Scenarios**:

1. **Given** MIDI 트랙이 있는 상태, **When** "MIDI 내보내기" 클릭, **Then** .mid 파일 다운로드
2. **Given** 내보낸 MIDI 파일, **When** 다른 MIDI 도구에서 열기, **Then** 노트/BPM/박자가 정확히 유지

---

### User Story 3 - 프로젝트 로컬 저장/불러오기 (Priority: P3)

사용자가 프로젝트를 JSON 파일로 저장하고 불러올 수 있다. 모든 트랙, 리전, MIDI 노트, 이펙트 설정, 오토메이션이 포함된다.

**Why this priority**: 작업 중인 프로젝트를 저장하고 이어서 작업할 수 있어야 한다.

**Independent Test**: 프로젝트 저장 → 새 세션에서 불러오기 → 모든 트랙/노트/설정 복원 확인

**Acceptance Scenarios**:

1. **Given** 프로젝트 작업 중, **When** "저장" 클릭, **Then** .json 파일 다운로드
2. **Given** 저장된 .json 파일, **When** "불러오기" 클릭 + 파일 선택, **Then** 모든 상태 복원

---

### User Story 4 - Supabase 클라우드 저장 (Priority: P4)

사용자가 로그인 후 프로젝트를 클라우드에 저장/불러오기할 수 있다. 프로젝트 목록을 보고 선택하여 불러온다.

**Why this priority**: 클라우드 저장은 편의 기능이며, 로컬 저장이 먼저 동작해야 한다.

**Acceptance Scenarios**:

1. **Given** 로그인 상태, **When** "클라우드 저장" 클릭, **Then** 프로젝트가 Supabase에 저장
2. **Given** 로그인 상태, **When** "내 프로젝트" 클릭, **Then** 저장된 프로젝트 목록 표시

---

### Edge Cases

- 빈 프로젝트를 내보내면? → 무음 WAV/빈 MIDI 파일 생성
- 오디오 트랙 포함 프로젝트의 MIDI 내보내기? → 오디오 트랙은 제외, MIDI 트랙만 포함
- 불러오기 시 파일이 손상되어 있으면? → 에러 메시지 표시
- 매우 긴 프로젝트(10분+) WAV 내보내기? → 메모리 경고, 청크 단위 처리

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Tone.js OfflineAudioContext로 프로젝트를 오프라인 렌더링해야 한다
- **FR-002**: 렌더링 결과를 WAV 파일로 인코딩하여 다운로드해야 한다
- **FR-003**: MIDI 노트를 SMF(Standard MIDI File) Type 1으로 인코딩해야 한다
- **FR-004**: 프로젝트 전체 상태를 JSON으로 직렬화/역직렬화해야 한다
- **FR-005**: Supabase Auth로 로그인/회원가입이 가능해야 한다
- **FR-006**: Supabase Storage/DB에 프로젝트 JSON을 저장/조회해야 한다
- **FR-007**: 내보내기 진행률을 UI에 표시해야 한다

### Key Entities

- **ExportConfig**: 내보내기 설정 (포맷, 샘플레이트, 비트뎁스)
- **ProjectSnapshot**: 전체 프로젝트 직렬화 데이터

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 1분 길이 프로젝트의 WAV 내보내기가 10초 이내에 완료
- **SC-002**: 내보낸 MIDI 파일이 다른 DAW에서 정상 임포트 가능
- **SC-003**: 저장/불러오기 왕복 시 데이터 손실 없음

## Assumptions

- WAV 인코딩은 브라우저 내장 API로 처리 (외부 라이브러리 최소화)
- MIDI 파일 생성은 경량 인코더 직접 구현 (외부 의존성 없이)
- Supabase 클라우드 저장은 기본 구조만 구현, 인증 UI는 간단한 이메일/비밀번호
- 오디오 트랙의 AudioBuffer는 로컬 저장 시 Base64로 직렬화 (크기 제한 주의)
