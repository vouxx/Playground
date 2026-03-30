# Feature Specification: Playground — 비트 메이커 (Beat Maker)

## Overview

16스텝 드럼 시퀀서 + 패드 기반의 비트 메이커. 그리드에서 클릭으로 드럼 패턴을 만들고, 패드를 눌러 실시간 연주하며, 연주를 녹음해서 패턴으로 저장할 수 있다.

## User Scenarios & Testing (mandatory)

### User Story 1: 드럼 패턴 만들기

- As: 비트 메이커 사용자는
- I: 16스텝 그리드에서 드럼 패턴을 만들 수 있다
- So: 원하는 리듬을 시각적으로 구성하기 위해

#### Acceptance Scenarios

Scenario 1: **스텝 토글**

- Given: 시퀀서 그리드가 표시된 상태에서
- When: Kick 행의 1번째 스텝을 클릭하면
- Then: 해당 셀이 활성화 상태로 변경되고, 다시 클릭하면 비활성화된다

Scenario 2: **여러 트랙 조합**

- Given: 빈 그리드 상태에서
- When: Kick 1,5,9,13 + Snare 5,13 + Hi-hat 1~16 전부 활성화하면
- Then: 기본 4/4 비트 패턴이 구성된다

### User Story 2: 비트 재생

- As: 사용자는
- I: 만든 패턴을 실시간으로 들을 수 있다
- So: 리듬을 확인하고 수정하기 위해

#### Acceptance Scenarios

Scenario 1: **재생/정지**

- Given: 패턴이 입력된 상태에서
- When: 재생 버튼을 클릭하면
- Then: BPM에 맞춰 패턴이 루프 재생되고, 현재 스텝이 하이라이트된다

Scenario 2: **BPM 조절**

- Given: 재생 중인 상태에서
- When: BPM을 120에서 140으로 변경하면
- Then: 즉시 재생 속도가 변경된다

Scenario 3: **정지**

- Given: 재생 중인 상태에서
- When: 정지 버튼을 클릭하면
- Then: 재생이 멈추고 플레이헤드가 초기화된다

### User Story 3: 믹서 조절

- As: 사용자는
- I: 각 트랙의 볼륨/뮤트/솔로를 조절할 수 있다
- So: 밸런스를 맞추기 위해

#### Acceptance Scenarios

Scenario 1: **볼륨 조절**

- Given: Kick 트랙이 있는 상태에서
- When: Kick 볼륨 슬라이더를 50%로 조절하면
- Then: 재생 시 Kick 소리가 절반 크기로 재생된다

Scenario 2: **뮤트**

- Given: 재생 중인 상태에서
- When: Snare 뮤트 버튼을 클릭하면
- Then: Snare 소리만 꺼지고, 다시 클릭하면 복구된다

Scenario 3: **솔로**

- Given: 재생 중인 상태에서
- When: Hi-hat 솔로 버튼을 클릭하면
- Then: Hi-hat만 재생되고, 나머지 트랙은 뮤트된다

### User Story 4: 패드 연주

- As: 사용자는
- I: 패드를 눌러 실시간으로 드럼을 연주할 수 있다
- So: 직관적으로 비트를 만들고 느껴보기 위해

#### Acceptance Scenarios

Scenario 1: **패드 클릭 연주**

- Given: 패드 모드가 활성화된 상태에서
- When: Kick 패드를 클릭하면
- Then: Kick 소리가 즉시 재생되고 패드에 눌림 애니메이션이 표시된다

Scenario 2: **키보드 연주**

- Given: 패드 모드가 활성화된 상태에서
- When: 키보드 Q 키를 누르면
- Then: 첫 번째 패드(Kick) 소리가 재생된다

Scenario 3: **녹음 모드**

- Given: 시퀀서가 재생 중이고 녹음 버튼이 활성화된 상태에서
- When: 패드를 눌러 연주하면
- Then: 현재 스텝 위치에 해당 드럼 노트가 시퀀서 그리드에 기록된다

### User Story 5: 모드 전환

- As: 사용자는
- I: 시퀀서 모드와 패드 모드를 전환할 수 있다
- So: 상황에 맞는 방식으로 비트를 만들기 위해

#### Acceptance Scenarios

Scenario 1: **탭 전환**

- Given: 시퀀서 모드가 활성화된 상태에서
- When: "Pad" 탭을 클릭하면
- Then: 패드 UI가 표시되고, 시퀀서 그리드는 숨겨진다

### User Story 6: 피아노롤 멜로디 작성

