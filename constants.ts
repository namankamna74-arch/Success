import type { ControlsState } from './types';

export const DEFAULT_CONTROLS: ControlsState = {
    speed: 250,
    angle: 45,
    rotationSpeed: 2,
    gravity: 98,
    friction: 0.1,
    elasticity: 0.85,
    hexagonSize: 300,
    particleSize: 12,
    hexagonRotationSpeed: 0.2,
    enableGravity: true,
    enableFriction: true,
    showVectors: true,
    showCollisionPoints: true,
    enableTrails: true,
    showGrid: false,
};

export const PARTICLE_MASS = 1; // For kinetic energy calculation
export const NUM_STARS = 400;
export const BLACK_HOLE_MASS = 5; // scales gravitational lensing effect
