export interface Vector {
    x: number;
    y: number;
}

export interface Particle {
    position: Vector;
    velocity: Vector;
    radius: number;
    rotation: number;
    angularVelocity: number;
}

export interface Star {
    x: number;
    y: number;
    size: number;
    opacity: number;
    twinkleSpeed: number;
    baseOpacity: number;
}

export interface ControlsState {
    speed: number;
    angle: number;
    rotationSpeed: number;
    gravity: number;
    friction: number;
    elasticity: number;
    hexagonSize: number;
    particleSize: number;
    hexagonRotationSpeed: number;
    enableGravity: boolean;
    enableFriction: boolean;
    showVectors: boolean;
    showCollisionPoints: boolean;
    enableTrails: boolean;
    showGrid: boolean;
}

export interface SimulationData {
    position: Vector;
    velocity: Vector;
    kineticEnergy: number;
    collisionCount: number;
    elapsedTime: number;
    fps: number;
}
