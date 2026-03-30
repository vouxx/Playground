# Findings & Decisions

> **기술적 발견, 중요한 결정이 있을 때마다 이 파일을 즉시 업데이트하세요.**

## Requirements

- 16스텝 드럼 시퀀서 (8종 드럼 트랙)
- 재생/정지, BPM 조절
- 플레이헤드 하이라이트
- 트랙별 볼륨/뮤트/솔로
- 다크/라이트 테마

## Research Findings

### 기술 스택

- Framework: Next.js 15 (App Router)
- Audio: Tone.js (Web Audio API 래퍼)
- Styling: Tailwind CSS v4
- 상태 관리: Zustand

### Tone.js 특이사항

- Web Audio Context는 사용자 클릭 후에만 시작 가능 (브라우저 autoplay 정책)
- `Tone.start()`를 사용자 인터랙션 핸들러에서 호출해야 함
- `Tone.Transport`로 BPM, 재생/정지 제어
- `Tone.Sequence` 또는 `Tone.Loop`로 스텝 시퀀싱

## Resources

### 문서

- [Tone.js 공식 문서](https://tonejs.github.io/)
- [Tone.js GitHub](https://github.com/Tonejs/Tone.js)

### 코드 참조

- 프로젝트 루트: `/Users/jei/zei/playground`

## Technical Decisions

| Decision | Rationale |
| -------- | --------- |
| Tone.js 선택 | Web Audio API 직접 사용 대비 추상화 수준 적절, 스케줄링/신스/이펙트 내장 |
| 내장 신스 드럼 사용 | 외부 샘플 파일 없이 MVP 빠르게 구현 가능, Phase 2에서 샘플러로 교체 가능 |
| Zustand 유지 | 코드 플레이그라운드에서 이미 검증, 가볍고 보일러플레이트 최소 |

## Issues Encountered

<!-- 에러 발생 시 여기에 상세 기록 -->

## Learnings

### 프로젝트 전환 (2026-03-30)

- 코드 플레이그라운드 → 비트 메이커로 전환
- Monaco Editor, Claude SDK 제거
- Tone.js 추가

---
