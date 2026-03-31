# Implementation Plan: Audio Recording & Editing

**Branch**: `003-audio-recording` | **Date**: 2026-03-31 | **Spec**: [spec.md](./spec.md)

## Summary

오디오 트랙 타입 추가, 마이크 녹음(MediaStream → AudioBuffer), 파형 렌더링, 오디오 재생(Tone.Player), 비파괴 편집(Split/트림/페이드)을 구현한다.

## Technical Context

**핵심 API**: MediaStream (getUserMedia), AudioWorklet (녹음 캡처), Tone.Player/GrainPlayer (재생)
**파형 렌더링**: AudioBuffer → peaks 배열 → Canvas 2D 드로잉 (RegionRenderer 확장)
**비파괴 편집**: AudioBuffer 원본 유지, offset/duration/fadeIn/fadeOut 메타데이터만 변경

## Project Structure (신규/수정)

```text
src/
├── engine/
│   ├── recorder.ts           # MediaStream → AudioBuffer 캡처
│   └── audioPlayer.ts        # Tone.Player 기반 오디오 재생 관리
├── canvas/
│   └── WaveformRenderer.ts   # AudioBuffer → 파형 Canvas 렌더링
├── store/
│   └── useAudioStore.ts      # AudioBuffer 저장, 오디오 리전 메타
├── types/
│   └── daw.ts                # (수정) AudioRegionData, TrackType 확장
├── lib/
│   └── waveform.ts           # AudioBuffer → peaks 배열 추출
└── hooks/
    └── useRecorder.ts        # 녹음 UI ↔ 엔진 연결
```