- As: 사용자는
- I: 피아노롤에서 멜로디 노트를 찍어 작곡할 수 있다
- So: 드럼 비트 위에 멜로디를 얹기 위해

#### Acceptance Scenarios

Scenario 1: **노트 입력**

- Given: Piano Roll 모드가 활성화된 상태에서
- When: 그리드의 C4 행, 1번 스텝을 클릭하면
- Then: 해당 위치에 노트가 생성되고, 재생 시 C4 음이 울린다

Scenario 2: **노트 삭제**

- Given: 노트가 입력된 위치에서
- When: 해당 노트를 다시 클릭하면
- Then: 노트가 삭제된다

Scenario 3: **신스 음색 선택**

- Given: Piano Roll 모드에서
- When: 신스 프리셋을 변경하면
- Then: 재생 시 변경된 음색으로 멜로디가 재생된다

### User Story 7: 코드 프리셋

- As: 음악 초보 사용자는
- I: 코드 프리셋 버튼을 눌러 화음을 입력할 수 있다
- So: 음악 이론을 몰라도 화음을 사용하기 위해

#### Acceptance Scenarios

Scenario 1: **코드 프리셋 적용**

- Given: Piano Roll 모드에서
- When: "C Major" 코드 버튼을 클릭하고 스텝을 지정하면
- Then: C, E, G 노트가 해당 스텝에 동시에 입력된다

### User Story 8: 테마 전환

- As: 사용자는
- I: 다크/라이트 테마를 전환할 수 있다
- So: 선호하는 환경에서 작업하기 위해

#### Acceptance Scenarios

Scenario 1: **테마 토글**

- Given: 다크 테마 상태에서
- When: 테마 토글 버튼을 클릭하면
- Then: 전체 UI가 라이트 테마로 전환된다

## Functional Requirements (mandatory)

### Phase 1: 스텝 시퀀서 ✅

- FR-1: MUST 8종 드럼 트랙(Kick, Snare, Hi-hat, Open Hat, Clap, Rim, Tom, Cymbal)을 제공한다
- FR-2: MUST 16스텝 그리드에서 클릭으로 노트를 토글할 수 있다
- FR-3: MUST 재생/정지 버튼으로 패턴을 루프 재생한다
- FR-4: MUST BPM 조절 (60~200)을 지원한다
- FR-5: MUST 재생 중 현재 스텝을 시각적으로 하이라이트한다
- FR-6: MUST 각 트랙별 볼륨 조절을 지원한다
- FR-7: MUST 각 트랙별 뮤트/솔로를 지원한다
- FR-8: MUST 다크/라이트 테마 전환을 지원한다
- FR-9: SHOULD 마스터 볼륨 조절을 지원한다
- FR-10: SHOULD 패턴 초기화(클리어) 기능을 제공한다

### Phase 2: 패드 모드

- FR-11: MUST 8개 드럼 패드를 화면에 표시한다
- FR-12: MUST 패드 클릭/터치 시 해당 드럼 소리를 즉시 재생한다
- FR-13: MUST 키보드 단축키(Q,W,E,R,A,S,D,F)로 패드를 트리거할 수 있다
- FR-14: MUST 녹음 모드에서 패드 연주를 현재 BPM 기준으로 시퀀서 패턴에 기록한다
- FR-15: MUST 시퀀서↔패드 모드 탭 전환을 지원한다
- FR-16: SHOULD 패드에 시각적 피드백(눌림 애니메이션)을 표시한다
- FR-17: SHOULD 녹음 시 퀀타이즈(가장 가까운 스텝에 맞춤)를 적용한다

### Phase 3: 피아노롤 + 멜로디

- FR-18: MUST 피아노롤 그리드(2옥타브, C3~B4, 16스텝)를 제공한다
- FR-19: MUST 그리드 클릭으로 노트를 토글할 수 있다
- FR-20: MUST Tone.js PolySynth로 멜로디를 재생한다
- FR-21: MUST 신스 프리셋 선택(Sine, Square, Triangle, Sawtooth)을 지원한다
- FR-22: MUST 시퀀서↔패드↔피아노롤 3탭 전환을 지원한다
- FR-23: SHOULD 코드 프리셋(Major, Minor, 7th 등)을 지원한다
- FR-24: SHOULD 피아노롤 볼륨/뮤트를 지원한다
- FR-25: SHOULD 재생 중 현재 스텝을 피아노롤에서도 하이라이트한다

### Phase 4: DAW 타임라인

