import React from 'react';
import type { ControlsState, SimulationData } from '../types';
import { SliderControl } from './SliderControl';
import { ToggleControl } from './ToggleControl';
import { InfoDisplay } from './InfoDisplay';
import { Button } from './Button';

interface ControlsSidebarProps {
    isVisible: boolean;
    controls: ControlsState;
    simulationData: SimulationData;
    isLaunched: boolean;
    isPaused: boolean;
    onControlChange: <K extends keyof ControlsState>(key: K, value: ControlsState[K]) => void;
    onReset: () => void;
    onLaunch: () => void;
    onPauseToggle: () => void;
}

export const ControlsSidebar: React.FC<ControlsSidebarProps> = React.memo(({
    isVisible,
    controls,
    simulationData,
    isLaunched,
    isPaused,
    onControlChange,
    onReset,
    onLaunch,
    onPauseToggle,
}) => {
    return (
        <aside className={`bg-slate-800/50 backdrop-blur-sm border-r border-slate-700 overflow-hidden transition-all duration-300 ease-in-out ${isVisible ? 'w-72' : 'w-0'}`}>
            <div className="flex flex-col h-full w-72 p-4 overflow-y-auto">
                <h1 className="text-2xl font-bold text-sky-400 mb-4 text-center">Physics Sandbox</h1>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2 mb-4">
                    <Button onClick={onLaunch} disabled={isLaunched}>Launch</Button>
                    <Button onClick={onPauseToggle} disabled={!isLaunched}>{isPaused ? 'Resume' : 'Pause'}</Button>
                    <Button onClick={onReset} className="col-span-2 sm:col-span-1 lg:col-span-2">Reset</Button>
                </div>
                
                <div className="space-y-4 flex-grow">
                    <SliderControl label="Vector Speed" min={0} max={500} step={1} value={controls.speed} onChange={v => onControlChange('speed', v)} unit="px/s" />
                    <SliderControl label="Launch Angle" min={0} max={360} step={1} value={controls.angle} onChange={v => onControlChange('angle', v)} unit="°" />
                    <SliderControl label="Rotation Speed" min={0} max={10} step={0.1} value={controls.rotationSpeed} onChange={v => onControlChange('rotationSpeed', v)} unit="rad/s" />
                    <SliderControl label="Gravity Strength" min={0} max={300} step={1} value={controls.gravity} onChange={v => onControlChange('gravity', v)} unit="px/s²" />
                    <SliderControl label="Friction" min={0} max={1} step={0.01} value={controls.friction} onChange={v => onControlChange('friction', v)} />
                    <SliderControl label="Bounce Elasticity" min={0} max={1} step={0.01} value={controls.elasticity} onChange={v => onControlChange('elasticity', v)} />
                    <SliderControl label="Hexagon Size" min={100} max={400} step={1} value={controls.hexagonSize} onChange={v => onControlChange('hexagonSize', v)} unit="px" />
                    <SliderControl label="Particle Size" min={5} max={20} step={1} value={controls.particleSize} onChange={v => onControlChange('particleSize', v)} unit="px" />
                    <SliderControl label="Hexagon Rotation" min={-2} max={2} step={0.05} value={controls.hexagonRotationSpeed} onChange={v => onControlChange('hexagonRotationSpeed', v)} unit="rad/s" />
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 my-4">
                    <ToggleControl label="Gravity" enabled={controls.enableGravity} onChange={v => onControlChange('enableGravity', v)} />
                    <ToggleControl label="Friction" enabled={controls.enableFriction} onChange={v => onControlChange('enableFriction', v)} />
                    <ToggleControl label="Vectors" enabled={controls.showVectors} onChange={v => onControlChange('showVectors', v)} />
                    <ToggleControl label="Collisions" enabled={controls.showCollisionPoints} onChange={v => onControlChange('showCollisionPoints', v)} />
                    <ToggleControl label="Trails" enabled={controls.enableTrails} onChange={v => onControlChange('enableTrails', v)} />
                    <ToggleControl label="Grid" enabled={controls.showGrid} onChange={v => onControlChange('showGrid', v)} />
                </div>
                
                <div className="border-t border-slate-700 pt-4 mt-auto grid grid-cols-2 gap-2 text-sm">
                    <InfoDisplay label="Position" value={`(${simulationData.position.x.toFixed(0)}, ${simulationData.position.y.toFixed(0)})`} />
                    <InfoDisplay label="Velocity" value={`${Math.sqrt(simulationData.velocity.x**2 + simulationData.velocity.y**2).toFixed(0)} px/s`} />
                    <InfoDisplay label="Energy" value={`${simulationData.kineticEnergy.toFixed(0)} J`} />
                    <InfoDisplay label="Collisions" value={simulationData.collisionCount.toString()} />
                    <InfoDisplay label="Time" value={`${simulationData.elapsedTime.toFixed(1)}s`} />
                    <InfoDisplay label="FPS" value={simulationData.fps.toString()} />
                </div>
            </div>
        </aside>
    );
});
