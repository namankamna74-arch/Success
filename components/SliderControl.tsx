
import React from 'react';

interface SliderControlProps {
    label: string;
    min: number;
    max: number;
    step: number;
    value: number;
    onChange: (value: number) => void;
    unit?: string;
}

export const SliderControl: React.FC<SliderControlProps> = ({ label, min, max, step, value, onChange, unit }) => {
    return (
        <div>
            <div className="flex justify-between items-center text-sm mb-1">
                <label className="text-slate-300">{label}</label>
                <span className="text-sky-400 font-mono bg-slate-700/50 px-2 py-0.5 rounded">{value.toFixed(unit === 'px' || unit === 'px/s' || unit === '°' || unit === 'px/s²' ? 0 : 2)}{unit}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer range-lg accent-sky-500"
                aria-label={label}
            />
        </div>
    );
};
