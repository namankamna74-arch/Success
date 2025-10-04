import React, { useState, useCallback } from 'react';
import { ControlsSidebar } from './components/ControlsSidebar';
import { SimulationCanvas } from './components/SimulationCanvas';
import type { ControlsState, SimulationData } from './types';
import { DEFAULT_CONTROLS } from './constants';

const App: React.FC = () => {
    const [controls, setControls] = useState<ControlsState>(DEFAULT_CONTROLS);
    const [simulationData, setSimulationData] = useState<SimulationData>({
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        kineticEnergy: 0,
        collisionCount: 0,
        elapsedTime: 0,
        fps: 0,
    });
    const [isLaunched, setIsLaunched] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(true);
    const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(true);

    const handleControlChange = useCallback(<K extends keyof ControlsState>(key: K, value: ControlsState[K]) => {
        setControls(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleReset = useCallback(() => {
        setControls(DEFAULT_CONTROLS);
        setIsLaunched(false);
        setIsPaused(true);
        setSimulationData({
            position: { x: 0, y: 0 },
            velocity: { x: 0, y: 0 },
            kineticEnergy: 0,
            collisionCount: 0,
            elapsedTime: 0,
            fps: 0,
        });
    }, []);
    
    const handleLaunch = useCallback(() => {
        setIsLaunched(true);
        setIsPaused(false);
    }, []);

    const handlePauseToggle = useCallback(() => {
        if(isLaunched) {
            setIsPaused(prev => !prev);
        }
    }, [isLaunched]);

    const toggleSidebar = useCallback(() => {
        setIsSidebarVisible(prev => !prev);
    }, []);

    return (
        <div className="flex h-screen font-sans bg-slate-900 overflow-hidden">
            <ControlsSidebar
                isVisible={isSidebarVisible}
                controls={controls}
                simulationData={simulationData}
                isLaunched={isLaunched}
                isPaused={isPaused}
                onControlChange={handleControlChange}
                onReset={handleReset}
                onLaunch={handleLaunch}
                onPauseToggle={handlePauseToggle}
            />
            <main className="relative flex-1 flex items-center justify-center bg-black min-h-0">
                 <button 
                    onClick={toggleSidebar}
                    className="absolute top-4 left-4 z-20 p-2 bg-slate-700/50 rounded-full text-slate-200 hover:bg-slate-600/70 transition-all focus:outline-none focus:ring-2 focus:ring-sky-400"
                    aria-label={isSidebarVisible ? "Hide controls" : "Show controls"}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995a6.423 6.423 0 010 .255c0 .382.145.755.438.995l1.003.827c.48.398.668 1.05.26 1.431l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.217-.456c-.354-.133-.75-.072-1.075.124a6.57 6.57 0 01-.22.127c-.331.183-.581.495-.645.87l-.213 1.281c-.09.543-.56.94-1.11.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.437-.995a6.423 6.423 0 010-.255c0-.382-.145-.755-.437-.995l-1.004-.827a1.125 1.125 0 01-.26-1.431l1.296-2.247a1.125 1.125 0 011.37-.49l1.217.456c.354.133.75.072 1.075-.124a6.57 6.57 0 01.22-.127c.331-.183.581-.495.645-.87l.213-1.281z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
                <SimulationCanvas
                    controls={controls}
                    isLaunched={isLaunched}
                    isPaused={isPaused}
                    onDataUpdate={setSimulationData}
                    onReset={handleReset}
                />
            </main>
        </div>
    );
};

export default App;