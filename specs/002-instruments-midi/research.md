# Research: Instruments & MIDI

## R1. MIDI 노트 스케줄링

**Decision**: Tone.Transport.scheduleOnce로 각 노트를 개별 스케줄링

**Rationale**: 재생 시작 시 현재 리전의 모든 노트를 Transport에 예약. 노트의 절대 틱 위치를 초(seconds)로 변환하여 scheduleOnce 호출. note-on → 지정 시간 후 note-off.

**Alternatives**: Tone.Part (배열 기반 스케줄링) — 리전 편집 시 Part 재생성 비용이 높아 개별 스케줄링이 더 유연

## R2. 신스 프리셋 구현

**Decision**: Tone.PolySynth + 오실레이터/엔벨로프 파라미터 조합으로 6종 프리셋

**Rationale**:
- Piano: PolySynth(Synth, {oscillator: triangle, envelope: fast attack/medium release})
- Pad: PolySynth(Synth, {oscillator: sine, envelope: slow attack/long release})
- Bass: MonoSynth({oscillator: sawtooth, filter: lowpass})
- Lead: PolySynth(Synth, {oscillator: square, envelope: fast attack/short release})
- Strings: PolySynth(Synth, {oscillator: sawtooth, envelope: slow attack/slow release})
- FM: PolySynth(FMSynth)

## R3. 드럼킷 합성

**Decision**: Tone.js 내장 신스로 드럼 사운드 합성 (샘플 파일 불필요)

**Rationale**:
- Kick: MembraneSynth (저음 막 진동)
- Snare: NoiseSynth(white) + MembraneSynth 레이어
- HiHat: MetalSynth (고음 금속)
- Clap: NoiseSynth(pink, 짧은 버스트)
- Tom: MembraneSynth (중음)
- Cymbal: MetalSynth (긴 릴리즈)

## R4. 피아노롤 Canvas 렌더링

**Decision**: Phase 1 타임라인 렌더러 패턴 재활용 (PianoRollRenderer + 3-레이어)

**Rationale**: GridRenderer(건반 + 시간 그리드), NoteRenderer(MIDI 노트 블록), PlayheadRenderer(재사용). 가시영역 가상화 동일 적용.

## R5. Web MIDI API

**Decision**: navigator.requestMIDIAccess()로 입력 장치 감지, onmidimessage 이벤트로 노트 수신

**Rationale**: Chrome/Edge만 지원. 미지원 시 graceful degradation (기능 숨김). note-on(0x90)/note-off(0x80) 파싱.
