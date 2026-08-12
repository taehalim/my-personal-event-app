export const EVENT_BACKGROUND_PRESETS = [
  { id: 'galaxy', label: '갤럭시', description: '회전하는 성운과 별' },
  { id: 'balatro', label: '발라트로', description: '유기적으로 흐르는 색' },
  { id: 'prism', label: '프리즘', description: '회전하는 스펙트럼' },
  { id: 'plasma', label: '플라즈마', description: '깊고 부드러운 에너지' },
  { id: 'tunnel', label: '라이트 터널', description: '빛을 통과하는 공간' },
  { id: 'warp', label: '하이퍼스피드', description: '공간을 가르는 궤적' },
  { id: 'threads', label: '스레드', description: '유영하는 빛의 선' },
  { id: 'aurora', label: '오로라', description: '천천히 흐르는 빛' },
] as const;

export type EventBackgroundPreset = typeof EVENT_BACKGROUND_PRESETS[number]['id'];

const presetIds = new Set<string>(EVENT_BACKGROUND_PRESETS.map(preset => preset.id));

// Pre-catalog events carried arbitrary legacy identifiers. They intentionally
// no longer expose a stale visual; all of them resolve to the new free catalog.
const legacyPresetFallback: Record<string, EventBackgroundPreset> = {
  plain: 'galaxy',
  constellation: 'warp',
  orbit: 'threads',
  bubbles: 'aurora',
  sparkles: 'tunnel',
  rain: 'plasma',
  confetti: 'balatro',
};

export function normalizeBackgroundPreset(value: string | null | undefined): EventBackgroundPreset {
  if (value && presetIds.has(value)) return value as EventBackgroundPreset;
  return value ? legacyPresetFallback[value] ?? 'galaxy' : 'galaxy';
}
