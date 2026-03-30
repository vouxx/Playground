# Findings & Decisions

> **기술적 발견, 중요한 결정이 있을 때마다 이 파일을 즉시 업데이트하세요.**

## Requirements

- 16스텝 드럼 시퀀서 (8종 드럼 트랙)
- 패드 모드 (실시간 연주 + 녹음)
- 피아노롤 (2옥타브 멜로디 + 코드 프리셋)
- DAW 타임라인 (멀티 마디 배열 + 내보내기)
- 이펙트 체인 (Reverb, Delay, Distortion, Filter)
- 비트 프리셋, Undo/Redo, 스윙, 탭 템포
- 파형 비주얼라이저
- 로컬 저장 + URL 공유
- 다크/라이트 테마

## Research Findings

### 기술 스택

- Framework: Next.js 15 (App Router, Turbopack)
- Audio: Tone.js (Web Audio API 래퍼)
- Styling: Tailwind CSS v4
- 상태 관리: Zustand

### Tone.js 특이사항

- Web Audio Context는 사용자 클릭 후에만 시작 가능 (브라우저 autoplay 정책)
- `Tone.start()`를 사용자 인터랙션 핸들러에서 호출해야 함
- `Tone.Transport`로 BPM, 재생/정지, 스윙 제어
- `transport.scheduleRepeat`로 스텝 시퀀싱 구현
- `Tone.Recorder`로 WebM 오디오 녹음/내보내기
- `Tone.Analyser('waveform')`로 실시간 파형 분석

### MetalSynth 타입 이슈

- Tone.js의 `MetalSynth` 생성자에서 `frequency`가 타입에 없음
- 헬퍼 함수 `createMetalSynth()`로 우회 해결

## Resources

### 문서

- [Tone.js 공식 문서](https://tonejs.github.io/)
- [Tone.js GitHub](https://github.com/Tonejs/Tone.js)

### 코드 참조

- 프로젝트 루트: `/Users/jei/zei/playground`
- GitHub: `git@github.com:vouxx/Playground.git`

## Technical Decisions

| Decision | Rationale |
| -------- | --------- |
| Tone.js 선택 | Web Audio API 직접 사용 대비 추상화 수준 적절, 스케줄링/신스/이펙트 내장 |
| 내장 신스 드럼 | 외부 샘플 파일 없이 빠른 구현, MembraneSynth/NoiseSynth/MetalSynth 조합 |
| Zustand | 가볍고 보일러플레이트 최소, React 외부에서도 getState() 사용 가능 |
| PolySynth for 피아노롤 | 다성 재생(화음) 지원 필수, Synth 래퍼로 간단 |
| 이펙트 체인 직렬 연결 | Reverb → Delay → Distortion → Filter → Destination, 순서가 음향적으로 자연스러움 |
| localStorage 저장 | MVP에 DB 불필요, 빠른 구현 |
| URL 공유 btoa 인코딩 | 서버 없이 클라이언트만으로 공유 가능 |
| WebM 내보내기 | Tone.Recorder가 WebM 포맷만 지원, WAV 변환은 추후 |

## Issues Encountered

### 1. MetalSynth frequency 타입 에러

**문제**: `new Tone.MetalSynth({ frequency: 400 })` — TypeScript에서 frequency가 타입에 없음

**원인**: Tone.js 타입 정의에서 MetalSynthOptions에 frequency가 포함 안 됨

**해결**: `createMetalSynth()` 헬퍼 함수로 frequency 제외하고 생성

**결과**: 빌드 성공

### 2. useSequencer scheduleRepeat 타입

**문제**: `useRef<ReturnType<typeof getTransport.schedule>>` 타입 에러

**해결**: `useRef<number | null>(null)`로 단순화

**결과**: 빌드 성공

## Learnings

### 프로젝트 전환 (2026-03-30)

- 코드 플레이그라운드 → 비트 메이커로 전환
- Monaco Editor, Claude SDK 제거, Tone.js 추가

### 드럼 신스 설계 (2026-03-30)

- Kick: MembraneSynth (C1, 긴 pitchDecay)
- Snare: NoiseSynth (white, 짧은 decay)
- Hi-hat/Open Hat/Cymbal: MetalSynth (decay 길이로 구분)
- Clap: NoiseSynth (pink, 약간 긴 attack)
- Rim: MembraneSynth (높은 pitch, 매우 짧은 decay)
- Tom: MembraneSynth (중간 pitch)

### 타임라인 모드 설계 (2026-03-30)

- globalStep으로 전체 마디 추적
- barIndex = Math.floor(globalStep / STEP_COUNT) % barCount
- 마디별 drumEnabled/pianoEnabled로 선택적 재생

---
