'use client';

import dynamic from 'next/dynamic';
import type { EventBackgroundPreset } from '@/lib/event-backgrounds';

// These are unmodified, free React Bits background components. Every catalog
// entry maps to a different component rather than a renamed colour variant.
const Galaxy = dynamic(() => import('@/components/react-bits/Galaxy'), { ssr: false });
const Balatro = dynamic(() => import('@/components/react-bits/Balatro'), { ssr: false });
const Prism = dynamic(() => import('@/components/react-bits/Prism'), { ssr: false });
const Plasma = dynamic(() => import('@/components/react-bits/Plasma'), { ssr: false });
const LightTunnel = dynamic(() => import('@/components/react-bits/LightTunnel'), { ssr: false });
const Warp = dynamic(() => import('@/components/react-bits/Warp'), { ssr: false });
const Threads = dynamic(() => import('@/components/react-bits/Threads'), { ssr: false });
const Aurora = dynamic(() => import('@/components/react-bits/Aurora'), { ssr: false });

export default function ReactBitsBackground({ preset }: { preset: EventBackgroundPreset }) {
  switch (preset) {
    case 'galaxy':
      return <Galaxy density={1.15} hueShift={215} starSpeed={0.65} speed={0.75} glowIntensity={0.45} saturation={0.85} mouseInteraction />;
    case 'balatro':
      return <Balatro color1="#ff4f92" color2="#7d63ff" color3="#36d5c2" spinSpeed={0.26} spinAmount={0.7} contrast={2.2} lighting={0.65} mouseInteraction />;
    case 'prism':
      return <Prism animationType="3drotate" glow={1.6} noise={0.4} scale={3.2} hueShift={0.16} colorFrequency={1.2} bloom={1.1} suspendWhenOffscreen timeScale={0.55} />;
    case 'plasma':
      return <Plasma color="#596bff" speed={0.55} scale={1.05} opacity={0.92} mouseInteractive renderScale={0.6} targetFps={30} />;
    case 'tunnel':
      return <LightTunnel cableColor="#789cff" pulseColor="#f4b9ff" tunnelColor="#070914" speed={0.48} pulseSpeed={0.6} glow={0.8} waviness={0.45} sway={0.18} grain mouseInteraction={false} />;
    case 'warp':
      return <Warp />;
    case 'threads':
      return <Threads color={[0.46, 0.65, 1]} amplitude={1.45} distance={0.15} enableMouseInteraction />;
    case 'aurora':
      return <Aurora colorStops={['#8ec5ff', '#eab8ff', '#8ce5cd']} amplitude={1.05} blend={0.52} speed={0.72} />;
    default:
      return null;
  }
}