- FR-26: MUST 타임라인 뷰에 드럼/멜로디 패턴을 마디(bar) 단위로 배치할 수 있다
- FR-27: MUST 최대 8마디까지 타임라인을 확장할 수 있다
- FR-28: MUST 마디별로 패턴을 활성화/비활성화할 수 있다
- FR-29: MUST 타임라인 모드에서 전체 곡을 순차 재생한다
- FR-30: MUST 마스터 볼륨 조절을 지원한다
- FR-31: MUST WAV 파일로 내보내기를 지원한다
- FR-32: MUST 4탭(Sequencer/Pad/Piano Roll/Timeline) 전환을 지원한다
- FR-33: SHOULD 재생 중 현재 마디 위치를 하이라이트한다
- FR-34: SHOULD 마디 복사/붙여넣기를 지원한다

### Phase 5-6: UX + 사운드 + 시각 + 저장

- FR-35: MUST 비트 프리셋(Hip-hop, House, Rock, Trap, Reggaeton, Lo-fi)을 제공한다
- FR-36: MUST Undo/Redo를 지원한다 (Cmd+Z / Cmd+Shift+Z)
- FR-37: MUST 스윙 컨트롤 (0~100%)을 지원한다
- FR-38: MUST 탭 템포(TAP 버튼)로 BPM을 측정할 수 있다
- FR-39: MUST 키보드 단축키(Space=재생/정지)를 지원한다
- FR-40: MUST 이펙트 체인(Reverb, Delay, Distortion, Filter)을 지원한다
- FR-41: MUST 실시간 파형 비주얼라이저를 표시한다
- FR-42: MUST 로컬 프로젝트 저장/불러오기를 지원한다
- FR-43: MUST URL로 패턴을 공유할 수 있다

## Constraints (mandatory)

- CON-1: MUST Tone.js를 오디오 엔진으로 사용한다
- CON-2: MUST Next.js 15 App Router를 사용한다
- CON-3: MUST Tailwind CSS v4로 스타일링한다
- CON-4: MUST Zustand로 상태 관리한다
- CON-5: MUST 파일 300줄, 컴포넌트 150줄, 함수 50줄 초과 금지
- CON-6: MUST Web Audio Context는 사용자 인터랙션(클릭) 후 시작한다 (브라우저 정책)

## Success Criteria (mandatory)

- SC-1: 그리드에서 스텝 클릭 → 셀 활성화/비활성화
- SC-2: 재생 버튼 → BPM에 맞춰 드럼 패턴 루프 재생
- SC-3: 재생 중 현재 스텝 하이라이트 이동
- SC-4: BPM 변경 → 즉시 속도 반영
- SC-5: 뮤트/솔로 → 해당 트랙만 음소거/단독 재생
- SC-6: 볼륨 슬라이더 → 트랙 음량 변경
- SC-7: 테마 토글 → 다크/라이트 전환

### Phase 2 추가

- SC-8: 패드 클릭 → 드럼 소리 즉시 재생 + 눌림 애니메이션
- SC-9: 키보드 Q,W,E,R,A,S,D,F → 대응하는 패드 트리거
- SC-10: 녹음 모드 + 패드 연주 → 시퀀서 그리드에 노트 기록
- SC-11: 시퀀서↔패드 탭 전환 정상 동작

### Phase 3 추가

- SC-12: 피아노롤 그리드에서 노트 클릭 → 토글
- SC-13: 재생 → 드럼 + 멜로디 동시 재생
- SC-14: 신스 프리셋 변경 → 음색 변경 확인
- SC-15: 코드 프리셋 클릭 → 화음 노트 입력
- SC-16: 3탭(Sequencer/Pad/Piano Roll) 전환 정상 동작

### Phase 4 추가

- SC-17: 타임라인에서 마디별 패턴 활성화/비활성화
- SC-18: 타임라인 재생 → 마디 순서대로 패턴 재생
- SC-19: 마스터 볼륨 조절 동작
- SC-20: WAV 내보내기 → 파일 다운로드
- SC-21: 4탭 전환 정상 동작

### Phase 5-6 추가

- SC-22: 프리셋 클릭 → 해당 비트 패턴 로드
- SC-23: Cmd+Z → Undo, Cmd+Shift+Z → Redo
- SC-24: 스윙 조절 → 그루브 변화
- SC-25: TAP 버튼 연타 → BPM 자동 측정
- SC-26: Space → 재생/정지 토글
- SC-27: 이펙트 knob 조절 → 음향 변화
- SC-28: 비주얼라이저에 실시간 파형 표시
- SC-29: Save → localStorage 저장, Load → 복원
- SC-30: Share → URL 클립보드 복사, URL 접속 → 패턴 복원
