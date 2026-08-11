export const EVENT_BACKGROUND_PRESETS = [
  { id: 'plain', label: '소프트', description: '은은한 오로라' },
  { id: 'aurora', label: '오로라', description: '천천히 흐르는 빛' },
  { id: 'prism', label: '프리즘', description: '은은한 색의 굴절' },
  { id: 'constellation', label: '워프', description: '흐르는 빛의 궤적' },
  { id: 'orbit', label: '궤도', description: '원을 그리는 입자' },
  { id: 'bubbles', label: '버블', description: '떠오르는 원형 입자' },
  { id: 'sparkles', label: '스파클', description: '살짝 숨 쉬는 광선' },
  { id: 'rain', label: '레이즈', description: '흐르는 빛의 결' },
  { id: 'confetti', label: '플레어', description: '퍼지는 색의 빛' },
] as const;

export type EventBackgroundPreset = typeof EVENT_BACKGROUND_PRESETS[number]['id'];

const presetIds = new Set<string>(EVENT_BACKGROUND_PRESETS.map(preset => preset.id));

export function normalizeBackgroundPreset(value: string | null | undefined): EventBackgroundPreset {
  return value && presetIds.has(value) ? value as EventBackgroundPreset : 'plain';
}
