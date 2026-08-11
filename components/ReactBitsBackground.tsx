'use client';

import dynamic from 'next/dynamic';
import type { EventBackgroundPreset } from '@/lib/event-backgrounds';
import type { HyperspeedOptions } from '@/components/react-bits/Hyperspeed';

// Each selection is lazy-loaded independently. The editor therefore previews
// only the active WebGL background instead of creating nine canvases at once.
const Aurora = dynamic(() => import('@/components/react-bits/Aurora'), { ssr: false });
const LightRays = dynamic(() => import('@/components/react-bits/LightRays'), { ssr: false });
const Threads = dynamic(() => import('@/components/react-bits/Threads'), { ssr: false });
const Warp = dynamic(() => import('@/components/react-bits/Warp'), { ssr: false });
const Hyperspeed = dynamic(() => import('@/components/react-bits/Hyperspeed'), { ssr: false });

const driftOptions: Partial<HyperspeedOptions> = {
  distortion: 'LongRaceDistortion',
  fov: 72,
  speedUp: 0.25,
  movingAwaySpeed: [18, 30],
  movingCloserSpeed: [-46, -68],
  colors: {
    roadColor: 0x090b11,
    islandColor: 0x0b0d14,
    background: 0x08090e,
    shoulderLines: 0x202f4f,
    brokenLines: 0x202f4f,
    leftCars: [0x9fc1ff, 0x7d9ce6, 0xb7d5ff],
    rightCars: [0x5d9fe8, 0x6fcbcf, 0x9cb3ff],
    sticks: 0x83aef0,
  },
};

const flareOptions: Partial<HyperspeedOptions> = {
  distortion: 'turbulentDistortion',
  fov: 96,
  fovSpeedUp: 118,
  speedUp: 0.7,
  movingAwaySpeed: [42, 62],
  movingCloserSpeed: [-86, -116],
  colors: {
    roadColor: 0x0b080d,
    islandColor: 0x0e0912,
    background: 0x08070c,
    shoulderLines: 0x3b253c,
    brokenLines: 0x3b253c,
    leftCars: [0xff9fca, 0xf4bc79, 0xc7a2ff],
    rightCars: [0x7cb6ff, 0x8ee9d4, 0xf9d371],
    sticks: 0xf0b6ff,
  },
};

// React Bits (DavidHDev/react-bits) free background components, adapted only
// for the app's viewport layer. They never render a card, border, or surface.
export default function ReactBitsBackground({ preset }: { preset: EventBackgroundPreset }) {
  if (preset === 'plain') {
    return <Aurora colorStops={['#e6edff', '#fff5f8', '#f0fbf5']} amplitude={0.62} blend={0.78} speed={0.38} />;
  }

  if (preset === 'aurora') {
    return <Aurora colorStops={['#8ab6ff', '#f4d0e2', '#a4e5ca']} amplitude={0.95} blend={0.55} speed={0.7} />;
  }

  if (preset === 'prism') {
    return <Aurora colorStops={['#d3c2ff', '#8fd8ff', '#ffcabd']} amplitude={1.18} blend={0.44} speed={1.05} />;
  }

  if (preset === 'constellation') {
    return <Warp />;
  }

  if (preset === 'rain') {
    return <Hyperspeed effectOptions={driftOptions} />;
  }

  if (preset === 'sparkles') {
    return <LightRays raysOrigin="bottom-center" raysColor="#d9c5ff" raysSpeed={0.45} lightSpread={1.1} rayLength={1.4} pulsating fadeDistance={1.15} saturation={1.2} noiseAmount={0.24} distortion={0.32} />;
  }

  if (preset === 'confetti') {
    return <Hyperspeed effectOptions={flareOptions} />;
  }

  if (preset === 'orbit') {
    return <Threads color={[0.52, 0.68, 1]} amplitude={1.3} distance={0.12} enableMouseInteraction={false} />;
  }

  // Keep the legacy ID so already-created events keep their selected style,
  // while the rendering itself is now a live React Bits shader.
  if (preset === 'bubbles') {
    return <Aurora colorStops={['#c8d9ff', '#ffe2f0', '#d5f3e4']} amplitude={1.42} blend={0.72} speed={0.52} />;
  }

  return <Aurora colorStops={['#e6edff', '#fff5f8', '#f0fbf5']} amplitude={0.62} blend={0.78} speed={0.38} />;
}
