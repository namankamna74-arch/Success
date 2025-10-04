import React, { useRef, useEffect, useCallback } from 'react';
import type { ControlsState, SimulationData, Vector, Particle, Star } from '../types';
import { PARTICLE_MASS, NUM_STARS, BLACK_HOLE_MASS } from '../constants';

interface SimulationCanvasProps {
    controls: ControlsState;
    isLaunched: boolean;
    isPaused: boolean;
    onDataUpdate: (data: SimulationData) => void;
    onReset: () => void;
}

const HEX_ANGLE = Math.PI / 3;
const FIXED_DT = 1 / 120; // Run physics at 120hz for stability and smoothness

// Helper to rotate a vector
const rotateVector = (v: Vector, angle: number): Vector => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: v.x * cos - v.y * sin,
        y: v.x * sin + v.y * cos,
    };
};

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ controls, isLaunched, isPaused, onDataUpdate, onReset }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    const particleRef = useRef<Particle>({
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        radius: controls.particleSize,
        rotation: 0,
        angularVelocity: 0,
    });
    
    const lastTimeRef = useRef<number>(0);
    const animationFrameIdRef = useRef<number>(0);
    const collisionPointsRef = useRef<{pos: Vector, time: number}[]>([]);
    const trailPointsRef = useRef<Vector[]>([]);
    const starsRef = useRef<Star[]>([]);
    const simulationTimeRef = useRef(0);
    const collisionCountRef = useRef(0);
    const hexagonRotationRef = useRef(0);
    
    const frameCountRef = useRef(0);
    const lastFpsUpdateTimeRef = useRef(0);
    const lastUiUpdateTimeRef = useRef(0);
    const fpsRef = useRef(0);

    const controlsRef = useRef(controls);
    const accumulatorRef = useRef(0);
    const lastParticleStateRef = useRef<Particle | null>(null);

    useEffect(() => {
        controlsRef.current = controls;
    }, [controls]);

    const initializeSimulation = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const { angle, speed, rotationSpeed, particleSize } = controlsRef.current;
        const radAngle = angle * Math.PI / 180;

        particleRef.current = {
            position: { x: 0, y: 0 },
            velocity: {
                x: Math.cos(radAngle) * speed,
                y: Math.sin(radAngle) * speed,
            },
            radius: particleSize,
            rotation: 0,
            angularVelocity: rotationSpeed,
        };
        lastParticleStateRef.current = JSON.parse(JSON.stringify(particleRef.current));
        
        simulationTimeRef.current = 0;
        collisionCountRef.current = 0;
        trailPointsRef.current = [];
        collisionPointsRef.current = [];
        fpsRef.current = 0;
        hexagonRotationRef.current = 0;
        accumulatorRef.current = 0;
        
        onDataUpdate({
            position: { x: 0, y: 0 },
            velocity: { x: 0, y: 0 },
            kineticEnergy: 0,
            collisionCount: 0,
            elapsedTime: 0,
            fps: 0,
        });

    }, [onDataUpdate]);
    
    useEffect(() => {
        if (!isLaunched) {
            initializeSimulation();
        }
    }, [isLaunched, initializeSimulation]);

    // Initialize stars
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!container || !canvas) return;
        const { width, height } = container.getBoundingClientRect();
        
        starsRef.current = Array.from({ length: NUM_STARS }, () => ({
            x: (Math.random() - 0.5) * width * 1.5,
            y: (Math.random() - 0.5) * height * 1.5,
            size: Math.random() * 1.5 + 0.5,
            opacity: Math.random() * 0.7 + 0.3,
            baseOpacity: Math.random() * 0.7 + 0.3,
            twinkleSpeed: Math.random() * 0.002 + 0.0005,
        }));
    }, []);

    // Main animation loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const getHexagonVertices = (size: number): Vector[] => {
            const vertices: Vector[] = [];
            for (let i = 0; i < 6; i++) {
                vertices.push({
                    x: size * Math.cos(i * HEX_ANGLE),
                    y: size * Math.sin(i * HEX_ANGLE),
                });
            }
            return vertices;
        };
        
        const update = (dt: number) => {
            if (isPaused || !isLaunched) return;
            
            const currentControls = controlsRef.current;
            simulationTimeRef.current += dt;
            hexagonRotationRef.current += currentControls.hexagonRotationSpeed * dt;

            const p = particleRef.current;
            
            // Gravity
            if (currentControls.enableGravity) {
                p.velocity.y += currentControls.gravity * dt;
            }

            // Update position
            p.position.x += p.velocity.x * dt;
            p.position.y += p.velocity.y * dt;
            p.rotation += p.angularVelocity * dt;

            // --- Collision detection and response ---
            const hexAngle = hexagonRotationRef.current;
            const localPosition = rotateVector(p.position, -hexAngle);

            const dpr = window.devicePixelRatio || 1;
            const logicalWidth = canvas.width / dpr;
            const logicalHeight = canvas.height / dpr;
            const maxHexWidth = logicalWidth * 0.95;
            const maxHexHeight = logicalHeight * 0.95;
            const sizeFromWidth = maxHexWidth / 2;
            const sizeFromHeight = maxHexHeight / Math.sqrt(3);
            const constrainedHexSize = Math.min(currentControls.hexagonSize, sizeFromWidth, sizeFromHeight);

            const vertices = getHexagonVertices(constrainedHexSize - p.radius);
            for (let i = 0; i < 6; i++) {
                const p1 = vertices[i];
                const p2 = vertices[(i + 1) % 6];
                
                const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
                const normal = { x: edge.y, y: -edge.x };
                const normalMag = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
                normal.x /= normalMag;
                normal.y /= normalMag;
                
                const particleToVertex = { x: localPosition.x - p1.x, y: localPosition.y - p1.y };
                const dist = particleToVertex.x * normal.x + particleToVertex.y * normal.y;
                
                if (dist > 0) { // Particle is outside this edge
                    localPosition.x -= dist * normal.x;
                    localPosition.y -= dist * normal.y;
                    
                    const localVelocity = rotateVector(p.velocity, -hexAngle);
                    const dot = localVelocity.x * normal.x + localVelocity.y * normal.y;
                    
                    localVelocity.x -= 2 * dot * normal.x;
                    localVelocity.y -= 2 * dot * normal.y;
                    
                    localVelocity.x *= currentControls.elasticity;
                    localVelocity.y *= currentControls.elasticity;

                    if (currentControls.enableFriction) {
                      const tangent = { x: -normal.y, y: normal.x };
                      const tangentVel = localVelocity.x * tangent.x + localVelocity.y * tangent.y;
                      const frictionForce = tangentVel * currentControls.friction;
                      localVelocity.x -= frictionForce * tangent.x;
                      localVelocity.y -= frictionForce * tangent.y;
                    }
                    
                    p.position = rotateVector(localPosition, hexAngle);
                    p.velocity = rotateVector(localVelocity, hexAngle);

                    if(currentControls.showCollisionPoints) {
                        collisionPointsRef.current.push({ pos: { ...p.position }, time: performance.now() });
                    }
                    collisionCountRef.current++;
                                        
                    break;
                }
            }

            if (currentControls.enableTrails) {
                trailPointsRef.current.push({ ...p.position });
                if (trailPointsRef.current.length > 50) {
                    trailPointsRef.current.shift();
                }
            } else {
                trailPointsRef.current = [];
            }
        };

        const draw = (timestamp: number, alpha: number) => {
            const currentControls = controlsRef.current;
            const dpr = window.devicePixelRatio || 1;
            const width = canvas.width / dpr;
            const height = canvas.height / dpr;
            const center = { x: width / 2, y: height / 2 };
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            ctx.save();
            ctx.translate(center.x, center.y);

            starsRef.current.forEach(star => {
                const dx = star.x;
                const dy = star.y;
                const distSq = dx * dx + dy * dy;
                const dist = Math.sqrt(distSq);

                if (dist === 0) return;

                const lensStrength = (BLACK_HOLE_MASS * currentControls.hexagonSize) / dist;
                const warpedX = star.x + (dx / dist) * lensStrength;
                const warpedY = star.y + (dy / dist) * lensStrength;
                
                star.opacity = star.baseOpacity * (0.75 + Math.sin(timestamp * star.twinkleSpeed) * 0.25);
                ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
                ctx.beginPath();
                ctx.arc(warpedX, warpedY, star.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();
            
            ctx.save();
            ctx.translate(center.x, center.y);

            if (currentControls.showGrid) {
                ctx.strokeStyle = 'rgba(0, 100, 150, 0.2)';
                ctx.lineWidth = 1 / dpr;
                for (let i = -width; i < width; i += 50) {
                    ctx.beginPath();
                    ctx.moveTo(i, -height);
                    ctx.lineTo(i, height);
                    ctx.stroke();
                }
                for (let i = -height; i < height; i += 50) {
                    ctx.beginPath();
                    ctx.moveTo(-width, i);
                    ctx.lineTo(width, i);
                    ctx.stroke();
                }
            }

            ctx.save();
            ctx.rotate(hexagonRotationRef.current);

            const maxHexWidth = width * 0.95;
            const maxHexHeight = height * 0.95;
            const sizeFromWidth = maxHexWidth / 2;
            const sizeFromHeight = maxHexHeight / Math.sqrt(3);
            const constrainedHexSize = Math.min(currentControls.hexagonSize, sizeFromWidth, sizeFromHeight);

            const vertices = getHexagonVertices(constrainedHexSize);
            ctx.strokeStyle = '#0ea5e9';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(vertices[0].x, vertices[0].y);
            for (let i = 1; i < 6; i++) {
                ctx.lineTo(vertices[i].x, vertices[i].y);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.restore();

            const p = particleRef.current;
            p.radius = currentControls.particleSize;

            if (isLaunched) {
                if (currentControls.enableTrails && trailPointsRef.current.length > 1) {
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    for (let i = 1; i < trailPointsRef.current.length; i++) {
                        ctx.beginPath();
                        ctx.moveTo(trailPointsRef.current[i-1].x, trailPointsRef.current[i-1].y);
                        ctx.lineTo(trailPointsRef.current[i].x, trailPointsRef.current[i].y);
                        const opacity = i / trailPointsRef.current.length;
                        ctx.strokeStyle = `rgba(255, 100, 100, ${opacity * 0.5})`;
                        ctx.lineWidth = (i / trailPointsRef.current.length) * p.radius * 1.5;
                        ctx.stroke();
                    }
                }
                
                const lastP = lastParticleStateRef.current;
                let renderPosition = p.position;
                if (lastP) {
                     renderPosition = {
                        x: p.position.x * alpha + lastP.position.x * (1 - alpha),
                        y: p.position.y * alpha + lastP.position.y * (1 - alpha),
                    };
                }

                ctx.save();
                ctx.translate(renderPosition.x, renderPosition.y);
                ctx.rotate(p.rotation);
                
                const glow = ctx.createRadialGradient(0, 0, p.radius * 0.5, 0, 0, p.radius * 1.2);
                glow.addColorStop(0, 'rgba(255, 80, 80, 1)');
                glow.addColorStop(0.5, 'rgba(239, 68, 68, 0.8)');
                glow.addColorStop(1, 'rgba(239, 68, 68, 0)');
                
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(0, 0, p.radius * 1.2, 0, 2 * Math.PI);
                ctx.fill();
                
                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.arc(0, 0, p.radius, 0, 2 * Math.PI);
                ctx.fill();
                
                ctx.strokeStyle = 'rgba(255,255,255,0.7)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0,0);
                ctx.lineTo(p.radius, 0);
                ctx.stroke();

                ctx.restore();

                if (currentControls.showVectors) {
                    ctx.save();
                    ctx.translate(renderPosition.x, renderPosition.y);
                    const angle = Math.atan2(p.velocity.y, p.velocity.x);
                    const mag = Math.min(Math.sqrt(p.velocity.x**2 + p.velocity.y**2) * 0.2, 100);
                    ctx.rotate(angle);
                    ctx.strokeStyle = '#f87171';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(mag, 0);
                    ctx.lineTo(mag - 8, -5);
                    ctx.moveTo(mag, 0);
                    ctx.lineTo(mag - 8, 5);
                    ctx.stroke();
                    ctx.restore();
                }

                const now = performance.now();
                collisionPointsRef.current = collisionPointsRef.current.filter(cp => now - cp.time < 300);
                collisionPointsRef.current.forEach(cp => {
                    const elapsed = now - cp.time;
                    const progress = elapsed / 300;
                    const radius = (1 - progress) * 20;
                    const opacity = 1 - progress;
                    ctx.fillStyle = `rgba(251, 191, 36, ${opacity})`;
                    ctx.beginPath();
                    ctx.arc(cp.pos.x, cp.pos.y, radius, 0, 2 * Math.PI);
                    ctx.fill();
                });
            } else {
                const angle = currentControls.angle * Math.PI / 180;
                const length = Math.min(currentControls.speed * 0.2, constrainedHexSize * 0.8);
                ctx.save();
                ctx.rotate(angle);
                ctx.strokeStyle = '#f87171';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(length, 0);
                ctx.lineTo(length - 10, -6);
                ctx.moveTo(length, 0);
                ctx.lineTo(length - 10, 6);
                ctx.stroke();
                ctx.restore();
            }
            
            ctx.restore();
        };

        const renderLoop = (timestamp: number) => {
            if (!lastTimeRef.current) lastTimeRef.current = timestamp;
            let dt = (timestamp - lastTimeRef.current) / 1000;
            lastTimeRef.current = timestamp;

            if (dt > 0.1) dt = 0.1;

            accumulatorRef.current += dt;

            lastParticleStateRef.current = JSON.parse(JSON.stringify(particleRef.current));

            while (accumulatorRef.current >= FIXED_DT) {
                update(FIXED_DT);
                accumulatorRef.current -= FIXED_DT;
            }

            const interpolationAlpha = accumulatorRef.current / FIXED_DT;
            draw(timestamp, interpolationAlpha);

            frameCountRef.current++;
            if (timestamp > lastFpsUpdateTimeRef.current + 1000) {
                fpsRef.current = frameCountRef.current;
                frameCountRef.current = 0;
                lastFpsUpdateTimeRef.current = timestamp;
            }

            if (timestamp > lastUiUpdateTimeRef.current + 100) {
                if (isLaunched) {
                    const p = particleRef.current;
                    onDataUpdate({
                        position: p.position,
                        velocity: p.velocity,
                        kineticEnergy: 0.5 * PARTICLE_MASS * (p.velocity.x ** 2 + p.velocity.y ** 2),
                        collisionCount: collisionCountRef.current,
                        elapsedTime: simulationTimeRef.current,
                        fps: fpsRef.current,
                    });
                }
                lastUiUpdateTimeRef.current = timestamp;
            }
            
            animationFrameIdRef.current = requestAnimationFrame(renderLoop);
        };

        const handleResize = () => {
            const container = containerRef.current;
            const canvas = canvasRef.current;
            if (container && canvas) {
                const { width, height } = container.getBoundingClientRect();
                const dpr = window.devicePixelRatio || 1;
                canvas.width = width * dpr;
                canvas.height = height * dpr;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.scale(dpr, dpr);
                }
                canvas.style.width = `${width}px`;
                canvas.style.height = `${height}px`;
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        
        animationFrameIdRef.current = requestAnimationFrame(renderLoop);

        return () => {
            cancelAnimationFrame(animationFrameIdRef.current);
            window.removeEventListener('resize', handleResize);
        };
    }, [isPaused, isLaunched, onDataUpdate, initializeSimulation]);

    return (
        <div ref={containerRef} className="w-full h-full">
            <canvas ref={canvasRef} />
        </div>
    );
};
