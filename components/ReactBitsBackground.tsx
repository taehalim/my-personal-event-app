'use client';

import dynamic from 'next/dynamic';
import Aurora from '@/components/react-bits/Aurora';
import LightRays from '@/components/react-bits/LightRays';
import Threads from '@/components/react-bits/Threads';
import type { EventBackgroundPreset } from '@/lib/event-backgrounds';

const Warp = dynamic(() => import('@/components/react-bits/Warp'), { ssr: false });

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
    return <LightRays raysOrigin="top-left" raysColor="#b5cbff" raysSpeed={0.7} lightSpread={0.9} rayLength={1.55} pulsating={false} fadeDistance={1.3} saturation={0.85} noiseAmount={0.12} distortion={0.18} />;
  }

  if (preset === 'sparkles' || preset === 'confetti') {
    return <LightRays raysOrigin="bottom-center" raysColor={preset === 'sparkles' ? '#d9c5ff' : '#ffd39c'} raysSpeed={0.45} lightSpread={1.1} rayLength={1.4} pulsating fadeDistance={1.15} saturation={1.2} noiseAmount={0.24} distortion={0.32} />;
  }

  if (preset === 'orbit') {
    return <Threads color={[0.52, 0.68, 1]} amplitude={1.3} distance={0.12} enableMouseInteraction={false} />;
  }

  // The former tsParticles "bubbles" preset now uses the free React Bits
  // aurora shader as well. Keeping this legacy ID preserves existing events
  // while making every selectable style an animated React Bits background.
  if (preset === 'bubbles') {
    return <Aurora colorStops={['#c8d9ff', '#ffe2f0', '#d5f3e4']} amplitude={1.42} blend={0.72} speed={0.52} />;
  }

  return <Aurora colorStops={['#e6edff', '#fff5f8', '#f0fbf5']} amplitude={0.62} blend={0.78} speed={0.38} />;
}
