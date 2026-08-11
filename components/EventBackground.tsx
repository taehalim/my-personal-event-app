'use client';

import dynamic from 'next/dynamic';
import { normalizeBackgroundPreset } from '@/lib/event-backgrounds';

const ReactBitsBackground = dynamic(() => import('@/components/ReactBitsBackground'), { ssr: false });

export default function EventBackground({ preset, fullViewport = false }: { preset?: string | null; fullViewport?: boolean }) {
  const selected = normalizeBackgroundPreset(preset);

  return <div className={`event-background-layer event-background-${selected} event-background-react-bits${fullViewport ? ' event-background-full-viewport' : ''}`} aria-hidden="true">
    <ReactBitsBackground preset={selected} />
  </div>;
}
