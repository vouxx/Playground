# Research: Core DAW Timeline

## R1. Canvas 2D 타임라인 렌더링 전략

**Decision**: 3-레이어 Canvas 스택 (배경 그리드 / 리전·파형 / 오버레이)

**Rationale**:
- 단일 Canvas에서 모든 요소를 매 프레임 다시 그리면 성능 저하
- 정적 요소(그리드)는 줌/스크롤 변경 시에만 다시 그리고, 동적 요소(리전)는 변경 시만, 오버레이(재생 헤드, 선택 영역)는 매 프레임 갱신
- 가시영역 가상화: 뷰포트 밖 리전은 렌더링하지 않음

**Alternatives considered**:
- PixiJS (WebGL): 성능 우수하지만 iframe 호환성 문제, Constitution II에서 금지
- DOM 기반 (div): 수백 개 리전에서 DOM 노드 폭증, 리플로우 비용
- OffscreenCanvas: Worker 스레드에서 렌더링 가능하나 브라우저 지원 불안정, Phase 1에서는 과도

## R2. Tone.js Transport 활용 방식

**Decision**: Tone.Transport를 유일한 시간 소스(single source of truth)로 사용

**Rationale**:
- Tone.Transport는 BPM 기반 스케줄링, 위치 추적, 루프를 내장
- 재생 헤드 위치를 `Tone.Transport.seconds`에서 읽어 Canvas에 반영
- rAF 콜백에서 `Transport.seconds` → 픽셀 위치 변환 → 재생 헤드 렌더링

**Alternatives considered**:
- 직접 AudioContext.currentTime 사용: BPM 변환을 수동 구현해야 함, 불필요한 중복
- Web Worker 타이머: 정밀도 향상 가능하나 Phase 1에서는 Tone.Transport로 충분

## R3. Zustand 슬라이스 패턴

**Decision**: 도메인별 독립 스토어 (useProjectStore, useTrackStore, useRegionStore, useTransportStore, useViewportStore)

**Rationale**:
- DAW 상태는 복잡하므로 단일 스토어는 관리 불가
- 도메인별 분리 시 각 스토어가 독립적으로 구독 가능 → 불필요한 리렌더 방지
- 스토어 간 참조는 ID 기반으로만 (Constitution IV)

**Alternatives considered**:
- 단일 스토어 + 셀렉터: 모든 상태가 한 곳에 집중되어 코드가 비대해짐
- Redux Toolkit: 보일러플레이트가 많고 Zustand 대비 이점 없음
- Jotai: 원자 단위 상태가 DAW의 복합 상태 변환에 부적합

## R4. 드래그 & 리사이즈 인터랙션

**Decision**: Canvas 이벤트 좌표 → 논리 좌표 변환 후, 히트 테스트로 대상 결정

**Rationale**:
- Canvas 위에서 DOM 이벤트를 받아 `InteractionHandler`가 처리
- mousedown → 히트 테스트(리전? 리사이즈 핸들? 빈 영역?) → 모드 결정(이동/리사이즈/선택/스크롤)
- mousemove → 스냅 적용 후 상태 업데이트 → Canvas 재렌더
- mouseup → 최종 상태 커밋
- 좌표 변환 유틸(`units.ts`)을 중앙화하여 일관성 보장 (Constitution II)

**Alternatives considered**:
- HTML 오버레이 + position:absolute: 수백 개 리전에서 DOM 성능 문제
- Pointer Events API: Canvas 위에서는 결국 직접 히트 테스트 필요, 추가 이점 없음

## R5. 시간 단위 및 스냅

**Decision**: 내부 저장은 틱(tick) 기반, UI 표시는 마디:박자:틱, 스냅은 마디 단위 기본

**Rationale**:
- Tone.js의 PPQ(Pulses Per Quarter note) = 192 (기본값) 사용
- 1마디 (4/4) = 4 × 192 = 768 틱
- 절대 틱 값으로 저장하면 BPM 변경에 영향받지 않음
- 스냅 그리드: 줌 레벨에 따라 1마디 → 1/2마디 → 1박 → 1/2박 자동 전환

**Alternatives considered**:
- 초(seconds) 기반: BPM 변경 시 모든 리전 위치 재계산 필요
- MIDI 파일 표준 PPQ(480): Tone.js 기본값과 불일치, 변환 비용 발생

## R6. 테스트 전략

**Decision**: Vitest + React Testing Library

**Rationale**:
- Vitest: Vite 호환, 빠른 실행, ESM 네이티브 지원
- 테스트 대상: store 액션(트랙/리전 CRUD), units.ts(시간 변환), snap.ts(스냅 로직), engine/transport.ts(Transport 래퍼)
- Canvas 렌더링은 자동 테스트 비용 대비 효과가 낮으므로 수동 검증
- Tone.js는 mock 처리 (Web Audio API는 Node.js에서 사용 불가)

**Alternatives considered**:
- Jest: ESM 지원이 불안정, Vitest 대비 느림
- Playwright E2E: Phase 1에서는 과도, Canvas 인터랙션 테스트가 복잡
