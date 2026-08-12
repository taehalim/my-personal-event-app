'use client';

import dynamic from 'next/dynamic';
import { normalizeBackgroundPreset } from '@/lib/event-backgrounds';

const ReactBitsBackground = dynamic(() => import('@/components/ReactBitsBackground'), { ssr: false });

export default function EventBackground({ preset, fullViewport = false }: { preset?: string | null; fullViewport?: boolean }) {
  const selected = normalizeBackgroundPreset(preset);
  const isStatic = selected === 'midnight' || selected === 'paper';

  return <div className={`event-background-layer event-background-${selected}${isStatic ? ' event-background-static' : ' event-background-react-bits'}${fullViewport ? ' event-background-full-viewport' : ''}`} aria-hidden="true">
    {!isStatic && <ReactBitsBackground preset={selected} />}
  </div>;
}
