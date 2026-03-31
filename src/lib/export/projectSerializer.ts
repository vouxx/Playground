import { useProjectStore } from '@/store/useProjectStore';
import { useTrackStore } from '@/store/useTrackStore';
import { useRegionStore } from '@/store/useRegionStore';
import { useMidiStore } from '@/store/useMidiStore';
import { useEffectsStore } from '@/store/useEffectsStore';

interface ProjectSnapshot {
  version: 1;
  project: {
    name: string;
    bpm: number;
    timeSignature: [number, number];
    trackOrder: string[];
  };
  tracks: Record<string, unknown>;
  regions: Record<string, unknown>;
  notes: Record<string, unknown>;
  effects: {
    chains: Record<string, unknown[]>;
    sends: Record<string, unknown[]>;
    automationLanes: unknown[];
  };
}

/**
 * 현재 프로젝트 상태를 JSON 직렬화 가능 객체로 변환
 */
export function serializeProject(): ProjectSnapshot {
  const project = useProjectStore.getState();
  const tracks = useTrackStore.getState().tracks;
  const regions = useRegionStore.getState().regions;
  const notes = useMidiStore.getState().notes;
  const effects = useEffectsStore.getState();

  return {
    version: 1,
    project: {
      name: project.name,
      bpm: project.bpm,
      timeSignature: project.timeSignature,
      trackOrder: project.trackOrder,
    },
    tracks,
    regions,
    notes,
    effects: {
      chains: effects.chains,
      sends: effects.sends,
      automationLanes: effects.automationLanes,
    },
  };
}

/**
 * JSON 데이터를 스토어에 복원
 */
export function deserializeProject(data: ProjectSnapshot): void {
  if (data.version !== 1) {
    throw new Error(`Unsupported project version: ${data.version}`);
  }

  useProjectStore.setState({
    name: data.project.name,
    bpm: data.project.bpm,
    timeSignature: data.project.timeSignature,
    trackOrder: data.project.trackOrder,
  });

  useTrackStore.setState({
    tracks: data.tracks as ReturnType<typeof useTrackStore.getState>['tracks'],
  });

  useRegionStore.setState({
    regions: data.regions as ReturnType<typeof useRegionStore.getState>['regions'],
  });

  useMidiStore.setState({
    notes: data.notes as ReturnType<typeof useMidiStore.getState>['notes'],
  });

  useEffectsStore.setState({
    chains: data.effects.chains as ReturnType<typeof useEffectsStore.getState>['chains'],
    sends: data.effects.sends as ReturnType<typeof useEffectsStore.getState>['sends'],
    automationLanes: data.effects.automationLanes as ReturnType<typeof useEffectsStore.getState>['automationLanes'],
  });
}

/**
 * 프로젝트를 JSON 파일로 다운로드
 */
export function downloadProjectJson(): void {
  const snapshot = serializeProject();
  const json = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, `${snapshot.project.name}.json`);
}

/**
 * JSON 파일에서 프로젝트 불러오기
 */
export function loadProjectFromFile(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as ProjectSnapshot;
        deserializeProject(data);
        resolve();
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
