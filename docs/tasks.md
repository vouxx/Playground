# Tasks: Playground — Beat me Up!

## Goal

16스텝 드럼 시퀀서 기반의 비트 메이커를 구축한다. 스텝 시퀀서 → 패드 → 피아노롤 → DAW 타임라인 → UX/사운드 확장 순으로 진행.

## Current Phase

✅ 전체 기능 구현 완료 (AI 연동 제외)

## Phases

### MVP (스텝 시퀀서) ✅

- [x] Tone.js 오디오 엔진 + 드럼 킷 (8종)
- [x] Zustand 시퀀서 Store
- [x] 16스텝 그리드 UI + 플레이헤드
- [x] 재생/정지 + BPM 조절
- [x] 믹서 (볼륨/뮤트/솔로)
- [x] 테마 전환 + 헤더

### Phase 2: 패드 모드 ✅

- [x] 시퀀서↔패드 탭 전환 UI
- [x] 8개 드럼 패드 UI (2×4 그리드, 컬러)
- [x] 패드 클릭 → 드럼 즉시 재생 + 눌림 애니메이션
- [x] 키보드 단축키 (Q,W,E,R,A,S,D,F)
- [x] 녹음 모드 (REC 버튼, 패드 연주 → 시퀀서 패턴 기록)

### Phase 3: 피아노롤 + 멜로디 ✅

- [x] 피아노롤 그리드 (2옥타브, C3~B4, 16스텝)
- [x] PolySynth 멜로디 재생
- [x] 신스 프리셋 (Sine/Square/Triangle/Saw)
- [x] 코드 프리셋 (C Maj, D Min, E Min 등 8개)
- [x] 피아노롤 볼륨/뮤트
- [x] 3탭 전환 (Sequencer/Pad/Piano Roll)

### Phase 4: DAW 타임라인 ✅

- [x] 최대 8마디 타임라인
- [x] 마디별 드럼/멜로디 활성화/비활성화
- [x] 타임라인 모드 재생 (마디 순차 재생 + 하이라이트)
- [x] 마스터 볼륨
- [x] WebM 내보내기 (Export)
- [x] 4탭 전환

### Phase 5: UX 강화 ✅

- [x] 6개 비트 프리셋 (Hip-hop, House, Rock, Trap, Reggaeton, Lo-fi)
- [x] Undo/Redo (Cmd+Z / Cmd+Shift+Z)
- [x] 스윙 컨트롤
- [x] 탭 템포 (TAP 버튼)
- [x] 키보드 단축키 (Space=재생/정지, Cmd+Backspace=클리어)

### Phase 6: 사운드 + 시각 + 저장 ✅

- [x] 이펙트 체인 (Reverb, Delay, Distortion, Filter)
- [x] 이펙트 패널 UI
- [x] 실시간 파형 비주얼라이저
- [x] 로컬 프로젝트 저장/불러오기 (localStorage)
- [x] URL 공유 (패턴 인코딩)

### Phase 7: AI 연동 ⏸️ (보류)

- [ ] AI 비트 생성 (자연어 → 패턴)
- [ ] AI 멜로디 제안
- [ ] AI 믹싱 어드바이스

## Notes

- AI 연동은 API 키 설정 후 진행 예정
- 결정 사항은 findings.md의 Technical Decisions에 기록
- 오류는 findings.md의 Issues Encountered에 기록
