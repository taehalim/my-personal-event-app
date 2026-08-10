import type { ISourceOptions } from '@tsparticles/engine';

export const EVENT_BACKGROUND_PRESETS = [
  { id: 'plain', label: '기본', description: '깨끗한 흰 배경' },
  { id: 'aurora', label: '오로라', description: '천천히 흐르는 빛' },
  { id: 'prism', label: '프리즘', description: '은은한 색의 굴절' },
  { id: 'constellation', label: '별자리', description: '점과 선의 네트워크' },
  { id: 'orbit', label: '궤도', description: '원을 그리는 입자' },
  { id: 'bubbles', label: '버블', description: '떠오르는 원형 입자' },
  { id: 'sparkles', label: '스파클', description: '반짝이는 별가루' },
  { id: 'rain', label: '레인', description: '가볍게 내리는 선' },
  { id: 'confetti', label: '컨페티', description: '느리게 흩날리는 조각' },
] as const;

export type EventBackgroundPreset = typeof EVENT_BACKGROUND_PRESETS[number]['id'];

const presetIds = new Set<string>(EVENT_BACKGROUND_PRESETS.map(preset => preset.id));

export function normalizeBackgroundPreset(value: string | null | undefined): EventBackgroundPreset {
  return value && presetIds.has(value) ? value as EventBackgroundPreset : 'plain';
}

export function getBackgroundOptions(preset: EventBackgroundPreset): ISourceOptions {
  const base: ISourceOptions = {
    fullScreen: { enable: false },
    fpsLimit: 45,
    detectRetina: true,
    pauseOnBlur: true,
    pauseOnOutsideViewport: true,
  };

  if (preset === 'constellation') return {
    ...base,
    particles: {
      number: { value: 46, density: { enable: true, width: 900, height: 900 } },
      color: { value: ['#171717', '#555555', '#999999'] },
      opacity: { value: { min: 0.18, max: 0.5 } },
      size: { value: { min: 1, max: 3 } },
      links: { enable: true, distance: 150, color: '#555555', opacity: 0.18, width: 1 },
      move: { enable: true, speed: 0.35, outModes: { default: 'bounce' } },
    },
    interactivity: { events: { onHover: { enable: true, mode: 'grab' } }, modes: { grab: { distance: 160, links: { opacity: 0.45 } } } },
  };

  if (preset === 'orbit') return {
    ...base,
    particles: {
      number: { value: 28 },
      color: { value: ['#171717', '#888888'] },
      opacity: { value: { min: 0.2, max: 0.65 } },
      size: { value: { min: 2, max: 5 } },
      move: { enable: true, speed: 0.7, direction: 'none', random: true, outModes: { default: 'bounce' } },
    },
  };

  if (preset === 'bubbles') return {
    ...base,
    particles: {
      number: { value: 24 },
      color: { value: ['#171717', '#777777', '#bdbdbd'] },
      opacity: { value: { min: 0.08, max: 0.26 } },
      size: { value: { min: 12, max: 72 } },
      move: { enable: true, speed: 0.65, direction: 'top', random: true, straight: false, outModes: { default: 'out' } },
    },
  };

  if (preset === 'sparkles') return {
    ...base,
    particles: {
      number: { value: 95, density: { enable: true, width: 900, height: 900 } },
      color: { value: ['#111111', '#666666', '#b0b0b0'] },
      opacity: { value: { min: 0.12, max: 0.68 }, animation: { enable: true, speed: 0.8, minimumValue: 0.08, sync: false } },
      size: { value: { min: 1, max: 3 } },
      move: { enable: true, speed: 0.18, random: true, outModes: { default: 'bounce' } },
    },
  };

  if (preset === 'rain') return {
    ...base,
    particles: {
      number: { value: 65, density: { enable: true, width: 900, height: 900 } },
      color: { value: '#666666' },
      opacity: { value: { min: 0.12, max: 0.36 } },
      shape: { type: 'line' },
      size: { value: { min: 5, max: 15 } },
      move: { enable: true, speed: 2.2, direction: 'bottom', straight: true, outModes: { default: 'out' } },
    },
  };

  if (preset === 'confetti') return {
    ...base,
    particles: {
      number: { value: 44 },
      color: { value: ['#171717', '#666666', '#aaa', '#d4d4d4'] },
      opacity: { value: { min: 0.22, max: 0.62 } },
      shape: { type: ['square', 'triangle'] },
      size: { value: { min: 3, max: 8 } },
      move: { enable: true, speed: 0.9, direction: 'bottom', random: true, outModes: { default: 'out' } },
      rotate: { value: { min: 0, max: 360 }, direction: 'random', animation: { enable: true, speed: 8 } },
    },
  };

  return base;
}
