# Tasks: Playground — 비트 메이커

## Goal

16스텝 드럼 시퀀서 기반의 비트 메이커를 구축한다. 이후 패드 → 피아노롤 → DAW 타임라인으로 확장한다.

## Current Phase

✅ Phase 3: 피아노롤 + 멜로디 완료

## Phases

### MVP (스텝 시퀀서) ✅

- [x] Tone.js 오디오 엔진 + 드럼 킷 (8종)
- [x] Zustand 시퀀서 Store
- [x] 16스텝 그리드 UI + 플레이헤드
- [x] 재생/정지 + BPM 조절
- [x] 믹서 (볼륨/뮤트/솔로)
- [x] 테마 전환 + 헤더
- [x] 빌드 성공

### Phase 2: 패드 모드 ✅

- [x] spec.md Phase 2 스펙 추가
- [x] plan.md Phase 2 구현 계획 작성
- [x] 시퀀서↔패드 탭 전환 UI
- [x] 8개 드럼 패드 UI (2×4 그리드)
- [x] 패드 클릭 → 드럼 즉시 재생
- [x] 키보드 단축키 (Q,W,E,R,A,S,D,F)
- [x] 녹음 모드 (패드 연주 → 시퀀서 패턴 기록)
- [x] 빌드 성공

### Phase 3: 피아노롤 + 멜로디 ✅

- [x] spec.md Phase 3 스펙 추가
- [x] 피아노 Store (usePianoStore)
- [x] 신스 오디오 모듈 (synth.ts — PolySynth)
- [x] 피아노롤 그리드 UI (2옥타브, C3~B4)
- [x] 신스 프리셋 (Sine/Square/Triangle/Saw)
- [x] 코드 프리셋 (C Maj, D Min, E Min 등 8개)
- [x] 피아노롤 볼륨/뮤트
- [x] 시퀀서↔패드↔피아노롤 3탭 전환
- [x] 시퀀서 Hook에 피아노 재생 통합
- [x] 빌드 성공

### Phase 4: DAW 타임라인 ⏸️

## Notes

- 진행할 때마다 Phase 상태를 업데이트하세요: ⏸️ 대기 → 🔄 진행 중 → ✅ 완료
- 결정 사항은 findings.md의 Technical Decisions에 기록하세요.
- 오류는 findings.md의 Issues Encountered에 기록하세요.
