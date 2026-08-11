import type { ISourceOptions } from '@tsparticles/engine';

export const EVENT_BACKGROUND_PRESETS = [
  { id: 'plain', label: '기본', description: '깨끗한 흰 배경' },
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
      color: { value: ['#ffffff', '#a9c7ff', '#ffc0df'] },
      opacity: { value: { min: 0.2, max: 0.64 } },
      size: { value: { min: 1, max: 3 } },
      links: { enable: true, distance: 150, color: '#aac5ff', opacity: 0.26, width: 1 },
      move: { enable: true, speed: 0.48, outModes: { default: 'bounce' } },
    },
    interactivity: { events: { onHover: { enable: true, mode: 'grab' } }, modes: { grab: { distance: 160, links: { opacity: 0.45 } } } },
  };

  if (preset === 'orbit') return {
    ...base,
    particles: {
      number: { value: 28 },
      color: { value: ['#d9e6ff', '#ffc5e1', '#fff0b6'] },
      opacity: { value: { min: 0.2, max: 0.72 } },
      size: { value: { min: 2, max: 5 } },
      move: { enable: true, speed: 0.82, direction: 'none', random: true, outModes: { default: 'bounce' } },
    },
  };

  if (preset === 'bubbles') return {
    ...base,
    particles: {
      number: { value: 24 },
      color: { value: ['#ffffff', '#bed4ff', '#ffd0e4'] },
      opacity: { value: { min: 0.1, max: 0.38 } },
      size: { value: { min: 12, max: 72 } },
      move: { enable: true, speed: 0.72, direction: 'top', random: true, straight: false, outModes: { default: 'out' } },
    },
  };

  if (preset === 'sparkles') return {
    ...base,
    particles: {
      number: { value: 95, density: { enable: true, width: 900, height: 900 } },
      color: { value: ['#ffffff', '#ffe6a2', '#b8d7ff', '#ffc5e2'] },
      opacity: { value: { min: 0.12, max: 0.78 }, animation: { enable: true, speed: 1.25, minimumValue: 0.08, sync: false } },
      size: { value: { min: 1, max: 3 } },
      move: { enable: true, speed: 0.18, random: true, outModes: { default: 'bounce' } },
    },
  };

  if (preset === 'rain') return {
    ...base,
    particles: {
      number: { value: 65, density: { enable: true, width: 900, height: 900 } },
      color: { value: ['#c8dcff', '#f5ddff', '#ffffff'] },
      opacity: { value: { min: 0.14, max: 0.44 } },
      shape: { type: 'line' },
      size: { value: { min: 5, max: 15 } },
      move: { enable: true, speed: 2.2, direction: 'bottom', straight: true, outModes: { default: 'out' } },
    },
  };

  if (preset === 'confetti') return {
    ...base,
    particles: {
      number: { value: 44 },
      color: { value: ['#f7ca72', '#abc8ff', '#f3a8c9', '#c8eece'] },
      opacity: { value: { min: 0.24, max: 0.72 } },
      shape: { type: ['square', 'triangle'] },
      size: { value: { min: 3, max: 8 } },
      move: { enable: true, speed: 1.05, direction: 'bottom', random: true, outModes: { default: 'out' } },
      rotate: { value: { min: 0, max: 360 }, direction: 'random', animation: { enable: true, speed: 8 } },
    },
  };

  return base;
}
