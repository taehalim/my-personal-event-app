'use client';

import { useMemo } from 'react';
import Particles, { ParticlesProvider, useParticlesProvider } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { getBackgroundOptions, type EventBackgroundPreset } from '@/lib/event-backgrounds';

async function loadParticles(engine: Parameters<typeof loadSlim>[0]) {
  await loadSlim(engine);
}

function ParticleCanvas({ preset }: { preset: EventBackgroundPreset }) {
  const { loaded } = useParticlesProvider();
  const options = useMemo(() => getBackgroundOptions(preset), [preset]);

  return loaded ? <Particles id={`event-background-${preset}`} options={options} /> : null;
}

export default function ParticleBackground({ preset }: { preset: EventBackgroundPreset }) {
  return <ParticlesProvider init={loadParticles}><ParticleCanvas preset={preset} /></ParticlesProvider>;
}
