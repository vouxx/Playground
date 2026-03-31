# State Contracts: Core DAW Timeline

이 문서는 Zustand 스토어 간의 인터페이스 계약을 정의한다.

## useProjectStore

```typescript
interface ProjectStore {
  // State
  id: string;
  name: string;
  bpm: number;
  timeSignature: [number, number];
  trackOrder: string[];

  // Actions
  setBpm: (bpm: number) => void;
  setTimeSignature: (ts: [number, number]) => void;
  setName: (name: string) => void;
  reorderTracks: (fromIndex: number, toIndex: number) => void;
}
```

## useTrackStore

```typescript
interface TrackStore {
  // State
  tracks: Record<string, Track>;

  // Actions
  addTrack: (type?: TrackType) => string;  // returns new track ID
  removeTrack: (id: string) => void;
  duplicateTrack: (id: string) => string;  // returns new track ID
  updateTrack: (id: string, updates: Partial<Track>) => void;
  setVolume: (id: string, volume: number) => void;
  setPan: (id: string, pan: number) => void;
  toggleMute: (id: string) => void;
  toggleSolo: (id: string) => void;
}
```

## useRegionStore

```typescript
interface RegionStore {
  // State
  regions: Record<string, Region>;

  // Actions
  addRegion: (trackId: string, startTick: number, durationTicks?: number) => string;
  removeRegion: (id: string) => void;
  moveRegion: (id: string, trackId: string, startTick: number) => void;
  resizeRegion: (id: string, durationTicks: number) => void;
  getRegionsByTrack: (trackId: string) => Region[];
}
```

## useTransportStore

```typescript
interface TransportStore {
  // State
  isPlaying: boolean;
  currentTick: number;
  isMetronomeOn: boolean;

  // Actions
  play: () => void;
  stop: () => void;       // 1st: pause at current, 2nd: go to 0
  setPosition: (tick: number) => void;
  toggleMetronome: () => void;
}
```

## useViewportStore

```typescript
interface ViewportStore {
  // State
  scrollX: number;         // ticks
  scrollY: number;         // pixels
  pixelsPerTick: number;   // zoom level
  selectedRegionIds: string[];

  // Actions
  setScrollX: (x: number) => void;
  setScrollY: (y: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setZoom: (pixelsPerTick: number) => void;
  selectRegion: (id: string, addToSelection?: boolean) => void;
  deselectAll: () => void;
}
```

## Store 간 의존 관계

```
useProjectStore ← trackOrder (트랙 순서만)
useTrackStore ← 독립 (tracks map)
useRegionStore ← trackId로 Track 참조 (ID only)
useTransportStore ← 독립 (engine/transport.ts와 동기화)
useViewportStore ← 독립 (Canvas 렌더러와 동기화)
```

**원칙**: 스토어 간 직접 import 금지. 컴포넌트 또는 훅에서 여러 스토어를 조합.
