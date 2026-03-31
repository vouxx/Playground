import * as Tone from 'tone';
import type { EffectInstance, EffectType } from '@/types/daw';

type ToneEffect = Tone.EQ3 | Tone.Compressor | Tone.Reverb | Tone.FeedbackDelay | Tone.Chorus | Tone.Distortion;

const effectNodes = new Map<string, ToneEffect>();

function createEffectNode(type: EffectType, params: Record<string, number>): ToneEffect {
  switch (type) {
    case 'eq3':
      return new Tone.EQ3(params.low, params.mid, params.high);
    case 'compressor':
      return new Tone.Compressor({
        threshold: params.threshold,
        ratio: params.ratio,
        attack: params.attack,
        release: params.release,
        knee: params.knee,
      });
    case 'reverb':
      return new Tone.Reverb({ decay: params.decay, wet: params.wet });
    case 'delay':
      return new Tone.FeedbackDelay({
        delayTime: params.delayTime,
        feedback: params.feedback,
        wet: params.wet,
      });
    case 'chorus':
      return new Tone.Chorus({
        frequency: params.frequency,
        delayTime: params.delayTime,
        depth: params.depth,
        wet: params.wet,
      }).start();
    case 'distortion':
      return new Tone.Distortion({
        distortion: params.distortion,
        wet: params.wet,
      });
  }
}

/**
 * 이펙트 체인을 Tone.js 노드로 빌드하고 연결
 * source → effect1 → effect2 → ... → destination
 */
export function buildEffectChain(
  trackId: string,
  chain: EffectInstance[],
  source: Tone.ToneAudioNode,
  destination: Tone.ToneAudioNode,
): void {
  // 기존 노드 해제
  disposeEffectChain(trackId);
  source.disconnect();

  const activeEffects = chain.filter((e) => !e.bypass);

  if (activeEffects.length === 0) {
    source.connect(destination);
    return;
  }

  const nodes: ToneEffect[] = [];
  for (const effect of activeEffects) {
    const nodeKey = `${trackId}:${effect.id}`;
    const node = createEffectNode(effect.type, effect.params);
    effectNodes.set(nodeKey, node);
    nodes.push(node);
  }

  // source → node[0] → node[1] → ... → destination
  source.connect(nodes[0]);
  for (let i = 0; i < nodes.length - 1; i++) {
    nodes[i].connect(nodes[i + 1]);
  }
  nodes[nodes.length - 1].connect(destination);
}

/**
 * 이펙트 파라미터 업데이트
 */
export function updateEffectParam(
  trackId: string,
  effectId: string,
  key: string,
  value: number,
): void {
  const nodeKey = `${trackId}:${effectId}`;
  const node = effectNodes.get(nodeKey);
  if (!node) return;

  if (key === 'wet' && 'wet' in node) {
    (node.wet as Tone.Signal<'normalRange'>).value = value;
  } else if (key in node) {
    const prop = (node as unknown as Record<string, unknown>)[key];
    if (prop && typeof prop === 'object' && 'value' in (prop as object)) {
      (prop as { value: number }).value = value;
    }
  }
}

/**
 * 트랙의 이펙트 체인 해제
 */
export function disposeEffectChain(trackId: string): void {
  for (const [key, node] of effectNodes) {
    if (key.startsWith(`${trackId}:`)) {
      node.disconnect();
      node.dispose();
      effectNodes.delete(key);
    }
  }
}

/**
 * 모든 이펙트 해제
 */
export function disposeAllEffects(): void {
  for (const node of effectNodes.values()) {
    node.disconnect();
    node.dispose();
  }
  effectNodes.clear();
}
