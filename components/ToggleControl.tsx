
import React from 'react';

interface ToggleControlProps {
    label: string;
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}

export const ToggleControl: React.FC<ToggleControlProps> = ({ label, enabled, onChange }) => {
    return (
        <label className="flex items-center justify-between cursor-pointer">
            <span className="text-slate-300 text-sm">{label}</span>
            <div className="relative">
                <input type="checkbox" className="sr-only" checked={enabled} onChange={(e) => onChange(e.target.checked)} />
                <div className={`block w-10 h-6 rounded-full transition-colors ${enabled ? 'bg-sky-500' : 'bg-slate-600'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${enabled ? 'translate-x-4' : ''}`}></div>
            </div>
        </label>
    );
};
