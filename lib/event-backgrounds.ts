export const EVENT_BACKGROUND_PRESETS = [
  { id: 'plain', label: '소프트', description: '잔잔한 오로라' },
  { id: 'aurora', label: '오로라', description: '부드러운 색의 흐름' },
  { id: 'prism', label: '프리즘', description: '빛의 굴절' },
  { id: 'constellation', label: '워프', description: '공간을 가르는 궤적' },
  { id: 'orbit', label: '스레드', description: '유영하는 빛의 선' },
  { id: 'bubbles', label: '미스트', description: '떠다니는 색의 안개' },
  { id: 'sparkles', label: '글로우', description: '호흡하는 광선' },
  { id: 'rain', label: '드리프트', description: '천천히 흐르는 속도감' },
  { id: 'confetti', label: '플레어', description: '색이 번지는 질주' },
] as const;

export type EventBackgroundPreset = typeof EVENT_BACKGROUND_PRESETS[number]['id'];

const presetIds = new Set<string>(EVENT_BACKGROUND_PRESETS.map(preset => preset.id));

export function normalizeBackgroundPreset(value: string | null | undefined): EventBackgroundPreset {
  return value && presetIds.has(value) ? value as EventBackgroundPreset : 'plain';
}
