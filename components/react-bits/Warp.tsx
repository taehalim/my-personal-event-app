'use client';

import Hyperspeed from './Hyperspeed';
import type { HyperspeedOptions } from './Hyperspeed';

const warpOptions: Partial<HyperspeedOptions> = {
  distortion: 'turbulentDistortion',
  fov: 88,
  fovSpeedUp: 112,
  speedUp: 0.55,
  movingAwaySpeed: [36, 52],
  movingCloserSpeed: [-78, -102],
  colors: {
    roadColor: 0x08080d,
    islandColor: 0x0a0a10,
    background: 0x06070b,
    shoulderLines: 0x25263a,
    brokenLines: 0x25263a,
    leftCars: [0xe1a8d7, 0x9678d8, 0xb9c5ff],
    rightCars: [0x66b8ff, 0x8fe4d1, 0xe8d498],
    sticks: 0x9fc7ff,
  },
};

export default function Warp() {
  return <Hyperspeed effectOptions={warpOptions} />;
}
