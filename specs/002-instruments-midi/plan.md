# Implementation Plan: Instruments & MIDI

**Branch**: `002-instruments-midi` | **Date**: 2026-03-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-instruments-midi/spec.md`

## Summary

Phase 1의 빈 리전/트랙 위에 MIDI 노트 시스템, 가상 악기(신스/드럼킷), 피아노롤 편집기, 드럼 패드, MIDI 컨트롤러 입력을 구축하여 DAW에서 실제로 음악을 만들 수 있게 한다.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 15, Tone.js 15.x (PolySynth, Sampler, NoiseSynth), Zustand 5.x, Tailwind CSS v4
**Storage**: 브라우저 메모리 (Phase 1과 동일)
**Testing**: Vitest
**Target Platform**: 데스크톱 브라우저 (Chrome/Edge)
**Project Type**: web-app
**Performance Goals**: 256개 동시 노트 재생 시 끊김 없음, 피아노롤 60fps
**Constraints**: Canvas 2D only, 파일 300줄/컴포넌트 150줄/함수 50줄 제한

## Constitution Check

| 원칙 | 준수 여부 | 비고 |
|------|-----------|------|
| I. Audio Engine Integrity | PASS | Tone.PolySynth로 폴리포닉 처리, 트랙별 신스 인스턴스, mixer 채널에 연결 |
| II. Canvas 렌더링 성능 | PASS | 피아노롤도 Canvas 2D, 3-레이어, rAF, 가시영역 가상화 |
| III. 모듈화 및 계층 분리 | PASS | engine/instruments.ts(순수 TS), canvas/PianoRollRenderer.ts, store/useMidiStore.ts |
| IV. 데이터 모델 일관성 | PASS | MidiNote는 직렬화 가능 객체, regionId로 참조 |
| V. 접근성 | PASS | 패드 키보드 트리거, 피아노롤 키보드 단축키 |
| VI. AI 통합 | N/A | Phase 2 미사용 |
| VII. 테스트 | PASS | MIDI 스토어/스케줄러 단위 테스트 |

## Project Structure

### New/Modified Source Code

```text
src/
├── engine/
│   ├── instruments.ts        # 신스 프리셋 정의 및 생성 팩토리
│   ├── drumkit.ts            # 드럼킷 합성 (Tone.js NoiseSynth/MembraneSynth)
│   ├── scheduler.ts          # MIDI 노트 → Tone.js 스케줄링
│   └── midiInput.ts          # Web MIDI API 래퍼
├── canvas/
│   ├── PianoRollRenderer.ts  # 피아노롤 Canvas 렌더링
│   ├── PianoRollInteraction.ts # 피아노롤 노트 편집 인터랙션
│   └── KeyboardRenderer.ts   # 좌측 건반 렌더링
├── components/
│   ├── pianoroll/
│   │   └── PianoRollPanel.tsx # 하단 피아노롤 패널
│   ├── drumpad/
│   │   └── DrumPadGrid.tsx   # 16패드 드럼 머신 UI
│   └── timeline/
│       └── TrackHeader.tsx   # (수정) 악기 선택 버튼 추가
├── store/
│   ├── useMidiStore.ts       # MIDI 노트 CRUD (리전별)
│   ├── useInstrumentStore.ts # 트랙별 악기 할당
│   └── usePianoRollStore.ts  # 피아노롤 뷰 상태 (열린 리전, 줌 등)
├── hooks/
│   ├── usePianoRoll.ts       # 피아노롤 Canvas 초기화
│   ├── useScheduler.ts       # MIDI 스케줄링 ↔ Transport 연결
│   ├── useDrumPad.ts         # 드럼 패드 트리거/녹음
│   └── useMidiInput.ts       # Web MIDI 컨트롤러 연결
├── types/
│   └── daw.ts                # (수정) MidiNote, InstrumentPreset, DrumPad 타입 추가
└── lib/
    └── midi.ts               # MIDI 유틸 (노트 번호↔이름, 벨로시티 변환)
```

## Complexity Tracking

> Constitution 위반 없음
